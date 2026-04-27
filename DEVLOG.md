# LED 租賃網站 — 開發日誌

> **維護規則：** 每次修改功能後，必須在此補上一筆記錄。格式：日期、版本號、變更項目、原因。
> 這份日誌是產品進化的歷史記錄，日後追蹤問題或回顧功能演進時的第一參考點。

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
