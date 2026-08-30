/**
 * Hand-maintained for now. Once the schema is applied to a live project,
 * regenerate with:
 *   npx supabase gen types typescript --linked > src/lib/database.types.ts
 */

export type EquipmentCategory =
  | 'cable'
  | 'plate-loaded'
  | 'selectorized'
  | 'cardio'
  | 'free-weight'
  | 'rack';

export type Equipment = {
  id: string;
  slug: string;
  display_name: string;
  aliases: string[];
  category: EquipmentCategory;
  primary_muscles: string[];
  description: string | null;
  how_to_setup: string | null;
  common_mistakes: string[];
  difficulty: number | null;
  is_active: boolean;
}

export type Exercise = {
  id: string;
  source: string;
  source_id: string | null;
  name: string;
  video_url: string | null;
  image_url: string | null;
  instructions: string[];
  target_muscles: string[];
  body_parts: string[];
  raw: unknown;
  fetched_at: string;
}

export type MediaKind = 'walkthrough' | 'exercise-demo' | 'form-tip';

export type MediaSource =
  | 'youtube'
  | 'free-exercise-db'
  | 'exercisedb'
  | 'musclewiki'
  | 'manual';

export type EquipmentMedia = {
  id: string;
  equipment_id: string;
  exercise_id: string | null;
  kind: MediaKind;
  source: MediaSource;
  source_id: string | null;
  url: string | null;
  title: string;
  attribution: string | null;
  duration_s: number | null;
  rank: number;
  is_active: boolean;
  created_at: string;
};

export type Scan = {
  id: string;
  user_id: string | null;
  image_path: string | null;
  equipment_id: string | null;
  confidence: number | null;
  alternatives: unknown;
  model: string | null;
  latency_ms: number | null;
  was_correct: boolean | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: Equipment;
        Insert: Partial<Equipment>;
        Update: Partial<Equipment>;
        Relationships: [];
      };
      exercise: {
        Row: Exercise;
        Insert: Partial<Exercise>;
        Update: Partial<Exercise>;
        Relationships: [];
      };
      equipment_exercise: {
        Row: {
          equipment_id: string;
          exercise_id: string;
          rank: number;
          is_beginner: boolean;
          curated_by: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: 'equipment_exercise_equipment_id_fkey';
            columns: ['equipment_id'];
            isOneToOne: false;
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'equipment_exercise_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercise';
            referencedColumns: ['id'];
          },
        ];
      };
      equipment_media: {
        Row: EquipmentMedia;
        Insert: Partial<EquipmentMedia>;
        Update: Partial<EquipmentMedia>;
        Relationships: [
          {
            foreignKeyName: 'equipment_media_equipment_id_fkey';
            columns: ['equipment_id'];
            isOneToOne: false;
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          },
        ];
      };
      scan: {
        Row: Scan;
        Insert: Partial<Scan>;
        Update: Partial<Scan>;
        Relationships: [
          {
            foreignKeyName: 'scan_equipment_id_fkey';
            columns: ['equipment_id'];
            isOneToOne: false;
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
