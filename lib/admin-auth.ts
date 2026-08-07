// 後台可登入 / 可操作管理 API 的 email 白名單
// 這個 Supabase 專案跟其他系統（標案追蹤等）共用，Auth Users 清單裡會有無關帳號，
// 所以不能只靠「有沒有登入」判斷，要明確比對 email。
export const ADMIN_ALLOWED_EMAILS = [
  "jeff@persona.com.tw",
  "jeffyuan0420@gmail.com",
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_ALLOWED_EMAILS.includes(email.toLowerCase());
}
