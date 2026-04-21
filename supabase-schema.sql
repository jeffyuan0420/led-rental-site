-- ============================================================
-- Persona Taiwan LED 租賃網站 — Supabase Schema
-- 請複製此 SQL，貼到 Supabase Dashboard > SQL Editor 執行
-- ============================================================

-- bookings 表
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('single', 'triple')),
  quantity INTEGER NOT NULL CHECK (quantity IN (1, 2, 3)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  add_setup BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 公開讀取（前台取得已預訂日期，用於 disable 日曆）
CREATE POLICY "public_read_bookings"
  ON bookings FOR SELECT
  USING (true);

-- 公開新增（前台預約表單送出）
CREATE POLICY "public_insert_bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- 只有 authenticated 用戶可以 UPDATE / DELETE（後台管理員）
CREATE POLICY "admin_update_bookings"
  ON bookings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete_bookings"
  ON bookings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 索引（加速日期查詢）
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bookings_dates
  ON bookings (start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings (status);

-- ============================================================
-- 測試資料（可選，測試完刪除）
-- ============================================================

-- INSERT INTO bookings (name, company, phone, email, product_type, quantity, start_date, end_date, add_setup, status)
-- VALUES
--   ('測試客戶A', '測試公司', '0912000001', 'test@test.com', 'single', 1, '2026-05-01', '2026-05-03', false, 'confirmed'),
--   ('測試客戶B', NULL, '0912000002', 'test2@test.com', 'triple', 2, '2026-05-10', '2026-05-12', true, 'pending');
