import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendReminderMail(to, title, subject, minutes, taskDateTime) {
  const formattedTime = taskDateTime 
    ? new Date(taskDateTime).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Not specified'

  const urgencyEmoji = minutes === 10 ? '🚨' : minutes === 30 ? '⏰' : '🔔'
  
  await transporter.sendMail({
    from: `"Task Reminder System" <${process.env.MAIL_USER}>`,
    to,
    subject: `${urgencyEmoji} Reminder: ${title} (${minutes} mins left)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          ${urgencyEmoji} Task Reminder
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>📌 Task:</strong> ${title}</p>
          ${subject ? `<p style="margin: 8px 0;"><strong>📝 Subject:</strong> ${subject}</p>` : ''}
          <p style="margin: 8px 0;"><strong>⏰ Due At:</strong> ${formattedTime}</p>
          <p style="margin: 8px 0; color: ${minutes === 10 ? '#d32f2f' : '#ff9800'}; font-size: 18px; font-weight: bold;">
            ⏳ ${minutes} minutes remaining!
          </p>
        </div>

        <p style="color: #666;">Please make sure to complete your task on time.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Task Reminder System • Automated Notification
        </p>
      </div>
    `,
    text: `${urgencyEmoji} Task Reminder

Hello,

This is a reminder for your task.

📌 Task: ${title}
${subject ? `📝 Subject: ${subject}` : ''}
⏰ Due At: ${formattedTime}
⏳ Time Remaining: ${minutes} minutes

Please make sure to complete it on time.

— Task Reminder System
`,
  })
}
