import '@/app/cron/reminderCron'

if (!global.__cronInitialized) {
  global.__cronInitialized = true
  console.log('✅ Reminder cron initialized ONCE')
}
