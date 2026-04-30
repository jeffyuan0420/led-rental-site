# LED 租賃網站 — 開發日誌

> **維護規則：** 每次修改功能後，必須在此補上一筆記錄。格式：日期、版本號、變更項目、原因。
> 這份日誌是產品進化的歷史記錄，日後追蹤問題或回顧功能演進時的第一參考點。

---

## v1.0.9 — 2026-04-30：修正 Email 遺漏假日加成費用

**變更：**
- `app/api/notify-booking/route.ts`：
  - 補上 `getWeekendSurcharge` import
  - 費用計算加入 `weekendFee`（原本 subtotal 未含此項，導致 Email 金額低報）
  - 管理員通知 Email 新增假日加成明細列
  - 客戶確認 Email 新增假日加成明細列

**原因：**
- v1.0.8 加了前端假日加成計算，但 Email 路由未同步更新，造成確認信金額與表單顯示不一致

---

## v1.0.8 — 2026-04-29：週末假日加成（進/撤場日）

**變更：**
- `lib/pricing.ts`：新增 `RATES.weekendSurcharge = 2000`、`getWeekendSurcharge()` 函式
  - 進場日或撤場日為週六/日 → 每台 +2,000（未稅）
  - 同一天進出只算一次
- `app/booking/BookingClient.tsx`：費用摘要自動計算並顯示假日加成
- `messages/zh-TW.json` / `en.json`：新增 `summary_weekend_fee`；calculator `note` 加假日加成說明

**規則：**
- 進場日 = 週末 → +NT$2,000/台
- 撤場日 = 週末（且不同日） → +NT$2,000/台
- 費用試算頁無日期選擇，改在備註說明

## v1.0.7 — 2026-04-29：模擬器規格標籤英文化

**變更：**
- `messages/zh-TW.json` / `en.json`：新增 `spec_physical_size`、`spec_display_size`、`spec_max_units`、`spec_preview_scale`
- `app/simulator/SimulatorClient.tsx`：整機外觀尺寸/顯示尺寸/最多可拼接/預覽比例改用 `t()` 翻譯 key

**原因：**
- 英文版模擬器規格標籤仍顯示中文

---

## v1.0.6 — 2026-04-29：地址欄位 i18n（TaiwanAddressInput）

**變更：**
- `components/TaiwanAddressInput.tsx`：新增 `cityPlaceholder` / `districtPlaceholder` props
- `messages/zh-TW.json` + `messages/en.json`：新增 6 個地址相關翻譯 key
- `app/booking/BookingClient.tsx`：三處 TaiwanAddressInput 全部傳入翻譯 props

**原因：**
- 英文版預約表單縣市/鄉鎮市區/詳細地址欄位仍顯示中文 label 與 placeholder

---

## v1.0.5 — 2026-04-29：修正預約表單英文版缺漏翻譯

**變更：**
- `messages/zh-TW.json` + `messages/en.json`：新增 7 個翻譯 key
  - `id_number_label` / `id_number_hint` / `id_number_placeholder` / `id_number_required`
  - `contract_agree_text`（含 rich text `<link>` 插值）
  - `contract_agree_required` / `price_agree_required`
- `app/booking/BookingClient.tsx`：
  - 身分證欄位改用 `t()` key，英文版顯示「ID / Passport / ARC Number」
  - 契約同意文字改用 `t.rich()` 插入超連結
  - 所有 hardcode 中文錯誤提示改用翻譯 key

**原因：**
- 英文版預約表單身分證欄位與契約同意文字仍顯示中文

---

## v1.0.4 — 2026-04-29：更換 Logo + Navbar 改白底

**變更：**
- `public/logo.jpg`：更換為「盛源 PERSONA」新 Logo（藍紅斜槓 + 中英文字）
- `components/Navbar.tsx`：Navbar 由深色（bg-gray-900）改為白底（bg-white + border-b）
  - 所有連結文字由 text-gray-200 改為 text-gray-700
  - Active/hover 色保留黃色（text-yellow-500）
  - Logo 尺寸微調 h-9→h-10 / width 140→160

**原因：**
- 新 Logo 為深色文字設計，需搭配淺色背景才有對比

---

