import { useState, useEffect } from 'react'
import './login.css'

function Login({ onLoginSuccess, onNavigateToRegister, initialEmail = '', notice = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [theme, setTheme] = useState(() => {
    // Check local storage or default to light mode
    return localStorage.getItem('theme') || 'light'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Store selected theme preference
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    // Simulate API login request
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(email)
        }, 1000)
      }
    }, 1500)
  }

  const handleReset = () => {
    setSuccess(false)
    setEmail('')
    setPassword('')
  }

  return (
    <div className={`login-container-wrapper theme-${theme}`}>
      <div className="login-theme-toggle">
        <button 
          onClick={toggleTheme} 
          className="toggle-button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <span className="toggle-icon">🌙 <span className="toggle-label">Dark Mode</span></span>
          ) : (
            <span className="toggle-icon">☀️ <span className="toggle-label">Light Mode</span></span>
          )}
        </button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-badge">🛡️</div>
          <h2>Welcome Back</h2>
          <p>Login to access your dashboard and scan job postings.</p>
        </div>

        {notice && <div className="login-alert success-alert">{notice}</div>}
        {error && <div className="login-alert danger-alert">{error}</div>}

        {!success ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#forgot" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-spinner-container">
                  <span className="btn-spinner"></span> Logging in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          <div className="login-success-state">
            <div className="success-circle">✓</div>
            <h3>Authentication Successful</h3>
            <p>Welcome back, <strong>{email}</strong>! Connecting to job detector...</p>
            <button className="login-reset-btn" onClick={handleReset}>
              Sign Out / Reset
            </button>
          </div>
        )}

        <div className="login-footer">
          <p>Don't have an account? <button type="button" className="register-link-btn" onClick={onNavigateToRegister}>Sign up</button></p>
        </div>
      </div>
    </div>
  )
}

export default Login
