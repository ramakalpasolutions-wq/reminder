'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../globals.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    // simple check (replace later with real auth)
    if (email === 'admin@gmail.com' && password === 'admin123') {
      sessionStorage.setItem('isLoggedIn', 'true')
      sessionStorage.setItem('userEmail', email);  // e.g., 'user@example.com'
      router.push('/')
    } else {
      alert('Invalid credentials')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  )
}
