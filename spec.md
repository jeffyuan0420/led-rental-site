# Persona Taiwan LED 廣告機租賃網站 — 完整規格書

**版本：** 1.0  
**日期：** 2026-04-21  
**負責人：** 開發總監  

---

## 1. 專案概覽

### 目標
讓客戶自助了解 LED 廣告機產品、模擬拼接效果、試算費用、並線上預約租賃。

### 技術棧
| 層級 | 技術 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| i18n | next-intl (zh-TW / en) |
| DB + Auth | Supabase (free tier) |
| Deployment | Vercel (free tier) |
| Image Simulator | Fabric.js |
| Calendar UI | react-datepicker |

---

## 2. 頁面結構

```
/                        首頁（Hero + 產品亮點 + CTA）
/products                產品介紹（單面機 vs 三折雙面機規格比較）
/simulator               拼接視覺模擬器（Fabric.js）
/calculator              費用試算器
/booking                 預約表單（日期區間 + 聯絡資訊）
/admin                   後台入口（重導到 /admin/login）
/admin/login             管理員登入
/admin/bookings          預訂管理（日曆總覽 + 清單）
```

---

## 3. 前台功能規格

### 3.1 首頁 `/`
- Hero 區塊：大標題 + 背景圖 + 兩個 CTA（「了解產品」→ /products，「立即預約」→ /booking）
- 產品亮點：3 個 icon card（高亮度戶外適用、拼接靈活、全程協助）
- LINE@ 詢購按鈕（固定浮動於右下角）
- 語言切換按鈕（zh-TW / en）

### 3.2 產品介紹 `/products`
- 兩款產品並排卡片：
  - **單面機** 640×1920mm（直立式）
  - **三折雙面機**（折疊展開）
- 每款顯示：尺寸、亮度、IP 防護等級、適用場景
- 產品實際圖片佔位（`/public/images/` 目錄，待 Jeff 提供）
- 底部 CTA → /simulator 或 /booking

