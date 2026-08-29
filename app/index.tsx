import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScanHistory } from '@/lib/queries';
import { colors, radius, space, type } from '@/theme';

export default function Home() {
  const router = useRouter();
  const { data: history } = useScanHistory();

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.hero}>
        <Text style={type.title}>What's this machine?</Text>
        <Text style={[type.muted, { marginTop: space(2) }]}>
          Point your camera at any piece of gym equipment and find out what it is, what it works,
          and how to use it.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() => router.push('/scan')}
      >
        <Text style={styles.ctaText}>Scan equipment</Text>
      </Pressable>

      {!!history?.length && (
        <View style={styles.section}>
          <Text style={type.label}>MACHINES YOU'VE MET</Text>
          <FlatList
            data={history}
            keyExtractor={(item: any) => item.id}
            style={{ marginTop: space(3) }}
            renderItem={({ item }: any) =>
              item.equipment ? (
                <Link href={`/equipment/${item.equipment.slug}`} asChild>
                  <Pressable style={styles.row}>
                    <Text style={type.body}>{item.equipment.display_name}</Text>
                    <Text style={type.muted}>›</Text>
                  </Pressable>
                </Link>
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space(6) },
  hero: { marginTop: space(6) },
  cta: {
    marginTop: space(8),
    backgroundColor: colors.accent,
    paddingVertical: space(4.5),
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: { color: colors.accentText, fontSize: 16, fontWeight: '600' },
  section: { flex: 1, marginTop: space(10) },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
