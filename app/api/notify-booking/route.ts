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
  add_setup: boolean;
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

  const { name, company, phone, email, product_type, quantity, add_setup, start_date, end_date, notes } = body;

  const transporter = nodemailer.createTransport({
    host: "pollux8.url.com.tw",
    port: 465,
    secure: true,
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
      <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">設定協助</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${add_setup ? "是" : "否"}</td></tr>
      ${notes ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">備註</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${notes}</td></tr>` : ""}
    </table>
    <p style="color:#6b7280;font-size:12px;margin-top:16px">此信由 Persona Taiwan 租賃系統自動發送</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Persona Taiwan" <${smtpUser}>`,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
