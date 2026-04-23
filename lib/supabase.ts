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
  quantity: number
  event_start_date: string | null
  event_end_date: string | null
  start_date: string
  end_date: string
  setup_option: 'none' | 'half' | 'full'
  teardown_time: 'daytime' | 'night'
  invoice_type: 'personal' | 'company'
  invoice_company: string | null
  invoice_tax_id: string | null
  invoice_address: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}