## v1.0.3 — 2026-04-29：預約表單新增費用確認勾選

**變更：**
- `app/booking/BookingClient.tsx`：費用摘要區塊新增「費用明細確認」checkbox
  - 含稅總金額直接嵌入 label（e.g. NT$ 15,750）
  - 未勾選不能送出，跳出錯誤提示
  - 只在日期已選（有可計算金額）時才出現

**原因：**
- 防止客戶事後爭議說試算金額與實際收費不同；主動勾選即構成明確確認記錄

---

## v1.0.2 — 2026-04-29：預約表單設定協助按鈕顯示價格

**變更：**
- `app/booking/BookingClient.tsx`：半天/整天按鈕新增動態價格顯示
  - 1~5 台（1 人）：半天 NT$3,000 / 整天 NT$4,500
  - 6~10 台（2 人）：半天 NT$6,000 / 整天 NT$9,000
  - 與費用試算頁行為一致

**原因：**
- 客戶需求：預約表單的設定協助選項需標示未稅價格，方便客戶判斷

---

## v1.0.1 — 2026-04-27：北區業務名單更新 + 加權隨機分配

**變更：**
- `Navbar.tsx`：北區 SALES_REPS 更新
  - `0968970633` 改為 `marscsknight`
  - 新增 4 人：0980381600、hsiang860711、0968601499、0908008619
  - 加權陣列：原本 3 人各出現 2 次（各 20%），新增 4 人各出現 1 次（各 10%）

**原因：**
- 北區業務擴編至 7 人，新成員抽中機率調低

---

## v1.0.0 — 2026-04-27：模擬器影片顯示修正 + 新影片上傳

**變更：**
- `public/videos/`：更換 demo-robot.mp4（22MB）、demo-triple-car.mp4（25MB）
- `SimulatorClient.tsx`：影片渲染改為 `object-fit: cover` + `object-position: center bottom`
  - 永遠填滿容器、維持原始比例、從中心裁切、底部 logo 不被吃掉

**原因：**
- 舊影片非全景尺寸，選少台數時黑畫面；新方式無論幾台都不變形

---

## v0.9.9 — 2026-04-27：修正拼接比例說明 + 模擬器新增機型切換

**變更：**
- `DimensionDiagram.tsx`：修正 aspect ratio 標籤
  - 單面/兩折機 × 3台：「比16:9更寬」→「接近 1:1」（實際 1992×1920 ≈ 1.04:1）
  - 三折雙面機 × 2台：「比16:9更寬」→「4:3」（實際 2560×1920 = 精確 4:3）
  - 三折雙面機 × 3台：「超寬幕 2:1」保留（實際 3840×1920 = 精確 2:1，正確）
- `SimulatorClient.tsx`：模擬器新增機型切換 toggle，可直接在頁面內切換單面/兩折機或三折雙面機，無需返回上一頁
- 新增 i18n keys：`config_ratio_near_1_1`、`config_ratio_4_3`、`simulator.type_label`

**原因：**
- 客戶反映比例說明不符實際，且模擬器切換機型需要返回上一頁體驗差

---

## v0.9.6 — 2026-04-27：庫存調整 + 付款截止邏輯改為租賃日前 N 個工作天

**變更：**
- `app/booking/BookingClient.tsx`：單面機庫存上限 24 → 20
- `lib/payment.ts`：`paymentDeadlineDays` 3 → 5；新增 `subtractWorkingDays` 函數
- `app/api/notify-booking/route.ts`：截止日改算「`start_date` 前 5 個工作天」；信件文案同步更新
- `app/api/confirm-booking/route.ts`：同上
- `app/admin/bookings/AdminBookingsClient.tsx`：補寄確認信預覽截止日同步改算法

**原因：**
- 2026-04-27 開會確認：單面機實際庫存 20 台（原 24 台）
- 標準預約付款截止改為「租賃日前 5 個工作天確認匯款」（原為「送單後 3 個工作天」）

---

## v0.9.8 — 2026-04-27：夜間撤場時間標準改為 17:00

**變更：**
- `messages/zh-TW.json`、`messages/en.json`：所有 19:00 → 17:00
- `lib/pricing.ts`：注解更新
- `app/api/notify-booking/route.ts`、`app/api/confirm-booking/route.ts`：信件內時段更新
- `app/admin/bookings/AdminBookingsClient.tsx`：後台預覽更新

