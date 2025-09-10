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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      change_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          request_data: Json
          request_type: Database["public"]["Enums"]["change_request_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["change_request_status"]
          vendor_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          request_data: Json
          request_type: Database["public"]["Enums"]["change_request_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          vendor_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          request_data?: Json
          request_type?: Database["public"]["Enums"]["change_request_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: boolean
          category_id: string | null
          created_at: string
          description: string | null
          discount: number | null
          id: string
          image_url: string | null
          is_vegetarian: boolean | null
          name: string
          price: number
          quantity: number | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          availability?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          name: string
          price: number
          quantity?: number | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          availability?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          name?: string
          price?: number
          quantity?: number | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string
          created_at: string
          description: string | null
          google_maps_link: string | null
          google_rating_link: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          operating_hours: Json | null
          services_offered: string[] | null
          status: Database["public"]["Enums"]["shop_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          description?: string | null
          google_maps_link?: string | null
          google_rating_link?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          operating_hours?: Json | null
          services_offered?: string[] | null
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          description?: string | null
          google_maps_link?: string | null
          google_rating_link?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          operating_hours?: Json | null
          services_offered?: string[] | null
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          email: string
          id: string
          is_blocked: boolean
          owner_name: string | null
          shop_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_blocked?: boolean
          owner_name?: string | null
          shop_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_blocked?: boolean
          owner_name?: string | null
          shop_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_vendor: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_blocked: boolean
          shop_id: string
          vendor_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_product_availability: {
        Args: { new_availability: boolean; product_id: string }
        Returns: boolean
      }
    }
    Enums: {
      change_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "unified_update"
      change_request_type:
        | "shop_update"
        | "product_add"
        | "product_update"
        | "product_delete"
        | "unified_update"
      shop_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "vendor" | "customer"
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
      change_request_status: [
        "pending",
        "approved",
        "rejected",
        "unified_update",
      ],
      change_request_type: [
        "shop_update",
        "product_add",
        "product_update",
        "product_delete",
        "unified_update",
      ],
      shop_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "vendor", "customer"],
    },
  },
} as const
