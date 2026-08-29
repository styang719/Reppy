import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { identifyEquipment } from '@/lib/identify';
import { colors, radius, space, type } from '@/theme';

/**
 * Below this, we show a disambiguation picker instead of asserting an answer.
 * Tune against real `scan` rows — a wrong confident answer costs more trust
 * than an honest "is it one of these?".
 */
const CONFIDENCE_THRESHOLD = 0.6;

export default function ScanScreen() {
  const router = useRouter();
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={type.heading}>Camera access needed</Text>
        <Text style={[type.muted, styles.centerText]}>
          Reppy identifies equipment from a photo, so it needs your camera.
        </Text>
        <Pressable style={styles.cta} onPress={requestPermission}>
          <Text style={styles.ctaText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  async function capture() {
    if (busy || !camera.current) return;
    setBusy(true);
    setError(null);

    try {
      const photo = await camera.current.takePictureAsync({ skipProcessing: true });
      if (!photo?.uri) throw new Error('Capture failed');

      const result = await identifyEquipment(photo.uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!result.equipment_slug) {
        setError("Couldn't tell what that is. Try getting the whole machine in frame.");
        return;
      }

      router.replace({
        pathname: '/equipment/[slug]',
        params: {
          slug: result.equipment_slug,
          scanId: result.scan_id ?? '',
          confidence: String(result.confidence),
          alternatives: result.alternatives.join(','),
          uncertain: result.confidence < CONFIDENCE_THRESHOLD ? '1' : '',
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />

      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {busy ? 'Identifying…' : 'Fit the whole machine in the frame'}
          </Text>
        </View>

        {!!error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={[styles.shutter, busy && styles.shutterBusy]}
          onPress={capture}
          disabled={busy}
          accessibilityLabel="Take photo"
        >
          {busy ? <ActivityIndicator color={colors.bg} /> : <View style={styles.shutterInner} />}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: space(6),
  },
  centerText: { marginTop: space(2), textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: space(8) },
  hint: {
    position: 'absolute',
    top: space(6),
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: space(4),
    paddingVertical: space(2.5),
    borderRadius: radius.pill,
  },
  hintText: { color: '#fff', fontSize: 13 },
  error: {
    backgroundColor: colors.danger,
    padding: space(3.5),
    borderRadius: radius.md,
    marginBottom: space(5),
    marginHorizontal: space(6),
  },
  errorText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  shutterBusy: { opacity: 0.7 },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  cta: {
    marginTop: space(6),
    backgroundColor: colors.accent,
    paddingHorizontal: space(8),
    paddingVertical: space(3.5),
    borderRadius: radius.pill,
  },
  ctaText: { color: colors.accentText, fontWeight: '600' },
});