**原因：**
- 2026-04-27 開會決議：標準撤場改為 17:00，17:00 後計夜間加成

---

## v0.9.7 — 2026-04-27：前台「標準預約」工作天文案 2→5（i18n）

**變更：**
- `messages/zh-TW.json`：`policy_std_highlight` "2 個工作天" → "5 個工作天"
- `messages/en.json`：`policy_std_highlight` "2 business days" → "5 business days"

**原因：**
- v0.9.6 漏改前台靜態文案（i18n 翻譯檔），補齊與後端邏輯一致

---

## v0.1.0 — 2026-04-21：專案初始化 + 基礎架構

**建立內容：**
- Next.js 14 (App Router) + TypeScript + Tailwind CSS 專案骨架
- next-intl i18n 設定（zh-TW / en 雙語）
- Supabase client 設定（`lib/supabase.ts`、`lib/supabase-server.ts`）
- 首頁 Hero + Feature Cards + 快速導覽
- 產品介紹頁（單面機 vs 三折雙面機規格並排）
- 產品圖片加入（`public/images/single.png`、`triple.png`）
- Navbar + LineButton 浮動按鈕元件

**原因：** 專案從零開始建立，確立技術棧與頁面結構。

---

## v0.2.0 — 2026-04-21：核心功能頁面

**建立內容：**
- `/simulator`：Fabric.js 拼接視覺模擬器（1/2/3 台切換、圖片上傳、比例框渲染、下載預覽圖）
- `/calculator`：費用試算器（產品類型選擇、台數加減、天數輸入、設定協助/運費選項、即時計算）
- `/booking`：預約表單（react-datepicker 日期區間、聯絡資訊欄位、Supabase 寫入）
- `/admin/login`：管理員登入（Supabase Auth）
- `/admin/bookings`：後台管理（月曆視圖 + 清單視圖）
- `lib/pricing.ts`：費率設定（單面 15,000 / 三折 18,000 元/台，含 3-4 天）

**原因：** 建立完整功能頁面，讓客戶可以自助試算、預約，管理員可查看預訂。

---

## v0.3.0 — 2026-04-21：庫存可用性查詢

**變更：**
- 新增 `/api/check-availability` 或前端庫存查詢邏輯
- 預約表單加入庫存查核，避免重複預訂同一時段

**原因：** 防止客戶選到已滿的日期，提升預約準確性。

---

## v0.3.1 — 2026-04-21：文案修正（戶外→室內）

**變更：**
- 首頁功能卡片文案從「戶外高亮度」改為「室內適用」
- 產品規格描述修正

**原因：** 產品實際為室內型 LED，對外文案需正確。

---

## v0.4.0 — 2026-04-22：Email 通知功能

**變更：**
- 新增 `/api/notify-booking/route.ts`：客戶送出預約後，自動發 Email 通知
- 發信方式歷經三次迭代：
  1. Resend.dev（無需域名驗證）→ 改為
  2. Nodemailer via jeff@persona.com.tw SMTP → 改為
  3. Gmail SMTP (smtp.gmail.com:587)（最終方案）
- 收件人：help@csknight.com

**原因：** 管理員需要即時收到新預訂通知，不能只靠後台查詢；SMTP 方案因域名/憑證問題多次調整，最終確定 Gmail SMTP 最穩定。

---

## v0.4.1 — 2026-04-22：i18n 完整翻譯 + 尺寸示意圖

**變更：**
- 補齊所有頁面中英文翻譯鍵值（`messages/zh-TW.json`、`messages/en.json`）
- 新增 `DimensionDiagram` 元件：產品尺寸視覺示意圖

**原因：** 確保雙語功能完整，且產品規格需要視覺化輔助說明。

---

## v0.4.2 — 2026-04-22：試算器輸入體驗優化 + 長租提醒

**變更：**
- 試算器：天數輸入改為自由輸入（原本固定 1-3 台 radio），加入 +/- 按鈕
- 超過 5 天自動顯示「長租提醒」，引導至 LINE@ 聯繫業務報價
- 修正計算邏輯（數字邊界值保護）

