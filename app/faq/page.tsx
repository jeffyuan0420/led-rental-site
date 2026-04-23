import { getTranslations } from "next-intl/server";

const FAQS = [
  {
    q: "機台尺寸和解析度是多少？",
    a: "單面／兩折機：實體尺寸 664×1920mm，建議素材解析度 344×1032px。三折雙面機：實體尺寸 1280×1920mm，建議素材解析度 688×1032px。播放設備由我們提供，客戶只需準備素材檔案。",
  },
  {
    q: "素材支援哪些格式？",
    a: "支援 MP4 影片及 JPG／PNG 圖片。建議在預約前先確認素材解析度符合規格，需要的話我們可提供尺寸模板，歡迎透過 LINE 或 Email 聯繫索取。",
  },
  {
    q: "可以多台並排拼接嗎？",
    a: "可以。5 台單面機並排約等於 1720×1032px（接近 16:9 比例），適合需要大型展示牆的場合。如需大量台數，建議提早預約以確保庫存。",
  },
  {
    q: "租賃天數有限制嗎？",
    a: "標準租賃最長 5 天（含進出場日）。超過 5 天的長期展覽需另行聯繫業務報價，費用依實際需求議定。",
  },
  {
    q: "有提供到場安裝協助嗎？費用如何計算？",
    a: "可加購設定協助服務：半天 NT$3,000／人、整天 NT$4,500／人。1–5 台配 1 名技師，6–10 台配 2 名。若不需協助，機台交付後由客戶自行操作，我們提供基本說明。",
  },
  {
    q: "夜間撤場需要額外費用嗎？",
    a: "撤場時間若落在 19:00–22:00，每台加收 NT$2,000 夜間撤場費。請在預約時選擇對應的撤場時段，費用會自動計入報價。",
  },
  {
    q: "預約後如何付款？可以刷卡嗎？",
    a: "填完預約表單後，系統會自動寄送確認信至您的 Email，內含費用明細及匯款帳號。請於 3 個工作天內完成銀行轉帳，款項確認後時段即正式保留。目前不接受刷卡或現金支付。",
  },
  {
    q: "若需取消或更改日期怎麼辦？",
    a: "請盡早透過 LINE 官方帳號或 Email 告知。未付款前可取消且不收費；付款後取消依距活動日遠近收取費用，詳情請直接聯繫我們確認。",
  },
];

export default async function FaqPage() {
  const t = await getTranslations("nav");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">常見問題 FAQ</h1>
        <p className="text-center text-gray-500 mb-12 text-sm">找不到答案？歡迎透過 LINE 或 Email 直接詢問</p>

        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center gap-4 px-6 py-5 cursor-pointer select-none list-none hover:bg-gray-50 transition-colors">
                <span className="shrink-0 w-8 h-8 rounded-full bg-gray-900 text-yellow-400 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-semibold text-gray-800 flex-1">{item.q}</span>
                <svg
                  className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-900 rounded-xl p-8 text-white">
          <p className="font-semibold text-lg mb-1">還有其他問題？</p>
          <p className="text-gray-400 text-sm mb-5">我們很樂意協助您</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://line.me/R/ti/p/@touchpersona"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              📱 LINE 聯繫
            </a>
            <a
              href="mailto:help@csknight.com"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              ✉️ Email 聯繫
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
