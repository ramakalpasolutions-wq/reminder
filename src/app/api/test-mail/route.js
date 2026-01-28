import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `"Test Mail" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: 'GMAIL SMTP FINAL TEST',
      text: 'If you receive this, Gmail SMTP is working.',
    })

    console.log('MAIL SENT:', info.messageId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('MAIL ERROR:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
