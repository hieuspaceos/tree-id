/**
 * TypeScript types matching the marketplace database schema.
 * Manually defined to match 001_marketplace_schema.sql.
 * Regenerate via: npx supabase gen types typescript --project-id <id>
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string
          avatar_url: string | null
          phone: string | null
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          locale?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          locale?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          short_description: string | null
          category: string
          price_vnd: number
          price_usd: number
          currency: string
          status: string
          cover_image: string | null
          gallery: Json
          features: Json
          metadata: Json
          landing_slug: string | null
          download_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          slug: string
          title: string
          category: string
          description?: string | null
          short_description?: string | null
          price_vnd?: number
          price_usd?: number
          currency?: string
          status?: string
          cover_image?: string | null
          gallery?: Json
          features?: Json
          metadata?: Json
          landing_slug?: string | null
          download_url?: string | null
        }
        Update: {
          slug?: string
          title?: string
          category?: string
          description?: string | null
          short_description?: string | null
          price_vnd?: number
          price_usd?: number
          currency?: string
          status?: string
          cover_image?: string | null
          gallery?: Json
          features?: Json
          metadata?: Json
          landing_slug?: string | null
          download_url?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: string
          total_vnd: number
          total_usd: number
          payment_method: string | null
          payment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_number: string
          user_id: string
          total_vnd: number
          total_usd?: number
          status?: string
          payment_method?: string | null
          payment_id?: string | null
          notes?: string | null
        }
        Update: {
          status?: string
          total_vnd?: number
          total_usd?: number
          payment_method?: string | null
          payment_id?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          price_vnd: number
          price_usd: number
          quantity: number
        }
        Insert: {
          order_id: string
          product_id: string
          price_vnd: number
          price_usd?: number
          quantity?: number
        }
        Update: {
          price_vnd?: number
          price_usd?: number
          quantity?: number
        }
      }
      licenses: {
        Row: {
          id: string
          user_id: string
          product_id: string
          order_id: string
          license_key: string
          status: string
          activated_at: string
          expires_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: string
          order_id: string
          license_key: string
          status?: string
          expires_at?: string | null
          metadata?: Json
        }
        Update: {
          status?: string
          expires_at?: string | null
          metadata?: Json
        }
      }
      payment_events: {
        Row: {
          id: string
          order_id: string | null
          provider: string
          event_type: string
          payload: Json
          created_at: string
        }
        Insert: {
          provider: string
          event_type: string
          payload: Json
          order_id?: string | null
        }
        Update: never
      }
    }
  }
}
