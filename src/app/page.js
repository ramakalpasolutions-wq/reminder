'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './globals.css'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [selectedDate, setSelectedDate] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '',
    subject: '',
    type: '',
    hour: '',
    min: '',
    period: '',
    meetLink: '',
  })

  // ✅ NEW: Check if form is valid
  const isFormValid = selectedDate && 
                     form.title.trim() && 
                     form.hour && 
                     form.min && 
                     form.period !== ''

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarYear = 2026
  const calendarMonth = 0 // January

  const isPastDate = (day) => {
    const date = new Date(calendarYear, calendarMonth, day)
    const todayOnly = new Date()
    todayOnly.setHours(0, 0, 0, 0)
    return date < todayOnly
  }

  const logout = () => {
    sessionStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [])

  useEffect(() => {
    if (!editId) return

    const loadTaskForEdit = async () => {
      const res = await fetch(`/api/task?id=${editId}`)
      if (!res.ok) return

      const task = await res.json()

      setForm({
        title: task.title || '',
        subject: task.subject || '',
        type: task.type || '',
        hour: task.time?.split(':')[0] || '',
        min: task.time?.split(':')[1] || '',
        period: task.period || 'AM',
        meetLink: task.meetLink || '',
      })

      setSelectedDate(new Date(task.date).getDate())
    }

    loadTaskForEdit()
  }, [editId])

  /* ===== FETCH TASKS FROM DB ===== */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch('/api/task')
        if (!res.ok) return
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : [])
      } catch {
        setTasks([])
      }
    }
    loadTasks()
  }, [])

  /* ===== ADD EVENT / TASK ===== */
  const addEvent = async () => {
  const userEmail = sessionStorage.getItem('userEmail');
  if (!userEmail) {
    alert('Please login again');
    return;
  }

  const payload = {
    userEmail,  // ✅ Add this
    title: form.title,
    subject: form.subject,
    type: form.type,
    meetLink: form.type === 'Google Meet' ? form.meetLink : '',
    date: `${calendarYear}-${calendarMonth + 1}-${selectedDate}`,
    time: `${form.hour}:${form.min}`,
    period: form.period,
    status: 'pending',
  };
  console.log('Sending payload:', payload);  // Add this

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
          console.log('Response status:', res.status, res.ok);  // Add this
    console.log('Response headers:', res.headers);  // Add this


      if (!res.ok){
              const errorText = await res.text();  // Add this to see server error
                    console.error('Server error:', errorText);
              return;
      } 

      const data = await res.json()
      if (data?.task) {
        setTasks(prev => [data.task, ...prev])
      }

      setForm({
        title: '',
        subject: '',
        type: '',
        hour: '',
        min: '',
        period: 'AM',
        meetLink: '',
      })
      setSelectedDate(null)
      setShowModal(false)
    } catch (err) {
    console.error('Fetch error:', err);  // Ensure this logs
    }
  }

  const deleteTask = async (id) => {
    const res = await fetch(`/api/task?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Delete failed')
      return
    }
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  return (
    <div className="todo-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="todo-sidebar">
        <h2 className="logo">ToDo Manager</h2>

        <button className="sidebar-btn active" onClick={() => router.push('/')}>
          📅 New Event
        </button>

        <button className="sidebar-btn" onClick={() => router.push('/tasks')}>
          ✅ Tasks
        </button>
        <button className="sidebar-btn logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="todo-main">
        <div className="task-header">
          <h1 className="page-title">To Do Task</h1>
        </div>

        <div className="content-grid">
          {/* ===== CALENDAR ===== */}
          <div className="calendar-card">
            <div className="calendar-header">
              <span>‹</span>
              <h3>Jan 2026</h3>
              <span>›</span>
            </div>

            <div className="calendar-days">
              {days.map(d => (
                <div key={d} className="day-name">{d}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const past = isPastDate(day)
                return (
                  <div
                    key={day}
                    className={`date-box ${selectedDate === day ? 'active-date' : ''} ${past ? 'disabled-date' : ''}`}
                    onClick={() => !past && setSelectedDate(day)}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ===== ADD EVENT FORM ===== */}
          <div className="form-card">
            <h3>➕ Add New Event</h3>

            <input
              placeholder="Event"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <input
              placeholder="Subject"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            />

            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="">Select meeting type</option>
              <option>Google Meet</option>
              <option>Contact</option>
              <option>Call</option>
            </select>

            {form.type === 'Google Meet' && (
              <input
                type="url"
                placeholder="Google Meet link"
                value={form.meetLink}
                onChange={e => setForm({ ...form, meetLink: e.target.value })}
              />
            )}

            <div className="date-warning">
              📅 {selectedDate
                ? `Selected date: ${selectedDate}`
                : 'Select date (Click again to deselect)'}
            </div>

            <div className="time-row">
              <select
                value={form.hour}
                onChange={e => setForm({ ...form, hour: e.target.value })}
              >
                <option value="">Hour</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>

              <select
                value={form.min}
                onChange={e => setForm({ ...form, min: e.target.value })}
              >
                <option value="">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={form.period}
              onChange={e => setForm({ ...form, period: e.target.value })}
            >
              {/* <option value="">Select</option> */}
              <option>AM</option>
              <option>PM</option>
            </select>

            {/* ✅ BUTTON ENABLED ONLY WHEN FORM IS COMPLETE */}
            <button 
              className={`add-btn ${!isFormValid ? 'disabled' : ''}`}
              onClick={addEvent}
              disabled={!isFormValid}
              title={!isFormValid ? 'Fill all required fields' : ''}
            >
              ✔ Add Reminder
            </button>
          </div>

          {/* ===== ACTIVE REMINDERS (ONLY PENDING) ===== */}
<div className="reminder-card">
  {/* ✅ FIXED: Only count PENDING tasks */}
  <h3>📋 Active Reminders (
    {tasks.filter(task => (task.status || 'pending') === 'pending').length}
  )</h3>

  {tasks.length === 0 ? (
    <div className="empty-state">
      📅
      <p>No active reminders</p>
    </div>
  ) : (
    // ✅ FIXED: Only show PENDING tasks
    tasks
      .filter(task => (task.status || 'pending') === 'pending')
      .map(task => (
        <div key={task._id} className="reminder-item">
          <div>
            <strong>{task.title}</strong>
            <p>{task.subject}</p>
            <small>{task.date} • {task.time} {task.period}</small>

            {task.meetLink && (
              <a
                href={task.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', color: '#2563eb', fontSize: '13px' }}
              >
                🔗 Join Google Meet
              </a>
            )}
          </div>

          <button
            className="delete-btn"
            onClick={() => deleteTask(task._id)}
          >
            🗑️
          </button>
        </div>
      ))
  )}
</div>

        </div>
      </main>
    </div>
  )
}
