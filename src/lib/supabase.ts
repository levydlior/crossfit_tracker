import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string | null
        }
      }
      workout_types: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          description: string | null
          units: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          description?: string | null
          units?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          description?: string | null
          units?: string | null
          created_at?: string | null
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_type_id: string
          date: string
          score_value: number | null
          percentage: number | null
          notes: string | null
          rx: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_type_id: string
          date?: string
          score_value?: number | null
          percentage?: number | null
          notes?: string | null
          rx?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_type_id?: string
          date?: string
          score_value?: number | null
          percentage?: number | null
          notes?: string | null
          rx?: boolean | null
          created_at?: string | null
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          workout_type_id: string
          pr_value: number
          achieved_date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_type_id: string
          pr_value: number
          achieved_date?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_type_id?: string
          pr_value?: number
          achieved_date?: string
          created_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
      stripe_user_orders: {
        Row: {
          customer_id: string | null
          order_id: number | null
          checkout_session_id: string | null
          payment_intent_id: string | null
          amount_subtotal: number | null
          amount_total: number | null
          currency: string | null
          payment_status: string | null
          order_status: string | null
          order_date: string | null
        }
      }
    }
  }
}