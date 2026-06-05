export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clasificaciones: {
        Row: {
          created_at: string
          descripcion: string | null
          divisa_id: number
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          divisa_id: number
          id?: never
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          divisa_id?: number
          id?: never
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "clasificaciones_divisa_id_fkey"
            columns: ["divisa_id"]
            isOneToOne: false
            referencedRelation: "divisas"
            referencedColumns: ["id"]
          },
        ]
      }
      cupos: {
        Row: {
          created_at: string
          cupo: number
          deficit: number
          divisa_codigo: string
          excedente: number
          exceso: number
          id: number
          monto_asegurado: number
          unidad_id: number
        }
        Insert: {
          created_at?: string
          cupo?: number
          deficit?: number
          divisa_codigo: string
          excedente?: number
          exceso?: number
          id?: never
          monto_asegurado?: number
          unidad_id: number
        }
        Update: {
          created_at?: string
          cupo?: number
          deficit?: number
          divisa_codigo?: string
          excedente?: number
          exceso?: number
          id?: never
          monto_asegurado?: number
          unidad_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cupos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cupos_atm: {
        Row: {
          atm_id: number
          created_at: string
          cupo: number
          deficit: number
          divisa_codigo: string
          exceso: number
          id: number
          monto_asegurado: number
          unidad_id: number
          updated_at: string
        }
        Insert: {
          atm_id: number
          created_at?: string
          cupo?: number
          deficit?: number
          divisa_codigo: string
          exceso?: number
          id?: never
          monto_asegurado?: number
          unidad_id: number
          updated_at?: string
        }
        Update: {
          atm_id?: number
          created_at?: string
          cupo?: number
          deficit?: number
          divisa_codigo?: string
          exceso?: number
          id?: never
          monto_asegurado?: number
          unidad_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      denominaciones: {
        Row: {
          activo: boolean
          codigo_bc: string | null
          created_at: string
          divisa_id: number
          id: number
          peso: number
          tipo: string
          valor: number
        }
        Insert: {
          activo?: boolean
          codigo_bc?: string | null
          created_at?: string
          divisa_id: number
          id?: never
          peso?: number
          tipo: string
          valor: number
        }
        Update: {
          activo?: boolean
          codigo_bc?: string | null
          created_at?: string
          divisa_id?: number
          id?: never
          peso?: number
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "denominaciones_divisa_id_fkey"
            columns: ["divisa_id"]
            isOneToOne: false
            referencedRelation: "divisas"
            referencedColumns: ["id"]
          },
        ]
      }
      divisas: {
        Row: {
          abreviatura: string
          activo: boolean
          codigo: string
          created_at: string
          divisa_base: boolean
          fecha_actualizacion_tasa: string | null
          id: number
          nacional: boolean
          nombre: string
          tipo_cambio: number
          tipo_cambio_modo: string
          updated_at: string
        }
        Insert: {
          abreviatura: string
          activo?: boolean
          codigo: string
          created_at?: string
          divisa_base?: boolean
          fecha_actualizacion_tasa?: string | null
          id?: never
          nacional?: boolean
          nombre: string
          tipo_cambio?: number
          tipo_cambio_modo?: string
          updated_at?: string
        }
        Update: {
          abreviatura?: string
          activo?: boolean
          codigo?: string
          created_at?: string
          divisa_base?: boolean
          fecha_actualizacion_tasa?: string | null
          id?: never
          nacional?: boolean
          nombre?: string
          tipo_cambio?: number
          tipo_cambio_modo?: string
          updated_at?: string
        }
        Relationships: []
      }
      maestro_clasificaciones: {
        Row: {
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      marcas_atm: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      modelos_atm: {
        Row: {
          activo: boolean
          cantidad_cajetines_default: number | null
          created_at: string
          cupo_default_divisa_base: number | null
          descripcion: string | null
          id: number
          marca_id: number
          nombre: string
          remoto: boolean | null
        }
        Insert: {
          activo?: boolean
          cantidad_cajetines_default?: number | null
          created_at?: string
          cupo_default_divisa_base?: number | null
          descripcion?: string | null
          id?: never
          marca_id: number
          nombre: string
          remoto?: boolean | null
        }
        Update: {
          activo?: boolean
          cantidad_cajetines_default?: number | null
          created_at?: string
          cupo_default_divisa_base?: number | null
          descripcion?: string | null
          id?: never
          marca_id?: number
          nombre?: string
          remoto?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_atm_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas_atm"
            referencedColumns: ["id"]
          },
        ]
      }
      personal: {
        Row: {
          activo: boolean
          cedula: string
          created_at: string
          firma_url: string | null
          foto_url: string | null
          id: number
          nombre: string
          nro_carnet: string | null
          numero_identificacion: string
          primer_apellido: string
          primer_nombre: string
          segundo_apellido: string | null
          segundo_nombre: string | null
          tipo_identificacion: string
          transportista_id: number
        }
        Insert: {
          activo?: boolean
          cedula: string
          created_at?: string
          firma_url?: string | null
          foto_url?: string | null
          id?: never
          nombre: string
          nro_carnet?: string | null
          numero_identificacion?: string
          primer_apellido?: string
          primer_nombre?: string
          segundo_apellido?: string | null
          segundo_nombre?: string | null
          tipo_identificacion?: string
          transportista_id: number
        }
        Update: {
          activo?: boolean
          cedula?: string
          created_at?: string
          firma_url?: string | null
          foto_url?: string | null
          id?: never
          nombre?: string
          nro_carnet?: string | null
          numero_identificacion?: string
          primer_apellido?: string
          primer_nombre?: string
          segundo_apellido?: string | null
          segundo_nombre?: string | null
          tipo_identificacion?: string
          transportista_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_transportista_id_fkey"
            columns: ["transportista_id"]
            isOneToOne: false
            referencedRelation: "transportistas"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_unidad: {
        Row: {
          abreviatura: string
          activo: boolean
          clasificacion: string
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          abreviatura?: string
          activo?: boolean
          clasificacion?: string
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre: string
        }
        Update: {
          abreviatura?: string
          activo?: boolean
          clasificacion?: string
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      transportistas: {
        Row: {
          activo: boolean
          contacto: string | null
          correo: string | null
          created_at: string
          direccion: string | null
          id: number
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          contacto?: string | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: never
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          contacto?: string | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: never
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unidades: {
        Row: {
          activo: boolean
          area_contable: string | null
          clasificacion: string
          codigo_central: string
          created_at: string
          direccion: string | null
          id: number
          nombre: string
          oficina_contable: string | null
          telefono: string | null
          tipo_unidad_id: number
          transportista_id: number | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          area_contable?: string | null
          clasificacion: string
          codigo_central: string
          created_at?: string
          direccion?: string | null
          id?: never
          nombre: string
          oficina_contable?: string | null
          telefono?: string | null
          tipo_unidad_id: number
          transportista_id?: number | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          area_contable?: string | null
          clasificacion?: string
          codigo_central?: string
          created_at?: string
          direccion?: string | null
          id?: never
          nombre?: string
          oficina_contable?: string | null
          telefono?: string | null
          tipo_unidad_id?: number
          transportista_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_tipo_unidad_id_fkey"
            columns: ["tipo_unidad_id"]
            isOneToOne: false
            referencedRelation: "tipos_unidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_transportista_id_fkey"
            columns: ["transportista_id"]
            isOneToOne: false
            referencedRelation: "transportistas"
            referencedColumns: ["id"]
          },
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
    Enums: {},
  },
} as const