**原因：** 客戶可能租超過 5 天（展覽布展），長租報價需要人工確認，不適合系統自動計算。

---

## v0.4.3 — 2026-04-22：i18n 文案微調（布展/撤場日期）

**變更：**
- 日期相關文案從「開始/結束」改為「布展日/撤場日」
- 運費說明文字更新

**原因：** 用業界習慣用語，讓客戶更清楚日期含義。

---

## v0.5.0 — 2026-04-22：後台管理功能強化

**變更：**
- 後台清單新增「估算費用」欄位（從 pricing lib 即時計算）
- 超過 5 天顯示「專案報價」
- 每筆預訂新增刪除按鈕（列表 + 詳情 modal 都有，附確認對話框）
- 一鍵匯出 CSV（含 BOM，Excel 開啟不亂碼）

**原因：** 管理員需要快速估算每筆預訂費用，並能刪除無效訂單；CSV 匯出方便與會計對帳。

---

## v0.5.1 — 2026-04-22：預約日曆日期邏輯修正

**變更：**
- `BookingClient.tsx`：`filterDate` 改為只封鎖今天以前的日期
- 庫存查詢改為呼叫 `checkAvailability` API（查詢實際已訂台數），不在 filterDate 內封鎖
- 試算器天數欄位加入提示文字（「請含布展及撤場天數」）

**原因：** 原本的 filterDate 實作會錯誤封鎖部分可用日期，導致客戶無法選到實際有庫存的日期。

---

## v0.5.2 — 2026-04-23：設定協助費結構化 + MAX_STANDARD_DAYS 統一

**變更：**
- `lib/pricing.ts`：`setup: 0` 改為 `setup: { halfDay: 3000, fullDay: 4500 }`（每人未稅）；`maxDays` 從 4 改為 5；新增 `getSetupPersons(qty)` 和 `getSetupFee(option, qty)`；`calculateTotal` 參數 `addSetup: boolean` 改為 `setupOption: 'none'|'half'|'full'`
- `app/calculator/CalculatorClient.tsx`：設定協助從 checkbox 改為三段按鈕（不需要/半天/整天），即時顯示建議人數和費用；`MAX_STANDARD_DAYS` 改為從 `RATES.maxDays` 讀取
- `app/booking/BookingClient.tsx`：設定協助同步改為三段按鈕；表單欄位 `add_setup` 改為 `setup_option`
- `lib/supabase.ts`：Booking type `add_setup: boolean` 改為 `setup_option: 'none'|'half'|'full'`
- `app/admin/bookings/AdminBookingsClient.tsx`：CSV 匯出、清單、詳情 modal 同步顯示「半天」/「整天」/「否」
- `app/api/notify-booking/route.ts`：Email 通知同步更新設定協助欄位
- `supabase-schema.sql`：`add_setup BOOLEAN` 改為 `setup_option TEXT CHECK ('none'|'half'|'full')`
- `messages/zh-TW.json` + `en.json`：新增 setup_option_label、setup_none/half/full、setup_persons_hint、setup_rate_hint

**原因：**
設定協助費需依台數給出建議人數（1~5台1人，6~10台2人），並讓客戶選半天或整天，而非只有是/否。同時修正兩個檔案 maxDays 不一致的 bug。

⚠️ **資料庫 Migration 需手動執行（Supabase）：**
```sql
ALTER TABLE bookings
  DROP COLUMN add_setup,
  ADD COLUMN setup_option TEXT DEFAULT 'none' CHECK (setup_option IN ('none', 'half', 'full'));
```

---

## v0.6.0 — 2026-04-23：活動日期兩層設計 + 夜間加成 + 發票選項

**變更：**
- `app/booking/BookingClient.tsx`：
  - 新增「活動日期」欄位（起/迄），自動帶入進場日（活動前1天）與撤場日（活動後1天），可手動覆蓋
  - 新增「預計撤場時間」兩段選擇：白天（20:00前）/ 夜間（20:00-22:00，加收服務費）
  - 新增「發票需求」：二聯式（個人）/ 三聯式（公司），選公司時展開公司抬頭、統一編號、發票地址欄位
