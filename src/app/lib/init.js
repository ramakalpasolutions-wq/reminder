if (!global._cronBootstrapped) {
  global._cronBootstrapped = true
  import('@/app/cron/reminderCron')
  console.log('✅ Cron bootstrapped ONCE')
}
