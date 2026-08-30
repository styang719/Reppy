/**
 * GENERATED FILE — do not edit.
 *
 * Regenerate with:  npm run db:types
 *
 * Application-facing aliases live in `models.ts`, because anything written here
 * is destroyed on the next generation.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          aliases: string[];
          category: string;
          primary_muscles: string[];
          description: string | null;
          how_to_setup: string | null;
          common_mistakes: string[];
          difficulty: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          display_name: string;
          aliases?: string[];
          category: string;
          primary_muscles?: string[];
          description?: string | null;
          how_to_setup?: string | null;
          common_mistakes?: string[];
          difficulty?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          display_name?: string;
          aliases?: string[];
          category?: string;
          primary_muscles?: string[];
          description?: string | null;
          how_to_setup?: string | null;
          common_mistakes?: string[];
          difficulty?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      exercise: {
        Row: {
          id: string;
          source: string;
          source_id: string | null;
          name: string;
          video_url: string | null;
          image_url: string | null;
          instructions: string[];
          target_muscles: string[];
          body_parts: string[];
          raw: Json | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          source?: string;
          source_id?: string | null;
          name: string;
          video_url?: string | null;
          image_url?: string | null;
          instructions?: string[];
          target_muscles?: string[];
          body_parts?: string[];
          raw?: Json | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          source_id?: string | null;
          name?: string;
          video_url?: string | null;
          image_url?: string | null;
          instructions?: string[];
          target_muscles?: string[];
          body_parts?: string[];
          raw?: Json | null;
          fetched_at?: string;
        };
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
        Insert: {
          equipment_id: string;
          exercise_id: string;
          rank?: number;
          is_beginner?: boolean;
          curated_by?: string;
        };
        Update: {
          equipment_id?: string;
          exercise_id?: string;
          rank?: number;
          is_beginner?: boolean;
          curated_by?: string;
        };
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
        Row: {
          id: string;
          equipment_id: string;
          exercise_id: string | null;
          kind: string;
          source: string;
          source_id: string | null;
          url: string | null;
          title: string;
          attribution: string | null;
          duration_s: number | null;
          rank: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          exercise_id?: string | null;
          kind: string;
          source: string;
          source_id?: string | null;
          url?: string | null;
          title: string;
          attribution?: string | null;
          duration_s?: number | null;
          rank?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          exercise_id?: string | null;
          kind?: string;
          source?: string;
          source_id?: string | null;
          url?: string | null;
          title?: string;
          attribution?: string | null;
          duration_s?: number | null;
          rank?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'equipment_media_equipment_id_fkey';
            columns: ['equipment_id'];
            isOneToOne: false;
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'equipment_media_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercise';
            referencedColumns: ['id'];
          },
        ];
      };
      scan: {
        Row: {
          id: string;
          user_id: string | null;
          image_path: string | null;
          equipment_id: string | null;
          confidence: number | null;
          alternatives: Json | null;
          model: string | null;
          latency_ms: number | null;
          was_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          image_path?: string | null;
          equipment_id?: string | null;
          confidence?: number | null;
          alternatives?: Json | null;
          model?: string | null;
          latency_ms?: number | null;
          was_correct?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          image_path?: string | null;
          equipment_id?: string | null;
          confidence?: number | null;
          alternatives?: Json | null;
          model?: string | null;
          latency_ms?: number | null;
          was_correct?: boolean | null;
          created_at?: string;
        };
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
      workout: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      workout_set: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string | null;
          equipment_id: string | null;
          set_index: number;
          weight_kg: number | null;
          reps: number | null;
          rpe: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id?: string | null;
          equipment_id?: string | null;
          set_index: number;
          weight_kg?: number | null;
          reps?: number | null;
          rpe?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string | null;
          equipment_id?: string | null;
          set_index?: number;
          weight_kg?: number | null;
          reps?: number | null;
          rpe?: number | null;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_set_workout_id_fkey';
            columns: ['workout_id'];
            isOneToOne: false;
            referencedRelation: 'workout';
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
