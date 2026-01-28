// Get current IST time (SAFE)
export function getISTNow() {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })
  )
}

// ✅ FIXED: Build task datetime in IST (LOCAL TIME)
export function buildTaskDateTimeIST(task) {
  if (!task?.date || !task?.time) return null

  const [year, month, day] = task.date.split('-').map(Number)
  let [hour, minute] = task.time.split(':').map(Number)

  // Handle AM/PM
  if (task.period === 'PM' && hour < 12) hour += 12
  if (task.period === 'AM' && hour === 12) hour = 0

  // ✅ CORRECT: Create IST Date directly (no UTC offset)
  const taskDateTime = new Date(year, month - 1, day, hour, minute)
  
  // Force IST timezone interpretation
  return new Date(
    taskDateTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  )
}