- `lib/pricing.ts`：新增 `nightSurcharge: 2000`（PLACEHOLDER，Jeff 確認後修改）
- `lib/supabase.ts`：Booking type 新增 event_start_date, event_end_date, teardown_time, invoice_type, invoice_company, invoice_tax_id, invoice_address；quantity 改為 number
- `supabase-schema.sql`：對應新增欄位；quantity CHECK 移除（允許 1-10）
- `messages/zh-TW.json` + `en.json`：新增所有對應 i18n key

**原因：**
1. 進退場時間問題：客戶填活動日期，系統自動推算租賃天數，同時說明「當日送達需備註」，降低客訴
2. 夜間加成：展會結束後 20:00-22:00 撤場需加成服務費，20:00 前為標準服務
3. 發票：部分客戶需三聯式，收集公司資訊同時服務行銷需求

⚠️ **Supabase Migration（需手動執行）：**
```sql
ALTER TABLE bookings
  ADD COLUMN event_start_date DATE,
  ADD COLUMN event_end_date DATE,
  ADD COLUMN teardown_time TEXT DEFAULT 'daytime' CHECK (teardown_time IN ('daytime', 'night')),
  ADD COLUMN invoice_type TEXT DEFAULT 'personal' CHECK (invoice_type IN ('personal', 'company')),
  ADD COLUMN invoice_company TEXT,
  ADD COLUMN invoice_tax_id TEXT,
  ADD COLUMN invoice_address TEXT;

-- 若 quantity 有 CHECK (quantity IN (1,2,3)) 需移除：
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_quantity_check;
```

---

## v0.7.0 — 2026-04-23：預約表單費用摘要

**變更：**
- `app/booking/BookingClient.tsx`：在送出按鈕前新增「費用摘要」區塊，即時顯示：
  - 租賃費用、設定協助費（若有選）、夜間撤場服務費（若選夜間）
  - 小計（未稅）/ 營業稅（5%）/ 估算總費用（含稅）
  - 天數超過 5 天時改顯示「專案報價」提示
- `lib/pricing.ts`：import `calculateTotal`、`RATES` 供表單即時計算
- `messages/zh-TW.json` + `en.json`：新增 summary_title、summary_rental_fee、summary_setup_fee、summary_night_fee、summary_subtotal、summary_tax、summary_total、summary_note、summary_quote_required

**原因：**
客戶填完表單後，在送出前能即時看到費用分解（含稅），減少事後對帳疑慮；夜間加成和設定協助費的金額也會即時反映在摘要裡。

---

## v0.7.1 — 2026-04-23：夜間加成時間更正 + 費率前置顯示

**變更：**
- `messages/zh-TW.json` + `en.json`：夜間撤場時段從 20:00 改為 19:00（`teardown_hint`、`teardown_daytime`、`teardown_night`）
- 新增費率提示文字：hint 說明「NT$2,000/台，未稅」，按鈕標籤顯示「+NT$2,000/台」，讓客戶選擇前先有定價資訊
- `lib/pricing.ts`：`nightSurcharge` 備註更新為 19:00-22:00

**原因：**
同事確認後，展場撤場時間為 19:00，非 20:00；費率需在選項旁明確顯示，讓客戶決策前知道加成金額。

---

## v0.7.2 — 2026-04-23：Logo 更換 + 模擬器間距改虛線

**變更：**
- `public/logo.png`：換成盛源 PERSONA 新 logo（含 logo 色帶）
- `app/simulator/SimulatorClient.tsx`：`GAP` 改為 0，台與台之間改用白色虛線（`setLineDash([8,5])`）顯示分界；空白狀態的 placeholder 也改為虛線分隔

**原因：**
Logo 更新為正式品牌圖；模擬器原本 4px 黑色間距視覺上容易誤判為物理間隙，改虛線讓客戶清楚知道「這是兩台拼接的邊界，非實際空隙」。

---

## v0.7.3 — 2026-04-23：產品頁嵌入 YouTube 介紹影片

**變更：**
- `app/products/page.tsx`：products 陣列新增 `youtubeId` 欄位；每張產品卡的圖片下方加入 16:9 YouTube embed iframe
  - 單面/兩折機：urffISPwXK4
  - 三折雙面機：l5qzBeU3Cps

