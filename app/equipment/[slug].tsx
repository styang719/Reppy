import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEquipment, useEquipmentExercises } from '@/lib/queries';
import { recordScanFeedback } from '@/lib/identify';
import { colors, radius, space, type } from '@/theme';

export default function EquipmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    slug: string;
    scanId?: string;
    confidence?: string;
    alternatives?: string;
    uncertain?: string;
  }>();

  const { data: equipment, isLoading, error } = useEquipment(params.slug ?? null);
  const { data: exercises } = useEquipmentExercises(equipment?.id ?? null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const alternatives = params.alternatives ? params.alternatives.split(',').filter(Boolean) : [];
  const uncertain = params.uncertain === '1';

  async function markWrong() {
    if (params.scanId) await recordScanFeedback(params.scanId, false);
    setFeedbackGiven(true);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error || !equipment) {
    return (
      <View style={styles.center}>
        <Text style={type.heading}>Not in the catalog yet</Text>
        <Text style={[type.muted, { marginTop: space(2), textAlign: 'center' }]}>
          We don't have "{params.slug}" yet. It's on the list.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: equipment.display_name }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {uncertain && !feedbackGiven && (
          <View style={styles.uncertain}>
            <Text style={styles.uncertainText}>
              Not fully sure about this one — does it look right?
            </Text>
            <View style={styles.uncertainActions}>
              <Pressable onPress={() => setFeedbackGiven(true)} style={styles.chip}>
                <Text style={styles.chipText}>Yes</Text>
              </Pressable>
              <Pressable onPress={markWrong} style={styles.chip}>
                <Text style={styles.chipText}>No</Text>
              </Pressable>
            </View>
          </View>
        )}

        {feedbackGiven && !!alternatives.length && (
          <View style={styles.altBox}>
            <Text style={type.label}>DID YOU MEAN</Text>
            {alternatives.map((slug) => (
              <Pressable
                key={slug}
                style={styles.altRow}
                onPress={() => router.replace({ pathname: '/equipment/[slug]', params: { slug } })}
              >
                <Text style={type.body}>{slug.replace(/-/g, ' ')}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={type.title}>{equipment.display_name}</Text>

        <View style={styles.tags}>
          {equipment.primary_muscles.map((m) => (
            <View key={m} style={styles.tag}>
              <Text style={styles.tagText}>{m}</Text>
            </View>
          ))}
        </View>

        {!!equipment.description && (
          <Text style={[type.body, { marginTop: space(5) }]}>{equipment.description}</Text>
        )}

        {!!equipment.how_to_setup && (
          <Section title="SETTING IT UP">
            <Text style={type.body}>{equipment.how_to_setup}</Text>
          </Section>
        )}

        {!!equipment.common_mistakes?.length && (
          <Section title="COMMON MISTAKES">
            {equipment.common_mistakes.map((m) => (
              <View key={m} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[type.body, { flex: 1 }]}>{m}</Text>
              </View>
            ))}
          </Section>
        )}

        <Section title="EXERCISES YOU CAN DO">
          {exercises?.length ? (
            exercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={styles.exerciseRow}
                onPress={() => ex.video_url && Linking.openURL(ex.video_url)}
              >
                <Text style={type.body}>{ex.name}</Text>
                {!!ex.video_url && <Text style={styles.watch}>Watch</Text>}
              </Pressable>
            ))
          ) : (
            <Text style={type.muted}>
              No exercises linked yet — run the ExerciseDB ingest to populate these.
            </Text>
          )}
        </Section>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: space(8) }}>
      <Text style={type.label}>{title}</Text>
      <View style={{ marginTop: space(3) }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space(6), paddingBottom: space(16) },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: space(6),
  },
  uncertain: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: space(4),
    marginBottom: space(6),
  },
  uncertainText: { ...type.body, fontSize: 14 },
  uncertainActions: { flexDirection: 'row', gap: space(2), marginTop: space(3) },
  chip: {
    paddingHorizontal: space(5),
    paddingVertical: space(2),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  altBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: space(4),
    marginBottom: space(6),
  },
  altRow: { paddingVertical: space(3) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginTop: space(3) },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
    borderRadius: radius.sm,
  },
  tagText: { color: colors.textMuted, fontSize: 12 },
  bullet: { flexDirection: 'row', gap: space(2), marginBottom: space(2) },
  bulletDot: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space(3.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  watch: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
