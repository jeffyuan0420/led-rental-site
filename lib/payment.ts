// ============================================================
// 匯款資訊 — 硬編碼在此檔案，不存資料庫
// 修改方式：編輯此檔案 → git commit → push → Vercel 自動部署
// 所有變更均有 GitHub commit log 可追蹤
// ============================================================

export const PAYMENT = {
  bankName: "【填入銀行名稱，例：台灣銀行】",
  bankCode: "【填入銀行代碼，例：004】",
  accountName: "【填入戶名，例：盛源科技有限公司】",
  accountNumber: "【填入帳號，例：1234-567-890123】",
  paymentDeadlineDays: 3, // 幾個工作天內完成匯款
} as const;

/** 計算 N 個工作天後的日期（週一～週五） */
export function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}
