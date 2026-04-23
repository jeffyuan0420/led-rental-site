// ============================================================
// 匯款資訊 — 硬編碼在此檔案，不存資料庫
// 修改方式：編輯此檔案 → git commit → push → Vercel 自動部署
// 所有變更均有 GitHub commit log 可追蹤
// ============================================================

export const PAYMENT = {
  bankName: "台北富邦銀行",
  bankCode: "012",
  accountName: "鉅財王數位科技股份有限公司",
  accountNumber: "82120000150007",
  paymentDeadlineDays: 3, // 幾個工作天內完成匯款
  accountantLineId: "0908867233", // 會計的個人 LINE ID（備用）
  companyLineOA: "@touchpersona",  // 公司 LINE 官方帳號（用於確認信預填訊息）
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
