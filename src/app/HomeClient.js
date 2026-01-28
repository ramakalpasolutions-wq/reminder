'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import './globals.css'

export default function HomeClient() {
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
    period: 'AM',
    meetLink: '',
  })

  const isFormValid =
    selectedDate &&
    form.title.trim() &&
    form.hour &&
    form.min &&
    form.period

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarYear = 2026
  const calendarMonth = 0 // January

  const isPastDate = (day) => {
    const date = new Date(calendarYear, calendarMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const logout = () => {
    sessionStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  /* ===== AUTH CHECK ===== */
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    if (!isLoggedIn) router.push('/login')
  }, [router])

  /* ===== LOAD TASK FOR EDIT ===== */
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

  /* ===== FETCH TASKS ===== */
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

  /* ===== ADD TASK ===== */
  const addEvent = async () => {
    const userEmail = sessionStorage.getItem('userEmail')
    if (!userEmail) {
      alert('Please login again')
      return
    }

    const payload = {
      userEmail,
      title: form.title,
      subject: form.subject,
      type: form.type,
      meetLink: form.type === 'Google Meet' ? form.meetLink : '',
      date: `${calendarYear}-${calendarMonth + 1}-${selectedDate}`,
      time: `${form.hour}:${form.min}`,
      period: form.period,
      status: 'pending',
    }

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error(error)
        return
      }

      const data = await res.json()
      if (data?.task) setTasks(prev => [data.task, ...prev])

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
      console.error(err)
    }
  }

  /* ===== DELETE TASK ===== */
  const deleteTask = async (id) => {
    const res = await fetch(`/api/task?id=${id}`, { method: 'DELETE' })
    if (!res.ok) return alert('Delete failed')
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
        <h1 className="page-title">To Do Task</h1>

        <div className="content-grid">
          {/* ===== CALENDAR ===== */}
          <div className="calendar-card">
            <div className="calendar-header">
              <h3>Jan 2026</h3>
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

          {/* ===== FORM ===== */}
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
              📅 {selectedDate ? `Selected date: ${selectedDate}` : 'Select a date'}
            </div>

            <div className="time-row">
              <select value={form.hour} onChange={e => setForm({ ...form, hour: e.target.value })}>
                <option value="">Hour</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>

              <select value={form.min} onChange={e => setForm({ ...form, min: e.target.value })}>
                <option value="">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
              <option>AM</option>
              <option>PM</option>
            </select>

            <button
              className={`add-btn ${!isFormValid ? 'disabled' : ''}`}
              onClick={addEvent}
              disabled={!isFormValid}
            >
              ✔ Add Reminder
            </button>
          </div>

          {/* ===== ACTIVE REMINDERS ===== */}
          <div className="reminder-card">
            <h3>
              📋 Active Reminders (
              {tasks.filter(t => (t.status || 'pending') === 'pending').length})
            </h3>

            {tasks
              .filter(t => (t.status || 'pending') === 'pending')
              .map(task => (
                <div key={task._id} className="reminder-item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.subject}</p>
                    <small>{task.date} • {task.time} {task.period}</small>

                    {task.meetLink && (
                      <a href={task.meetLink} target="_blank" rel="noreferrer">
                        🔗 Join Google Meet
                      </a>
                    )}
                  </div>

                  <button className="delete-btn" onClick={() => deleteTask(task._id)}>
                    🗑️
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
