export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  shortcuts_enabled?: boolean;
  default_view?: 'inbox' | 'favorites' | 'projects' | 'collections';
  compact_cards?: boolean;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  preferences: UserPreferences;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          onboarding_completed?: boolean | null;
          preferences?: Json | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean | null;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean | null;
          preferences?: Json | null;
        };
        Relationships: [];
      };
      references: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string | null;
          domain: string | null;
          screenshot_url: string | null;
          image_storage_path: string | null;
          screenshot_status: 'none' | 'pending' | 'ready' | 'failed';
          source_type: 'url' | 'image' | 'both';
          original_file_name: string | null;
          notes_markdown: string;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          url?: string | null;
          domain?: string | null;
          screenshot_url?: string | null;
          image_storage_path?: string | null;
          screenshot_status?: 'none' | 'pending' | 'ready' | 'failed';
          source_type?: 'url' | 'image' | 'both';
          original_file_name?: string | null;
          notes_markdown?: string;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string | null;
          domain?: string | null;
          screenshot_url?: string | null;
          image_storage_path?: string | null;
          screenshot_status?: 'none' | 'pending' | 'ready' | 'failed';
          source_type?: 'url' | 'image' | 'both';
          original_file_name?: string | null;
          notes_markdown?: string;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reference_tags: {
        Row: {
          reference_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          reference_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          reference_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_references: {
        Row: {
          project_id: string;
          reference_id: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          reference_id: string;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          reference_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collection_references: {
        Row: {
          collection_id: string;
          reference_id: string;
          created_at: string;
        };
        Insert: {
          collection_id: string;
          reference_id: string;
          created_at?: string;
        };
        Update: {
          collection_id?: string;
          reference_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reference_code_snippets: {
        Row: {
          id: string;
          reference_id: string;
          user_id: string;
          title: string;
          language: string;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          reference_id: string;
          user_id: string;
          title: string;
          language?: string;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_id?: string;
          user_id?: string;
          title?: string;
          language?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reference_attachments: {
        Row: {
          id: string;
          reference_id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: string | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          reference_id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reference_id?: string;
          user_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: string | null;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
