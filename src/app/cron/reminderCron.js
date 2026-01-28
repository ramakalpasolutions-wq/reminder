import { NextResponse } from 'next/server'
import cron from 'node-cron'
import connectDB from '@/app/lib/db'
import Task from '@/app/models/Task'
import { sendReminderMail } from '@/app/lib/mailer'
import { getISTNow, buildTaskDateTimeIST } from '@/app/lib/dateUtils'

// Stop existing jobs
if (global._cronJobs) {
  global._cronJobs.forEach(job => job.stop())
  global._cronJobs = []
}

let isRunning = false

const job = cron.schedule('* * * * *', async () => {
  if (isRunning) return
  isRunning = true

  try {
    console.log('⏰ Cron running at:', getISTNow().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))

    await connectDB()
    const now = getISTNow()
    const lookAhead = new Date(now.getTime() + 65 * 60000)

    // ✅ FIXED QUERY: status is EITHER 'pending' OR missing/undefined
    const tasks = await Task.find({
      // Tasks that are pending OR have no status (your current tasks)
      $or: [
        { status: 'pending' },
        { status: { $exists: false } },  // ← THIS FIXES IT!
      ],
      date: { $exists: true },
      time: { $exists: true },
    }).lean()

    console.log(`📋 Found ${tasks.length} tasks to check`)

    for (const task of tasks) {
      const taskTime = buildTaskDateTimeIST(task)
      if (!taskTime) continue

      const diffMin = Math.floor((taskTime.getTime() - now.getTime()) / 60000)
      
      if (diffMin <= 0 || diffMin > 65) continue

      console.log(`🔍 "${task.title}" | ${diffMin} mins remaining`)

      for (const minutes of [60, 30, 10]) {
        if (diffMin <= minutes && diffMin >= minutes - 1 && !task.remindersSent?.includes(minutes)) {
          
          const updated = await Task.findOneAndUpdate(
            { _id: task._id, remindersSent: { $ne: minutes } },
            { $addToSet: { remindersSent: minutes } },
            { new: true }
          )

          if (updated) {
            await sendReminderMail(
              process.env.MAIL_USER,
              task.title,
              task.subject || 'No subject',
              minutes,
              taskTime
            )
            console.log(`✅ ${minutes}min REMINDER SENT for "${task.title}"`)
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Cron error:', err)
  } finally {
    isRunning = false
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
})

global._cronJobs = [job]
console.log('✅ FIXED CRON STARTED - Now finds tasks without status!')
