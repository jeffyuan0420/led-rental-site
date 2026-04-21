import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Booking = {
  id: string
  name: string
  company: string | null
  phone: string
  email: string
  product_type: 'single' | 'triple'
  quantity: 1 | 2 | 3
  start_date: string
  end_date: string
  add_setup: boolean
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}
