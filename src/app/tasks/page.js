'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../globals.css'

export default function TasksPage() {
  // ✅ DEFAULT TO 'pending' instead of 'All'
  const [filter, setFilter] = useState('pending')
  const [tasks, setTasks] = useState([])
  const router = useRouter()
  
  const logout = () => {
    sessionStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

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

  /* ===== STATUS TOGGLE ===== */
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

    const res = await fetch('/api/task', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })

    if (!res.ok) return

    setTasks(prev =>
      prev.map(t =>
        t._id === id ? { ...t, status: newStatus } : t
      )
    )
  }

  /* ===== DELETE TASK ===== */
  const deleteTask = async (id) => {
    const res = await fetch(`/api/task?id=${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  /* ===== FIXED FILTER LOGIC ===== */
  const filteredTasks = tasks.filter(task => {
    // ✅ Handle tasks WITHOUT status field (your existing tasks)
    const taskStatus = task.status || 'pending'
    
    if (filter === 'pending') return taskStatus === 'pending'
    if (filter === 'completed') return taskStatus === 'completed'
    if (filter === 'upcoming') {
      // ✅ Fix date parsing for your format "2026-1-27"
      const [year, month, day] = task.date.split('-').map(Number)
      const taskDate = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const diff = (taskDate - today) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    }
    return true // 'all'
  })

  return (
    <div className="todo-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="todo-sidebar">
        <h2 className="logo">ToDo Manager</h2>

        <button className="sidebar-btn" onClick={() => router.push('/')}>
          📅 New Event
        </button>

        <button className="sidebar-btn active" onClick={() => router.push('/tasks')}>
          ✅ Tasks
        </button>
        <button className="sidebar-btn logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="todo-main">
        <div className="task-header">
          <h1>Task Manager</h1>
        </div>

        {/* STATS */}
        <div className="task-stats">
          <div className="task-stat-card">
            📋
            <h2>{tasks.length}</h2>
            <p>All Tasks</p>
          </div>
          <div className="task-stat-card">
            ⏳
            <h2>{tasks.filter(t => (t.status || 'pending') === 'pending').length}</h2>
            <p>Pending</p>
          </div>
          <div className="task-stat-card">
            ✅
            <h2>{tasks.filter(t => t.status === 'completed').length}</h2>
            <p>Completed</p>
          </div>
          <div className="task-stat-card">
            📅
            <h2>{filteredTasks.length}</h2>
            <p>Showing ({filter})</p>
          </div>
        </div>

        {/* TASK LIST */}
        <div className="task-list-card">
          <h2>📋 {filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks ({filteredTasks.length})</h2>

          {/* FILTER TABS */}
          <div className="task-tabs">
            {['all', 'pending', 'completed', 'upcoming'].map(f => (
              <button
                key={f}
                className={`tab ${filter === f ? 'active-tab' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* TASKS */}
          {filteredTasks.length === 0 ? (
            <div className="empty-task">
              📋
              <h3>No {filter} tasks</h3>
              <p>{filter === 'pending' ? 'All tasks completed!' : 'Add tasks to get started!'}</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              // ✅ Handle tasks without status field
              const taskStatus = task.status || 'pending'
              const isCompleted = taskStatus === 'completed'
              
              return (
                <div key={task._id} className={`reminder-item ${isCompleted ? 'completed-task' : ''}`}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* ✅ FIXED CHECKBOX - Only show for pending tasks */}
                    {!isCompleted && (
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleStatus(task._id, taskStatus)}
                        title="Mark as completed"
                      />
                    )}
                    
                    {/* ✅ SHOW CHECKMARK FOR COMPLETED */}
                    {isCompleted && (
                      <span style={{ color: '#10b981', fontSize: '20px', marginTop: '4px' }}>✅</span>
                    )}

                    <div style={{ opacity: isCompleted ? 0.6 : 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      <strong>{task.title}</strong>
                      {task.subject && <p>{task.subject}</p>}
                      <small>{task.date} • {task.time} {task.period}</small>
                      {task.meetLink && (
                        <a href={task.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#2563eb', fontSize: '13px' }}>
                          🔗 Google Meet
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* ✅ HIDE CHECKBOX FOR COMPLETED TASKS IN ACTION AREA */}
                    {!isCompleted && (
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleStatus(task._id, taskStatus)}
                        title="Mark completed"
                      />
                    )}
                    
                    <button
                      className="edit-btn"
                      onClick={() => router.push(`/?edit=${task._id}`)}
                      title="Edit"
                      disabled={isCompleted}
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
