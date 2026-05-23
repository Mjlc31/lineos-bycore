export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      academy_progress: {
        Row: {
          id: string
          user_id: string | null
          video_id: string
          watched_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          video_id: string
          watched_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          video_id?: string
          watched_at?: string | null
        }
        Relationships: []
      }
      academy_trilhas: {
        Row: {
          created_at: string | null
          duration: string
          id: number
          image_url: string | null
          lessons: Json | null
          sort_order: number | null
          title: string
          total_videos: number | null
        }
        Insert: {
          created_at?: string | null
          duration: string
          id: number
          image_url?: string | null
          lessons?: Json | null
          sort_order?: number | null
          title: string
          total_videos?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: string
          id?: number
          image_url?: string | null
          lessons?: Json | null
          sort_order?: number | null
          title?: string
          total_videos?: number | null
        }
        Relationships: []
      }
      automations: {
        Row: {
          actions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger: Json
        }
        Insert: {
          actions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger: Json
        }
        Update: {
          actions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger?: Json
        }
        Relationships: []
      }
      client_statuses: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          assignees: string[] | null
          created_at: string | null
          faturamento: string | null
          id: string
          name: string
          repositorio: string | null
          segmento: string | null
          status_id: string
          ultima_reuniao: string | null
          updated_at: string | null
        }
        Insert: {
          assignees?: string[] | null
          created_at?: string | null
          faturamento?: string | null
          id?: string
          name: string
          repositorio?: string | null
          segmento?: string | null
          status_id: string
          ultima_reuniao?: string | null
          updated_at?: string | null
        }
        Update: {
          assignees?: string[] | null
          created_at?: string | null
          faturamento?: string | null
          id?: string
          name?: string
          repositorio?: string | null
          segmento?: string | null
          status_id?: string
          ultima_reuniao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "client_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_feedbacks: {
        Row: {
          author: string
          content_item_id: number
          created_at: string | null
          date: string
          id: string
          text: string
        }
        Insert: {
          author: string
          content_item_id: number
          created_at?: string | null
          date: string
          id?: string
          text: string
        }
        Update: {
          author?: string
          content_item_id?: number
          created_at?: string | null
          date?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_feedbacks_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_groups: {
        Row: {
          client_name: string
          created_at: string | null
          id: string
          share_token: string
          status: string
          task_ids: string[] | null
          title: string
        }
        Insert: {
          client_name: string
          created_at?: string | null
          id?: string
          share_token: string
          status?: string
          task_ids?: string[] | null
          title: string
        }
        Update: {
          client_name?: string
          created_at?: string | null
          id?: string
          share_token?: string
          status?: string
          task_ids?: string[] | null
          title?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          caption: string | null
          client_email: string | null
          color: string | null
          created_at: string | null
          date: string
          feedback: string | null
          file_url: string | null
          id: number
          post_channels: string[] | null
          post_date: string | null
          post_format: string | null
          post_time: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["content_status"]
          text_color: string | null
          thumbnail: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          client_email?: string | null
          color?: string | null
          created_at?: string | null
          date: string
          feedback?: string | null
          file_url?: string | null
          id?: never
          post_channels?: string[] | null
          post_date?: string | null
          post_format?: string | null
          post_time?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          text_color?: string | null
          thumbnail?: string | null
          title: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          client_email?: string | null
          color?: string | null
          created_at?: string | null
          date?: string
          feedback?: string | null
          file_url?: string | null
          id?: never
          post_channels?: string[] | null
          post_date?: string | null
          post_format?: string | null
          post_time?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          text_color?: string | null
          thumbnail?: string | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      course_tracks: {
        Row: {
          duration: string
          id: number
          img: string
          title: string
          videos: number
        }
        Insert: {
          duration: string
          id: number
          img: string
          title: string
          videos: number
        }
        Update: {
          duration?: string
          id?: number
          img?: string
          title?: string
          videos?: number
        }
        Relationships: []
      }
      crm_columns: {
        Row: {
          color: string
          created_at: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          attachments: Json | null
          column_id: string
          created_at: string | null
          date: string
          id: string
          pipeline_id: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
          value: number
        }
        Insert: {
          attachments?: Json | null
          column_id: string
          created_at?: string | null
          date: string
          id?: string
          pipeline_id?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          value?: number
        }
        Update: {
          attachments?: Json | null
          column_id?: string
          created_at?: string | null
          date?: string
          id?: string
          pipeline_id?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "vw_crm_pipeline"
            referencedColumns: ["column_id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          columns: Json
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          columns?: Json
          created_at?: string
          id: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          columns?: Json
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          color: string
          created_at: string | null
          emoji: string
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          emoji: string
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          emoji?: string
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tasks: {
        Row: {
          created_at: string
          done: boolean
          due_date: string | null
          due_time: string | null
          id: string
          lead_id: string
          title: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          due_time?: string | null
          id?: string
          lead_id: string
          title: string
        }
        Update: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          due_time?: string | null
          id?: string
          lead_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          completed: boolean | null
          content: string | null
          duration: string | null
          id: string
          title: string
          track_id: number | null
          type: string
          video_url: string | null
        }
        Insert: {
          completed?: boolean | null
          content?: string | null
          duration?: string | null
          id: string
          title: string
          track_id?: number | null
          type: string
          video_url?: string | null
        }
        Update: {
          completed?: boolean | null
          content?: string | null
          duration?: string | null
          id?: string
          title?: string
          track_id?: number | null
          type?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "course_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          client: string | null
          created_at: string | null
          date: string
          id: number
          is_today: boolean | null
          platform: string | null
          sort_order: number | null
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client?: string | null
          created_at?: string | null
          date: string
          id?: never
          is_today?: boolean | null
          platform?: string | null
          sort_order?: number | null
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client?: string | null
          created_at?: string | null
          date?: string
          id?: never
          is_today?: boolean | null
          platform?: string | null
          sort_order?: number | null
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      rh_profiles: {
        Row: {
          avatar_url: string | null
          cost_per_day: number | null
          cost_per_hour: number | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          pix_key: string | null
          role: string
          skills: string[] | null
          type_contract: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cost_per_day?: number | null
          cost_per_hour?: number | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          pix_key?: string | null
          role: string
          skills?: string[] | null
          type_contract?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cost_per_day?: number | null
          cost_per_hour?: number | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          pix_key?: string | null
          role?: string
          skills?: string[] | null
          type_contract?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_event_assignees: {
        Row: {
          event_id: string
          user_id: string
        }
        Insert: {
          event_id: string
          user_id: string
        }
        Update: {
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_event_assignees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "scheduled_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_event_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_events: {
        Row: {
          assignees: string[] | null
          client_name: string | null
          created_at: string | null
          date: string
          description: string | null
          end_time: string | null
          event_type_id: string
          id: string
          meet_link: string | null
          recurrence: string | null
          reminder: string | null
          time: string
          title: string
        }
        Insert: {
          assignees?: string[] | null
          client_name?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          end_time?: string | null
          event_type_id: string
          id?: string
          meet_link?: string | null
          recurrence?: string | null
          reminder?: string | null
          time: string
          title: string
        }
        Update: {
          assignees?: string[] | null
          client_name?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          end_time?: string | null
          event_type_id?: string
          id?: string
          meet_link?: string | null
          recurrence?: string | null
          reminder?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color: string
          id: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_activities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          task_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          task_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          task_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          task_id: string
          user_id: string
        }
        Insert: {
          task_id: string
          user_id: string
        }
        Update: {
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          id: string
          name: string
          size: number | null
          task_id: string
          type: string
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          name: string
          size?: number | null
          task_id: string
          type?: string
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          name?: string
          size?: number | null
          task_id?: string
          type?: string
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_avatar: string
          author_name: string
          content: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_avatar: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_avatar?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_statuses: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      task_subtasks: {
        Row: {
          completed: boolean | null
          id: string
          task_id: string | null
          title: string
        }
        Insert: {
          completed?: boolean | null
          id: string
          task_id?: string | null
          title: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          bg_color: string
          color: string
          id: string
          name: string
          task_id: string | null
        }
        Insert: {
          bg_color: string
          color: string
          id?: string
          name: string
          task_id?: string | null
        }
        Update: {
          bg_color?: string
          color?: string
          id?: string
          name?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignees: string[] | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          is_timer_running: boolean | null
          name: string
          priority: Database["public"]["Enums"]["task_priority"]
          sort_order: number | null
          status_id: string
          subtasks: Json | null
          tags: Json | null
          time_spent: number | null
          updated_at: string | null
        }
        Insert: {
          assignees?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_timer_running?: boolean | null
          name: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number | null
          status_id: string
          subtasks?: Json | null
          tags?: Json | null
          time_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          assignees?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_timer_running?: boolean | null
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number | null
          status_id?: string
          subtasks?: Json | null
          tags?: Json | null
          time_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "task_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          id: number
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string | null
          date: string
          id?: never
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          id?: never
          title?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_content_summary: {
        Row: {
          count: number | null
          status: Database["public"]["Enums"]["content_status"] | null
        }
        Relationships: []
      }
      vw_crm_pipeline: {
        Row: {
          column_id: string | null
          column_title: string | null
          lead_count: number | null
          sort_order: number | null
          total_value: number | null
        }
        Relationships: []
      }
      vw_financial_summary: {
        Row: {
          net_profit: number | null
          total_expense_count: number | null
          total_expenses: number | null
          total_income_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_team_member: { Args: never; Returns: boolean }
    }
    Enums: {
      content_status: "PENDENTE" | "REVISÃO" | "APROVADO"
      content_type: "video" | "image" | "pdf"
      task_priority: "Urgent" | "High" | "Normal" | "Low" | "None"
      transaction_type: "income" | "expense"
      user_role: "ADMIN" | "EQUIPE" | "CLIENTE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: ["PENDENTE", "REVISÃO", "APROVADO"],
      content_type: ["video", "image", "pdf"],
      task_priority: ["Urgent", "High", "Normal", "Low", "None"],
      transaction_type: ["income", "expense"],
      user_role: ["ADMIN", "EQUIPE", "CLIENTE"],
    },
  },
} as const