### 3.3 拼接視覺模擬器 `/simulator`
- 台數選擇：1 / 2 / 3 台（Radio button）
- 上傳圖片按鈕（accept: image/*）
- Canvas 區域：Fabric.js 渲染
  - 1 台：640×1920 比例框
  - 2 台：1280×1920（橫向拼接）
  - 3 台：1920×1920（橫向拼接）
- 圖片上傳後自動填滿框架並裁切至比例
- 框架邊框保持可見（LED 縫隙視覺效果）
- 「下載預覽圖」按鈕（canvas.toDataURL）

### 3.4 費用試算器 `/calculator`
- 輸入欄位：
  - 台數（1 / 2 / 3）
  - 租賃天數（number input，min: 1）
  - 選配：設定協助（checkbox）→ 費用：**[PLACEHOLDER: Jeff 填入]**
  - 運費（固定，非偏遠山區）→ 費用：**[PLACEHOLDER: Jeff 填入]**
- 費率表（Jeff 填入）：
  ```
  const RATES = {
    1: { daily: PLACEHOLDER_1T },   // 1 台日租費
    2: { daily: PLACEHOLDER_2T },   // 2 台日租費
    3: { daily: PLACEHOLDER_3T },   // 3 台日租費
    setup: PLACEHOLDER_SETUP,       // 設定協助費
    shipping: PLACEHOLDER_SHIPPING, // 運費（單趟）
  }
  ```
- 即時計算：台數 × 天數 × 日租費 + 設定協助費（勾選時）+ 運費×2（來回）
- 結果顯示：小計拆項 + 總計
- 底部 CTA → /booking

### 3.5 預約表單 `/booking`
- **日期區間選擇器**（react-datepicker）
  - 已被預訂的日期自動 disable（從 Supabase 讀取 bookings）
  - 最小可選日期：明天
- **聯絡資訊欄位**
  - 姓名（必填）
  - 公司名稱（選填）
  - 電話（必填）
  - Email（必填）
- **租賃選項**
  - 產品類型：單面機 / 三折雙面機
  - 台數：1 / 2 / 3
  - 是否需要設定協助（checkbox）
  - 備註（textarea）
- 送出：寫入 Supabase `bookings` table
- 送出成功：顯示確認訊息 + 提示「我們將於 1 工作天內與您確認」

---

## 4. 後台功能規格

### 4.1 管理員登入 `/admin/login`
- Supabase Auth（email + password）
- 登入成功 → redirect to `/admin/bookings`
- 未登入訪問 `/admin/*` → redirect to `/admin/login`

### 4.2 日曆總覽 `/admin/bookings`
- 月曆視圖：顯示所有已預訂日期區間（色塊標示）
- 清單視圖：表格顯示所有預訂
  - 欄位：姓名、公司、電話、Email、產品、台數、起訖日期、備註、建立時間
- 點擊日曆色塊 → 展開該預訂完整資訊
- 登出按鈕

---

## 5. 資料庫 Schema

### Supabase SQL

```sql
-- bookings 表
CREATE TABLE bookings (
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

-- RLS 策略
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 公開讀取已預訂日期（前台日曆用）
CREATE POLICY "public_read_dates" ON bookings
  FOR SELECT
  USING (true);

-- 只有 authenticated 用戶可以 insert（前台用 service role key 繞過）
-- 注意：前台表單用 supabase anon key，需要開放 INSERT
CREATE POLICY "public_insert" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- 只有 authenticated 管理員可以 UPDATE/DELETE
CREATE POLICY "admin_all" ON bookings
  FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## 6. i18n 鍵值（next-intl）

| key | zh-TW | en |
|-----|-------|----|
| nav.home | 首頁 | Home |
| nav.products | 產品介紹 | Products |
| nav.simulator | 拼接模擬 | Simulator |
| nav.calculator | 費用試算 | Calculator |
| nav.booking | 預約租賃 | Book Now |
| hero.title | LED 廣告機租賃 | LED Display Rental |
| hero.subtitle | 靈活租賃，最大化您的展示效益 | Flexible rental for maximum visual impact |
| product.single | 單面直立機 | Single-Side Display |
| product.triple | 三折雙面機 | Triple-Fold Double-Side Display |

---

## 7. 環境變數（.env.local）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # [PLACEHOLDER: Jeff 填入]
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # [PLACEHOLDER: Jeff 填入]
SUPABASE_SERVICE_ROLE_KEY=         # [PLACEHOLDER: Jeff 填入 — 只用於後端 API]

# LINE@
NEXT_PUBLIC_LINE_OA_URL=           # [PLACEHOLDER: Jeff 填入 LINE@ 連結]
```

---

## 8. Placeholder 清單（Jeff 需填入）

| 項目 | 位置 | 說明 |
|------|------|------|
| 1 台日租費 | `app/calculator/page.tsx` RATES.1.daily | 例：2500（元/天） |
| 2 台日租費 | `app/calculator/page.tsx` RATES.2.daily | 例：4500（元/天） |
| 3 台日租費 | `app/calculator/page.tsx` RATES.3.daily | 例：6000（元/天） |
| 設定協助費 | `app/calculator/page.tsx` RATES.setup | 例：1500（一次性） |
| 運費（來程） | `app/calculator/page.tsx` RATES.shipping | 例：800（單趟） |
| LINE@ 連結 | `.env.local` NEXT_PUBLIC_LINE_OA_URL | LINE@ URL |
| Supabase URL | `.env.local` | Supabase 專案 URL |
| Supabase Anon Key | `.env.local` | Supabase anon key |
| Supabase Service Role Key | `.env.local` | Supabase service role key（server-side 用） |
| 產品圖片 | `public/images/` | single.jpg、triple.jpg |

---

## 9. 後續開發工時估算

| 階段 | 工作項目 | 估計工時 |
|------|---------|---------|
| Phase 1 | Supabase 建表 + RLS + Auth 設定 | 2h |
| Phase 2 | 前台 UI 完整實作（Layout + Nav + 首頁 + 產品頁） | 6h |
| Phase 3 | Fabric.js 模擬器完整功能 | 4h |
| Phase 4 | 費用試算器（Jeff 填入費率後） | 2h |
| Phase 5 | 預約表單 + Supabase 整合 + 日曆 disable 邏輯 | 4h |
| Phase 6 | 後台管理（登入 + 日曆總覽 + 清單） | 4h |
| Phase 7 | i18n 完整翻譯 + 語言切換 | 3h |
| Phase 8 | RWD 調整 + 部署 Vercel | 2h |
| **合計** | | **~27h** |
