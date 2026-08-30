import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { Equipment, EquipmentMedia, Exercise, MediaKind } from './models';

export function useEquipment(slug: string | null) {
  return useQuery({
    queryKey: ['equipment', slug],
    enabled: !!slug,
    queryFn: async (): Promise<Equipment> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data as Equipment;
    },
  });
}

export function useEquipmentExercises(equipmentId: string | null) {
  return useQuery({
    queryKey: ['equipment-exercises', equipmentId],
    enabled: !!equipmentId,
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase
        .from('equipment_exercise')
        .select('rank, is_beginner, exercise(*)')
        .eq('equipment_id', equipmentId!)
        .order('rank', { ascending: true });
      if (error) throw error;
      return (data ?? []).flatMap((row: any) => (row.exercise ? [row.exercise as Exercise] : []));
    },
  });
}

/** Equipment the user has already scanned — the "machines I've met" list. */
export function useScanHistory() {
  return useQuery({
    queryKey: ['scan-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan')
        .select('id, created_at, confidence, equipment(*)')
        .not('equipment_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllEquipment() {
  return useQuery({
    queryKey: ['equipment-all'],
    queryFn: async (): Promise<Equipment[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      if (error) throw error;
      return (data ?? []) as Equipment[];
    },
  });
}

/** Ranked media for a machine. `kind` narrows to walkthroughs or demos. */
export function useEquipmentMedia(equipmentId: string | null, kind?: MediaKind) {
  return useQuery({
    queryKey: ['equipment-media', equipmentId, kind ?? 'all'],
    enabled: !!equipmentId,
    queryFn: async (): Promise<EquipmentMedia[]> => {
      let q = supabase
        .from('equipment_media')
        .select('*')
        .eq('equipment_id', equipmentId!)
        .eq('is_active', true);

      if (kind) q = q.eq('kind', kind);

      const { data, error } = await q.order('rank', { ascending: true });
      if (error) throw error;
      return (data ?? []) as EquipmentMedia[];
    },
  });
}