**原因：**
客戶在產品頁即可直接看到產品實際運作影片，降低詢問門檻。

---

## v0.8.0 — 2026-04-23：模擬器全面影片化

**變更：**
- `app/simulator/SimulatorClient.tsx`：完全移除 Canvas + 圖片上傳，改為 HTML5 video 展示
  - 單面機：機器人影片（344×1032），支援 1–5 台拼接
  - 三折機：汽車影片（688×1032），支援 1–3 台拼接
  - 同一影片時橫跨所有 panel 統一播放（unified mode）
  - 虛線分隔台與台邊界
  - 底部說明：每台可播不同素材
- `public/videos/`：新增 demo-robot.mp4、demo-car.mp4、demo-jewelry.mp4、demo-triple-car.mp4
- `messages/zh-TW.json` + `en.json`：更新副標題（移除「上傳圖片」），新增 content_rec_label、multi_content_note 等 key

**原因：**
客戶不需要自備圖片，直接看真實影片展示效果更有說服力；統一拼接模式讓客戶看到「完整牆面」的視覺感。

---

## v0.8.1 — 2026-04-23：產品頁 YouTube 影片 + Logo 更換

**變更：**
- `public/logo.png`：換成盛源 PERSONA 正式 logo（960×107px）
- `app/products/page.tsx`：每個產品卡加入 YouTube 16:9 embed
  - 單面/兩折機：urffISPwXK4
  - 三折雙面機：l5qzBeU3Cps

**原因：**
品牌識別更新；產品頁讓客戶直接看到實際運作影片。

---

## v0.9.3 — 2026-04-23：首頁加入租賃下單流程示意圖

**變更：**
- `app/page.tsx`：新增「租賃下單流程」section（id="process"），置於 Feature Cards 和 Quick Nav 之間
- 桌機：5步橫排箭頭 clip-path 設計，顏色由深灰漸進至琥珀色
- 手機：直排卡片 + 連接線設計
- 步驟：填寫預約表單 → 時段保留通知 → 簽署合約 → 進場配送 → 撤場歸還

**原因：**
客戶需要視覺化下單流程說明，參考競品設計（nugensrental.com.tw）做成 code 元件取代靜態圖片。

---

## v0.9.2 — 2026-04-23：LINE 按鈕改用 ti/p 格式 + 客戶信加發票資訊

**變更：**
- `app/api/notify-booking/route.ts`：LINE 按鈕 href 改用 `https://line.me/R/ti/p/@touchpersona`（`oaMessage` 格式無法正確開啟）
- 客戶確認信「預約資訊」表格加入發票需求、公司抬頭、統編、發票地址欄位（原僅有管理員通知信有此資訊）
- 按鈕說明文字改為「請在手機上開啟，複製上方訊息後貼上傳送」

**原因：**
`line.me/R/oaMessage` 格式無法觸發 LINE OA 開啟；客戶信遺漏發票資訊導致收款方看 CC 信時看不到三聯式資料。

---

## v0.9.1 — 2026-04-23：LINE OA 按鈕 URL 修正

**變更：**
- `app/api/notify-booking/route.ts`：修正客戶確認信 LINE 按鈕 URL 重複帶參數的 bug（`lineUrl` 已含 query string，href 不再額外附加 `?text=`）
- 按鈕文字從「通知會計」改為「傳送 LINE 匯款通知」（反映 LINE OA 身份）
- 說明文字同步更新（移除「會計」字樣）

**原因：**
URL 格式錯誤導致點擊後無法開啟 LINE 官方帳號；文字未反映改為 LINE OA 的設計。

---

## 待辦 / 尚未填入

| 項目 | 狀態 |
|------|------|
| 設定協助費（pricing.ts `setup`） | PLACEHOLDER = 0 |
| 單趟運費（pricing.ts `shipping`） | PLACEHOLDER = 0 |
| MAX_STANDARD_DAYS 不一致（CalculatorClient: 5，pricing.ts: 4） | ✅ 已修正（v0.5.2） |

---

## v0.9.4 — 2026-04-24：英文介面 i18n 補全（Flow / FAQ / 購買洽詢）

