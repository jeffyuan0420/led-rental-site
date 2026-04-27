import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { PAYMENT, subtractWorkingDays } from "@/lib/payment";
import { calculateTotal, RATES } from "@/lib/pricing";

const NOTIFY_EMAIL = "help@csknight.com";

const PRODUCT_LABELS: Record<string, string> = {
  single: "單面／兩折機",
  triple: "三折雙面機",
};

const DAYS_OF_WEEK = ["（日）", "（一）", "（二）", "（三）", "（四）", "（五）", "（六）"];

interface ConfirmPayload {
  name: string;
  email: string;
  company?: string;
  product_type: "single" | "triple";
  quantity: number;
  start_date: string;
  end_date: string;
  setup_option: "none" | "half" | "full";
  teardown_time: "daytime" | "night";
  notes?: string;
}

function calcDays(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export async function POST(req: Request) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  let body: ConfirmPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, company, product_type, quantity, start_date, end_date, setup_option, teardown_time, notes } = body;
  const days = calcDays(start_date, end_date);
  const { rentalFee, setupFee, needsQuote } = calculateTotal({ productType: product_type, quantity, days, setupOption: setup_option, includeShipping: false });

  if (needsQuote) {
    return NextResponse.json({ error: "Quote required for rentals over 5 days" }, { status: 400 });
  }

  const nightFee = teardown_time === "night" ? RATES.nightSurcharge * quantity : 0;
  const subtotal = rentalFee + setupFee + nightFee;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const setupLabel = setup_option === "none" ? "不需要" : setup_option === "half" ? "半天" : "整天";

  const deadline = subtractWorkingDays(new Date(start_date), PAYMENT.paymentDeadlineDays);
  const deadlineStr = `${deadline.getFullYear()}/${String(deadline.getMonth() + 1).padStart(2, "0")}/${String(deadline.getDate()).padStart(2, "0")}${DAYS_OF_WEEK[deadline.getDay()]}`;

  const subject = `【租賃時段確認】${name} — ${PRODUCT_LABELS[product_type]} × ${quantity} 台`;

  const html = `
    <div style="font-family:sans-serif;max-width:580px;color:#111">
      <h2 style="color:#111">租賃時段確認通知</h2>
      <p>親愛的 ${name} 您好，</p>
      <p>感謝您預約 Persona Taiwan LED 廣告機租賃服務。您的預約已確認，請於 <strong>租賃日前 ${PAYMENT.paymentDeadlineDays} 個工作天（${deadlineStr}）前</strong>完成訂金匯款，以正式保留您的機台時段。</p>

      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">■ 預約資訊</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;width:130px">機型</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${PRODUCT_LABELS[product_type]} × ${quantity} 台</td></tr>
        ${company ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">公司</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${company}</td></tr>` : ""}
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">租賃日期</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${start_date} ～ ${end_date}（共 ${days} 天）</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${setupLabel}</td></tr>
        ${teardown_time === "night" ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">撤場時間</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">夜間撤場（19:00–22:00）</td></tr>` : ""}
        ${notes ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
      </table>

      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">■ 付款金額</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;width:130px">租賃費用</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">NT$ ${rentalFee.toLocaleString()}</td></tr>
        ${setupFee > 0 ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">設定協助費</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">NT$ ${setupFee.toLocaleString()}</td></tr>` : ""}
        ${nightFee > 0 ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">夜間撤場費</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">NT$ ${nightFee.toLocaleString()}</td></tr>` : ""}
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">小計（未稅）</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">NT$ ${subtotal.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">營業稅（5%）</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">NT$ ${tax.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 12px;background:#e5e7eb;font-weight:700">合計（含稅）</td><td style="padding:6px 12px;font-weight:700;border-bottom:1px solid #e5e7eb">NT$ ${total.toLocaleString()}</td></tr>
      </table>

      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">■ 匯款資訊</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;width:130px">銀行</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${PAYMENT.bankName}（${PAYMENT.bankCode}）</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">戶名</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${PAYMENT.accountName}</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">帳號</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;letter-spacing:0.05em">${PAYMENT.accountNumber}</td></tr>
      </table>

      <div style="margin-top:20px;padding:16px;background:#fef9c3;border-left:4px solid #ca8a04;border-radius:4px">
        <p style="margin:0;font-weight:600;color:#92400e">付款截止日：${deadlineStr}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#78350f">匯款後請保留收據，並回覆此信告知，我們將確認入帳後寄出正式確認書。<br>逾期未收到款項，恕需釋出機台時段，如需重新預約以當時庫存為準。</p>
      </div>

      <p style="margin-top:20px">如有任何問題，歡迎透過 LINE 或回覆此信與我們聯繫。</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#6b7280;font-size:12px">Persona Taiwan｜help@csknight.com｜此信由系統自動發送</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: `"Persona Taiwan" <${smtpUser}>`,
      to: email,
      cc: NOTIFY_EMAIL,
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMTP confirm error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
