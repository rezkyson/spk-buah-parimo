export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      komoditas: {
        Row: {
          id: string;
          nama: string;
          nama_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          nama_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          nama_en?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      produksi: {
        Row: {
          id: string;
          komoditas_id: string;
          tahun: number;
          nilai: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          komoditas_id: string;
          tahun: number;
          nilai: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          komoditas_id?: string;
          tahun?: number;
          nilai?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produksi_komoditas_id_fkey";
            columns: ["komoditas_id"];
            referencedRelation: "komoditas";
            referencedColumns: ["id"];
          }
        ];
      };
      kriteria: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          tipe: "benefit" | "cost";
          bobot: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kode: string;
          nama: string;
          tipe?: "benefit" | "cost";
          bobot: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          kode?: string;
          nama?: string;
          tipe?: "benefit" | "cost";
          bobot?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      hasil_wp: {
        Row: {
          id: string;
          komoditas_id: string;
          nilai_s: number;
          nilai_v: number;
          peringkat: number;
          bobot_snapshot: Json;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          komoditas_id: string;
          nilai_s: number;
          nilai_v: number;
          peringkat: number;
          bobot_snapshot: Json;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          komoditas_id?: string;
          nilai_s?: number;
          nilai_v?: number;
          peringkat?: number;
          bobot_snapshot?: Json;
          calculated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hasil_wp_komoditas_id_fkey";
            columns: ["komoditas_id"];
            referencedRelation: "komoditas";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
