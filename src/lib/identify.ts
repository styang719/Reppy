import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

/**
 * Long-edge target for the image we send to the vision model.
 *
 * A 12MP camera original is ~4000px wide and costs far more image tokens than
 * a gym machine needs to be recognisable, so some downscaling is worthwhile.
 *
 * 768px was too aggressive: combined with the model's own tiling it left too
 * little detail to separate machines that differ only in pad placement or arm
 * path. 1024px matches the tile grid the model uses at high detail and costs
 * nothing extra in tokens over 768.
 */
const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;

export interface IdentifyResult {
  equipment_slug: string | null;
  confidence: number;
  alternatives: string[];
  scan_id: string | null;
}

/** Downscales and re-encodes a captured photo, returning raw base64 JPEG. */
export async function prepareImage(uri: string): Promise<string> {
  const context = ImageManipulator.ImageManipulator.manipulate(uri).resize({ width: MAX_EDGE });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) throw new Error('Failed to encode image');
  return result.base64;
}

/**
 * Sends a photo for identification.
 *
 * The image goes as inline base64 rather than being uploaded to Storage first —
 * the upload would add a round trip to the critical path for no benefit. The
 * Edge Function persists the photo asynchronously on its side.
 */
export async function identifyEquipment(imageUri: string): Promise<IdentifyResult> {
  const base64 = await prepareImage(imageUri);

  const { data, error } = await supabase.functions.invoke<IdentifyResult>('identify-equipment', {
    body: { image_base64: base64 },
  });

  if (error) throw error;
  if (!data) throw new Error('No response from identify-equipment');
  return data;
}

/** Records whether the identification was right, for accuracy measurement. */
export async function recordScanFeedback(scanId: string, wasCorrect: boolean) {
  await supabase.from('scan').update({ was_correct: wasCorrect }).eq('id', scanId);
}
