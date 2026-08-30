import type { EquipmentMedia, MediaSource } from './models';

/**
 * Resolving media to something playable.
 *
 * Every media row carries a `source` and either a `source_id` or a `url`. This
 * module is the only place that knows how to turn that pair into something the
 * app can render — so adding a provider is one entry in RESOLVERS, and swapping
 * which provider wins is a `rank` change in the database rather than a code
 * change at all.
 */

export type Playable =
  | { type: 'youtube'; videoId: string; title: string; attribution: string | null }
  | { type: 'image'; uri: string; title: string; attribution: string | null }
  | { type: 'video'; uri: string; title: string; attribution: string | null };

type Resolver = (media: EquipmentMedia) => Playable | null;

const VIDEO_EXT = /\.(mp4|mov|webm|m4v)(\?|$)/i;

/** Direct URLs are classified by extension; GIFs render as images. */
function fromUrl(media: EquipmentMedia): Playable | null {
  if (!media.url) return null;
  const base = {
    title: media.title,
    attribution: media.attribution,
  };
  return VIDEO_EXT.test(media.url)
    ? { type: 'video', uri: media.url, ...base }
    : { type: 'image', uri: media.url, ...base };
}

const RESOLVERS: Record<MediaSource, Resolver> = {
  // Played through the official IFrame player — embedding is permitted,
  // downloading and re-hosting is not.
  youtube: (m) =>
    m.source_id
      ? { type: 'youtube', videoId: m.source_id, title: m.title, attribution: m.attribution }
      : null,

  // These all hand over a direct URL at ingest time.
  'free-exercise-db': fromUrl,
  exercisedb: fromUrl,

  // MuscleWiki forbids caching its video, so a row here stores a URL resolved
  // at view time rather than anything persisted.
  musclewiki: fromUrl,

  manual: (m) => (m.source_id ? RESOLVERS.youtube(m) : fromUrl(m)),
};

export function resolveMedia(media: EquipmentMedia): Playable | null {
  // `source` is a CHECK-constrained text column, so it arrives typed as string.
  // An unrecognised value means the database knows a provider this build does
  // not — fall through to the next ranked row rather than throwing.
  const resolver = RESOLVERS[media.source as MediaSource];
  if (!resolver) return null;
  try {
    return resolver(media);
  } catch {
    return null;
  }
}

/**
 * Resolves a ranked list to the first playable entry.
 *
 * Rows arrive ordered by rank, so an unresolvable top choice — a provider we no
 * longer support, a malformed row — silently yields to the next instead of
 * leaving the user with an empty screen.
 */
export function resolveBest(list: EquipmentMedia[]): Playable | null {
  for (const media of list) {
    const playable = resolveMedia(media);
    if (playable) return playable;
  }
  return null;
}

/** Every playable in rank order, for screens that show a list. */
export function resolveAll(list: EquipmentMedia[]): Playable[] {
  return list.map(resolveMedia).filter((p): p is Playable => p !== null);
}
