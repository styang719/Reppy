import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import type { Playable } from '@/lib/media';
import { colors, radius, space, type } from '@/theme';

/**
 * Renders whatever the resolver handed back.
 *
 * YouTube goes through the official IFrame player, which is what their terms
 * require — the video is never downloaded or re-hosted.
 */
export function MediaPlayer({ playable }: { playable: Playable }) {
  const { width } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // 16:9 inside the screen's horizontal padding.
  const playerWidth = width - space(12);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  if (failed) {
    return (
      <View style={[styles.frame, { height: playerHeight }]}>
        <Text style={type.muted}>This demo couldn&apos;t load.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {playable.type === 'youtube' ? (
        <View style={[styles.frame, { height: playerHeight }]}>
          {!ready && <ActivityIndicator color={colors.accent} style={StyleSheet.absoluteFill} />}
          <YoutubePlayer
            height={playerHeight}
            width={playerWidth}
            videoId={playable.videoId}
            onReady={() => setReady(true)}
            onError={() => setFailed(true)}
            initialPlayerParams={{ modestbranding: true, rel: false }}
          />
        </View>
      ) : (
        <Image
          source={{ uri: playable.uri }}
          style={[styles.frame, { height: playerHeight }]}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      )}

      <Text style={styles.title}>{playable.title}</Text>
      {!!playable.attribution && <Text style={type.muted}>{playable.attribution}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space(6) },
  frame: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.body, fontWeight: '600', marginTop: space(2.5) },
});
