export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bills_payments: {
        Row: {
          amount: number
          bill_type: string
          commission: number
          created_at: string | null
          id: string
        }
        Insert: {
          amount: number
          bill_type: string
          commission: number
          created_at?: string | null
          id?: string
        }
        Update: {
          amount?: number
          bill_type?: string
          commission?: number
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          amount_owed: number
          created_at: string | null
          customer_name: string
          id: string
          is_paid: boolean | null
          items: Json
          paid_date: string | null
        }
        Insert: {
          amount_owed: number
          created_at?: string | null
          customer_name: string
          id?: string
          is_paid?: boolean | null
          items: Json
          paid_date?: string | null
        }
        Update: {
          amount_owed?: number
          created_at?: string | null
          customer_name?: string
          id?: string
          is_paid?: boolean | null
          items?: Json
          paid_date?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      gcash_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          kita: number
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          kita: number
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          kita?: number
          transaction_type?: string
        }
        Relationships: []
      }
      load_sales: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          kita: number
          network: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          kita: number
          network: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          kita?: number
          network?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          login_at: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          login_at?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          login_at?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          id: string
          product_name: string
          product_size: string | null
          product_type: string
          puhunan_each: number
          puhunan_per_pack: number
          quantity_per_pack: number
          selling_price: number
          stock: number
          tubo: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_name: string
          product_size?: string | null
          product_type: string
          puhunan_each: number
          puhunan_per_pack: number
          quantity_per_pack?: number
          selling_price: number
          stock?: number
          tubo: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_name?: string
          product_size?: string | null
          product_type?: string
          puhunan_each?: number
          puhunan_per_pack?: number
          quantity_per_pack?: number
          selling_price?: number
          stock?: number
          tubo?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string | null
          id: string
          payment_method: string | null
          product_id: string | null
          quantity: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          quantity: number
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          quantity?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
