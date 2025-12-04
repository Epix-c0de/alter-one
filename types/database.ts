
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      archdioceses: {
        Row: {
          id: string
          archdiocese_name: string
          coordinates: string | null
          created_at: string
        }
        Insert: {
          id?: string
          archdiocese_name: string
          coordinates?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          archdiocese_name?: string
          coordinates?: string | null
          created_at?: string
        }
        Relationships: []
      }
      hymns: {
        Row: {
          id: string
          title: string
          lyrics: string
          admin_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          lyrics: string
          admin_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          lyrics?: string
          admin_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hymns_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      livestreams: {
        Row: {
          id: string
          parish_id: string
          admin_id: string
          stream_url: string
          start_time: string
        }
        Insert: {
          id?: string
          parish_id: string
          admin_id: string
          stream_url: string
          start_time: string
        }
        Update: {
          id?: string
          parish_id?: string
          admin_id?: string
          stream_url?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestreams_parish_id_fkey"
            columns: ["parish_id"]
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestreams_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      local_churches: {
        Row: {
          id: string
          parish_id: string
          church_name: string
          assigned_code: string
          gps_coordinates: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parish_id: string
          church_name: string
          assigned_code: string
          gps_coordinates?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parish_id?: string
          church_name?: string
          assigned_code?: string
          gps_coordinates?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_churches_parish_id_fkey"
            columns: ["parish_id"]
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          }
        ]
      }
      local_church_id_requests: {
        Row: {
          id: string
          user_id: string
          message: string | null
          assigned_status: boolean
          processed_by_bot: boolean
          resolved_by_admin_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message?: string | null
          assigned_status?: boolean
          processed_by_bot?: boolean
          resolved_by_admin_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message?: string | null
          assigned_status?: boolean
          processed_by_bot?: boolean
          resolved_by_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_church_id_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_church_id_requests_resolved_by_admin_id_fkey"
            columns: ["resolved_by_admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      parishes: {
        Row: {
          id: string
          archdiocese_id: string
          parish_name: string
          latitude: number | null
          longitude: number | null
          radius_meters: number | null
          polygon_coordinates: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          archdiocese_id: string
          parish_name: string
          latitude?: number | null
          longitude?: number | null
          radius_meters?: number | null
          polygon_coordinates?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          archdiocese_id?: string
          parish_name?: string
          latitude?: number | null
          longitude?: number | null
          radius_meters?: number | null
          polygon_coordinates?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parishes_archdiocese_id_fkey"
            columns: ["archdiocese_id"]
            referencedRelation: "archdioceses"
            referencedColumns: ["id"]
          }
        ]
      }
      prayers: {
        Row: {
          id: string
          prayer_title: string
          prayer_text: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          prayer_title: string
          prayer_text: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          prayer_title?: string
          prayer_text?: string
          category?: string
          created_at?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          id: string
          title: string
          content: string
          sunday_date: string
          created_by_admin_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          sunday_date: string
          created_by_admin_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          sunday_date?: string
          created_by_admin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "readings_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rosary: {
        Row: {
          id: string
          title: string
          mysteries_text: string
          audio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          mysteries_text: string
          audio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          mysteries_text?: string
          audio?: string | null
          created_at?: string
        }
        Relationships: []
      }
      session_content_mappings: {
        Row: {
          id: string
          session_id: string
          content_type: 'reading' | 'song' | 'prayer' | 'announcement'
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          content_type: 'reading' | 'song' | 'prayer' | 'announcement'
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          content_type?: 'reading' | 'song' | 'prayer' | 'announcement'
          content_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_content_mappings_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          session_code: string
          latitude: number
          longitude: number
          radius: number
          parish_id: string
          local_church_id: string
          created_by: string
          created_at: string
          is_active: boolean
          title: string | null
          session_type: 'mass' | 'live' | 'meeting' | 'other' | null
          start_time: string | null
          end_time: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          session_code: string
          latitude: number
          longitude: number
          radius?: number
          parish_id: string
          local_church_id: string
          created_by: string
          created_at?: string
          is_active?: boolean
          title?: string | null
          session_type?: 'mass' | 'live' | 'meeting' | 'other' | null
          start_time?: string | null
          end_time?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          session_code?: string
          latitude?: number
          longitude?: number
          radius?: number
          parish_id?: string
          local_church_id?: string
          created_by?: string
          created_at?: string
          is_active?: boolean
          title?: string | null
          session_type?: 'mass' | 'live' | 'meeting' | 'other' | null
          start_time?: string | null
          end_time?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_parish_id_fkey"
            columns: ["parish_id"]
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_local_church_id_fkey"
            columns: ["local_church_id"]
            referencedRelation: "local_churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      songs: {
        Row: {
          id: string
          title: string
          lyrics: string
          audio_url: string | null
          youtube_id: string | null
          created_by_admin_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          lyrics: string
          audio_url?: string | null
          youtube_id?: string | null
          created_by_admin_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          lyrics?: string
          audio_url?: string | null
          youtube_id?: string | null
          created_by_admin_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      theme_settings: {
        Row: {
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          dark_mode_enabled: boolean
          app_name: string | null
          splash_image: string | null
          splash_video: string | null
        }
        Insert: {
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          dark_mode_enabled?: boolean
          app_name?: string | null
          splash_image?: string | null
          splash_video?: string | null
        }
        Update: {
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          dark_mode_enabled?: boolean
          app_name?: string | null
          splash_image?: string | null
          splash_video?: string | null
        }
        Relationships: []
      }
      updates: {
        Row: {
          id: string
          version: string
          changelog: string
          update_url: string
        }
        Insert: {
          id?: string
          version: string
          changelog: string
          update_url: string
        }
        Update: {
          id?: string
          version?: string
          changelog?: string
          update_url?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: string | null
          phone: string | null
          archdiocese_id: string | null
          parish_id: string | null
          local_church_id: string | null
          subscription_status: string | null
          subscription_expiry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: string | null
          phone?: string | null
          archdiocese_id?: string | null
          parish_id?: string | null
          local_church_id?: string | null
          subscription_status?: string | null
          subscription_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string | null
          phone?: string | null
          archdiocese_id?: string | null
          parish_id?: string | null
          local_church_id?: string | null
          subscription_status?: string | null
          subscription_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_archdiocese_id_fkey"
            columns: ["archdiocese_id"]
            referencedRelation: "archdioceses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_local_church_id_fkey"
            columns: ["local_church_id"]
            referencedRelation: "local_churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_parish_id_fkey"
            columns: ["parish_id"]
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
