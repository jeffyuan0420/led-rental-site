import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { PAYMENT, addWorkingDays } from "@/lib/payment";
import { calculateTotal, RATES } from "@/lib/pricing";

const NOTIFY_EMAIL = "help@csknight.com";
const DAYS_OF_WEEK = ["（日）", "（一）", "（二）", "（三）", "（四）", "（五）", "（六）"];

const PRODUCT_LABELS: Record<string, string> = {
  single: "單面／兩折機",
  triple: "三折雙面機",
};

interface BookingPayload {
  name: string;
  company?: string;
  phone: string;
  email: string;
  product_type: "single" | "triple";
  quantity: number;
  setup_option: "none" | "half" | "full";
  teardown_time?: "daytime" | "night";
  start_date: string;
  end_date: string;
  invoice_type?: "personal" | "company";
  invoice_company?: string;
  invoice_tax_id?: string;
  invoice_address?: string;
  notes?: string;
}

export async function POST(req: Request) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  let body: BookingPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, company, phone, email, product_type, quantity, setup_option, teardown_time = "daytime", start_date, end_date, invoice_type, invoice_company, invoice_tax_id, invoice_address, notes } = body;
  const setupLabel = setup_option === "none" ? "不需要" : setup_option === "half" ? "半天" : "整天";

  // Fee calculation
  const days = Math.max(1, Math.round((new Date(end_date).getTime() - new Date(start_date).getTime()) / 86400000) + 1);
  const { rentalFee, setupFee, needsQuote } = calculateTotal({ productType: product_type, quantity, days, setupOption: setup_option, includeShipping: false });
  const nightFee = teardown_time === "night" ? RATES.nightSurcharge * quantity : 0;
  const subtotal = rentalFee + setupFee + nightFee;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // Payment deadline
  const deadline = addWorkingDays(new Date(), PAYMENT.paymentDeadlineDays);
  const deadlineStr = `${deadline.getFullYear()}/${String(deadline.getMonth() + 1).padStart(2, "0")}/${String(deadline.getDate()).padStart(2, "0")}${DAYS_OF_WEEK[deadline.getDay()]}`;

  // LINE OA 連結（開啟官方帳號聊天）
  const lineUrl = `https://line.me/R/ti/p/${PAYMENT.companyLineOA}`;

  // --- Internal admin notification ---
  const adminSubject = `【新預約】${name}｜${PRODUCT_LABELS[product_type]} × ${quantity} 台`;
  const adminHtml = `
    <h2 style="color:#111">新租賃預約通知</h2>
    <table style="border-collapse:collapse;width:100%;max-width:520px;font-size:14px">
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:130px">姓名</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${name}</td></tr>
      ${company ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">公司</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${company}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">電話</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${phone}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${email}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">機型</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${PRODUCT_LABELS[product_type]} × ${quantity} 台</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">租賃日期</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${start_date} ～ ${end_date}（${days} 天）</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${setupLabel}</td></tr>
      ${teardown_time === "night" ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">撤場時間</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">夜間（19:00–22:00）</td></tr>` : ""}
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">估算費用</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:700">${needsQuote ? "專案報價" : `NT$ ${total.toLocaleString()}（含稅）`}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">發票需求</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${invoice_type === "company" ? "三聯式（公司）" : "二聯式（個人）"}</td></tr>
      ${invoice_type === "company" ? `
        ${invoice_company ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">公司抬頭</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${invoice_company}</td></tr>` : ""}
        ${invoice_tax_id ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">統一編號</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${invoice_tax_id}</td></tr>` : ""}
        ${invoice_address ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">發票地址</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${invoice_address}</td></tr>` : ""}
      ` : ""}
      ${notes ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
    </table>
    <p style="color:#6b7280;font-size:12px;margin-top:16px">此信由 Persona 盛源 LED廣告機租賃系統自動發送</p>
  `;

  // --- Customer confirmation email ---
  const customerSubject = `【租賃確認】感謝您預約 Persona 盛源 LED廣告機`;
  const customerHtml = `
    <div style="font-family:sans-serif;max-width:580px;color:#111">
      <h2 style="color:#111">租賃預約確認通知</h2>
      <p>親愛的 ${name} 您好，</p>
      <p>感謝您預約 Persona 盛源 LED廣告機租賃服務，您的預約已成功建立。請於 <strong>${PAYMENT.paymentDeadlineDays} 個工作天內（${deadlineStr} 前）</strong>完成全額匯款，以正式保留機台時段。</p>

      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">■ 預約資訊</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;width:130px">機型</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${PRODUCT_LABELS[product_type]} × ${quantity} 台</td></tr>
        ${company ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">公司</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${company}</td></tr>` : ""}
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">租賃日期</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${start_date} ～ ${end_date}（共 ${days} 天）</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${setupLabel}</td></tr>
        ${teardown_time === "night" ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">撤場時間</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">夜間撤場（19:00–22:00）</td></tr>` : ""}
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">發票需求</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${invoice_type === "company" ? "三聯式（公司）" : "二聯式（個人）"}</td></tr>
        ${invoice_type === "company" && invoice_company ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">公司抬頭</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${invoice_company}</td></tr>` : ""}
        ${invoice_type === "company" && invoice_tax_id ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">統一編號</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${invoice_tax_id}</td></tr>` : ""}
        ${invoice_type === "company" && invoice_address ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">發票地址</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${invoice_address}</td></tr>` : ""}
        ${notes ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
      </table>

      ${needsQuote ? `
      <div style="margin-top:20px;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px">
        <p style="margin:0;font-weight:600;color:#92400e">展期超過 5 天，費用依專案報價</p>
        <p style="margin:8px 0 0;font-size:13px;color:#78350f">我們將另行與您聯繫確認費用及付款方式。</p>
      </div>
      ` : `
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
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">帳號</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;letter-spacing:0.05em;font-weight:700">${PAYMENT.accountNumber}</td></tr>
      </table>

      <div style="margin-top:20px;padding:16px;background:#fef9c3;border-left:4px solid #ca8a04;border-radius:4px">
        <p style="margin:0;font-weight:600;color:#92400e">付款截止日：${deadlineStr}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#78350f">逾期未收到款項，恕需釋出機台時段，如需重新預約以當時庫存為準。</p>
      </div>

      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">■ 匯款後請通知我們</h3>
      <p style="font-size:14px;color:#374151">完成匯款後，請複製以下訊息，透過 LINE 官方帳號傳送給我們確認：</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#374151;line-height:1.7;border:1px solid #e5e7eb">
        您好，我是 ${name}，預約 ${start_date}–${end_date} 的 Persona 盛源 LED廣告機租賃。<br>
        已完成匯款，末5碼：<strong>___</strong>，轉帳時間：<strong>___</strong>，金額：NT$${total.toLocaleString()}。<br>
        請確認，謝謝！
      </div>
      <div style="margin-top:12px;text-align:center">
        <a href="${lineUrl}" style="display:inline-block;background:#06c755;color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px">📱 開啟 LINE 官方帳號</a>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:8px">（請在手機上開啟，複製上方訊息後貼上傳送）</p>
      `}

      <p style="margin-top:24px;font-size:13px;color:#6b7280">如對匯款資訊有任何疑問，請先透過 LINE 或 Email 與我們確認後再轉帳。</p>
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
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: adminSubject,
      html: adminHtml,
    });
    await transporter.sendMail({
      from: `"Persona Taiwan" <${smtpUser}>`,
      to: email,
      cc: NOTIFY_EMAIL,
      subject: customerSubject,
      html: customerHtml,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
