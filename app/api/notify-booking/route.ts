import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const NOTIFY_EMAIL = "help@csknight.com";

interface BookingPayload {
  name: string;
  company?: string;
  phone: string;
  email: string;
  product_type: "single" | "triple";
  quantity: number;
  setup_option: "none" | "half" | "full";
  start_date: string;
  end_date: string;
  notes?: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  single: "單面／兩折機",
  triple: "三折雙面機",
};

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

  const { name, company, phone, email, product_type, quantity, setup_option, start_date, end_date, notes } = body;
  const setupLabel = setup_option === "none" ? "否" : setup_option === "half" ? "半天" : "整天";

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const subject = `【新預約】${name}｜${PRODUCT_LABELS[product_type]} × ${quantity} 台`;

  const html = `
    <h2 style="color:#111">新租賃預約通知</h2>
    <table style="border-collapse:collapse;width:100%;max-width:520px;font-size:14px">
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:130px">姓名</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${name}</td></tr>
      ${company ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">公司</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${company}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">電話</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${phone}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${email}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">機型</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${PRODUCT_LABELS[product_type]}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">台數</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${quantity} 台</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">租賃日期</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${start_date} ～ ${end_date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${setupLabel}</td></tr>
      ${notes ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
    </table>
    <p style="color:#6b7280;font-size:12px;margin-top:16px">此信由 Persona Taiwan 租賃系統自動發送</p>
  `;

  const ackSubject = `【預約申請確認】感謝您預約 Persona Taiwan LED 廣告機租賃`;
  const ackHtml = `
    <div style="font-family:sans-serif;max-width:560px;color:#111">
      <h2 style="color:#111">感謝您的預約申請</h2>
      <p>親愛的 ${name} 您好，</p>
      <p>感謝您透過 Persona Taiwan 官網提交租賃預約申請，我們已收到您的申請。</p>
      <h3 style="margin-top:24px;margin-bottom:8px;color:#374151">您的預約資訊</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;width:120px">機型</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${PRODUCT_LABELS[product_type]} × ${quantity} 台</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">租賃日期</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${start_date} ～ ${end_date}</td></tr>
        <tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${setupLabel}</td></tr>
        ${notes ? `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
      </table>
      <p style="margin-top:20px">我們將於 <strong>1 個工作天內</strong>與您確認時段可用性，並另行寄送匯款資訊。</p>
      <p>如有任何問題，歡迎透過 LINE 或 Email 與我們聯繫。</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#6b7280;font-size:12px">Persona Taiwan｜help@csknight.com</p>
    </div>
  `;

  try {
    // Internal notification to admin
    await transporter.sendMail({
      from: `"Persona Taiwan" <${smtpUser}>`,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject,
      html,
    });
    // Acknowledgment to customer
    await transporter.sendMail({
      from: `"Persona Taiwan" <${smtpUser}>`,
      to: email,
      subject: ackSubject,
      html: ackHtml,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
