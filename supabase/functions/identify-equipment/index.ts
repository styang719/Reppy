/**
 * identify-equipment
 *
 * Takes a base64 JPEG, asks a vision model which piece of gym equipment it
 * shows, and returns a slug from our own catalog.
 *
 * Two things worth understanding before changing this:
 *
 * 1. The model is constrained to an enum built from the `equipment` table at
 *    request time. It cannot invent a name. Free-text output would give us
 *    "lat pulldown machine" / "Lat Pull-Down" / "pulldown" for one machine and
 *    nothing would join to our content.
 *
 * 2. The photo is persisted after the response is computed, not before. The
 *    upload is not on the critical path — the user is waiting.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = Deno.env.get('VISION_MODEL') ?? 'gpt-4o-mini';

/** Max scans per user per hour. A leaked endpoint without a cap is a bill. */
const RATE_LIMIT_PER_HOUR = 60;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You identify gym equipment in photographs for an app that helps beginners.

You will be given a photo taken inside a gym and a list of known equipment slugs.
Choose the single slug that best matches the main piece of equipment in the photo.

Rules:
- Only ever return a slug from the provided list.
- If the photo shows no gym equipment, is too blurry or dark to judge, or shows
  something not in the list, return null for equipment_slug with low confidence.
- confidence reflects how sure you are: 0.9+ means unmistakable, below 0.6 means
  you are guessing between similar machines.
- Put genuinely plausible runner-up slugs in alternatives, closest first.
  Machines that look alike (lat pulldown vs. seated cable row) belong here.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return json({ error: 'Server is not configured for identification yet.' }, 503);
  }

  // Identify the caller from their JWT, then act as them for RLS-guarded reads.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Invalid session' }, 401);

  const userId = userData.user.id;

  let body: { image_base64?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }

  const imageBase64 = body.image_base64;
  if (!imageBase64) return json({ error: 'image_base64 is required' }, 400);

  // Roughly 4/3 bytes per base64 char; reject oversized payloads before we
  // spend a model call on them.
  if (imageBase64.length > 8_000_000) {
    return json({ error: 'Image too large — downscale before sending.' }, 413);
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin
    .from('scan')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', hourAgo);

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'Too many scans this hour. Try again shortly.' }, 429);
  }

  // ── Build the closed set the model must classify into ─────────────────────
  const { data: equipment, error: equipmentError } = await admin
    .from('equipment')
    .select('id, slug, display_name, aliases')
    .eq('is_active', true);

  if (equipmentError || !equipment?.length) {
    console.error('Failed to load equipment catalog', equipmentError);
    return json({ error: 'Equipment catalog unavailable' }, 500);
  }

  const slugs = equipment.map((e) => e.slug);
  const catalogForPrompt = equipment
    .map((e) => `- ${e.slug}: ${e.display_name}${e.aliases?.length ? ` (also called: ${e.aliases.join(', ')})` : ''}`)
    .join('\n');

  const startedAt = Date.now();

  let parsed: { equipment_slug: string | null; confidence: number; alternatives: string[] };
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Known equipment:\n${catalogForPrompt}` },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' },
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'equipment_identification',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                equipment_slug: { type: ['string', 'null'], enum: [...slugs, null] },
                confidence: { type: 'number' },
                alternatives: { type: 'array', items: { type: 'string', enum: slugs } },
              },
              required: ['equipment_slug', 'confidence', 'alternatives'],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('OpenAI error', response.status, detail);
      return json({ error: 'Identification failed. Please try again.' }, 502);
    }

    const completion = await response.json();
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Vision call threw', err);
    return json({ error: 'Identification failed. Please try again.' }, 502);
  }

  const latencyMs = Date.now() - startedAt;

  // Defend against a slug that somehow escaped the enum.
  const match = equipment.find((e) => e.slug === parsed.equipment_slug);

  // ── Persist. The user already has their answer; none of this blocks them. ──
  const scanId = crypto.randomUUID();
  const imagePath = `${userId}/${scanId}.jpg`;

  const persist = (async () => {
    const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const { error: uploadError } = await admin.storage
      .from('scans')
      .upload(imagePath, bytes, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) console.error('Scan photo upload failed', uploadError);

    const { error: insertError } = await admin.from('scan').insert({
      id: scanId,
      user_id: userId,
      image_path: uploadError ? null : imagePath,
      equipment_id: match?.id ?? null,
      confidence: parsed.confidence,
      alternatives: parsed.alternatives ?? [],
      model: MODEL,
      latency_ms: latencyMs,
    });

    if (insertError) console.error('Scan insert failed', insertError);
  })();

  // Keep the function alive for the write without making the client wait.
  // @ts-ignore EdgeRuntime is provided by the Supabase runtime.
  if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(persist);

  return json({
    equipment_slug: match?.slug ?? null,
    confidence: parsed.confidence,
    alternatives: parsed.alternatives ?? [],
    scan_id: scanId,
  });
});