**變更：**
- `messages/zh-TW.json` + `messages/en.json`：新增 `flow`、`faq` namespace；`nav` namespace 新增 `sales_*` 系列 key
- `app/page.tsx`：租賃下單流程標題、5步驟內容、訂金政策卡片全部改用 `tFlow()` 翻譯
- `app/faq/page.tsx`：8條 FAQ 問答、頁面標題、聯絡 CTA 全部改用 `t("faq.*")` 翻譯
- `components/Navbar.tsx`：購買洽詢按鈕與 SalesModal（標題、說明、北/中/南區、底部說明）全部改用 `t("nav.sales_*")` 翻譯

**原因：**
英文介面下租賃流程、FAQ、購買洽詢三處全為硬編碼中文，EN 切換後無法正常顯示。

---

## v0.9.5 — 2026-04-24：產品頁 YouTube 自動播放 + 模擬器圖片跨面板顯示

**變更：**
- `app/products/page.tsx`：YouTube iframe src 新增 `?autoplay=1&mute=1&loop=1&playlist=${youtubeId}`，頁面載入後靜音自動播放並循環
- `app/simulator/SimulatorClient.tsx`：
  - 新增圖片上傳功能（Choose Image / Change Image 按鈕）
  - 上傳圖片後，以 `object-fit: cover` 橫跨整個多面板區域，每台自然顯示對應切片（左→右比例分割）
  - 下載預覽功能：canvas 合成圖片 + 虛線分隔線後，下載為 PNG
  - 未上傳圖片時維持原本 demo 影片播放

**原因：**
1. 產品影片靜音自動播放讓訪客更快感受產品效果，不需要主動點擊
2. 模擬器圖片只顯示在正中間而非橫跨所有面板，無法準確呈現多台拼接的視覺效果；現在上傳任意圖片，各台顯示對應的影像切片，貼近現實布展效果

---

## v1.0.0 — 2026-04-28：契約書自動填寫 + 隨確認信寄出 PDF

**變更：**
- `lib/contract-pdf.tsx`（新增）：用 `@react-pdf/renderer` 建立設備租賃契約 PDF 元件，依預約資料自動填入機型台數、租期、交付地址、協助設定選項、發票資訊、乙方身分資訊
- `public/fonts/NotoSansTC-Regular.woff`（新增）：Traditional Chinese 字型（1.4MB），供 PDF 正確渲染中文
- `app/booking/BookingClient.tsx`：新增「身分證字號／統一編號」欄位；新增「我已閱讀並同意租賃契約」勾選框（必填），未勾選無法送出
- `app/api/notify-booking/route.ts`：引入 `renderToBuffer` 與 `ContractPDF`，每次預約送出後自動生成填好的契約 PDF，附加到管理員通知信與客戶確認信
- `supabase-schema.sql`：新增 `id_number`、`delivery_address`、`customer_address` 欄位說明，並附 ALTER TABLE 升級指令供現有 DB 執行

**原因：**
客戶填完預約後，系統自動生成填好的租賃契約 PDF，隨確認信寄給雙方。PDF 格式不可修改，避免 DOCX 各說各話的糾紛風險；勾選框提供明確的同意記錄（結合 IP + 時間戳），作為法律效力依據。

---

## v1.0.1 — 2026-04-28：契約乙方改以公司名義登記 + 模擬器規格修正

**變更：**
- `lib/contract-pdf.tsx`：ContractData 新增 company 欄位；有公司名稱時，乙方登記為公司名稱（代表人：填表人），身分證字號欄改顯示統一編號；頂端立契約書人區塊同步更新
- `app/api/notify-booking/route.ts`：傳遞 company 欄位至 ContractData
- `app/booking/BookingClient.tsx`：公司名稱欄位加說明文字「如填寫公司名稱，契約乙方將登記為公司而非個人」
- `app/simulator/SimulatorClient.tsx`：移除重複灰色 px 行；整機外觀尺寸與顯示尺寸分兩行顯示（single: 664mm/640mm，台數增加依比例）；新增「最多可拼接 6 台」說明

**原因：**
1. 公司派員工填表時，乙方應為公司法人而非個人員工，避免員工離職後求償無門
2. 模擬器規格區塊「344×1032 px」與「建議素材解析度」重複顯示；整機外觀尺寸與顯示尺寸需分開標示
