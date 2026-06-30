import { useState, useEffect } from 'react'
import './register.css'

function Register({ onNavigateToLogin, onRegisterSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions.')
      return
    }

    setLoading(true)

    // Simulate API registration request
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      if (onRegisterSuccess) {
        setTimeout(() => {
          onRegisterSuccess(email)
        }, 1200)
      }
    }, 1500)
  }

  return (
    <div className={`register-container-wrapper theme-${theme}`}>
      <div className="register-theme-toggle">
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

      <div className="register-card">
        <div className="register-header">
          <div className="logo-badge">🛡️</div>
          <h2>Create Account</h2>
          <p>Sign up to scan job listings and safeguard your career.</p>
        </div>

        {error && <div className="register-alert danger-alert">{error}</div>}

        {!success ? (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-input-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                type="text"
                id="reg-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                type="password"
                id="reg-confirm"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="register-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                I agree to the <a href="#terms" className="terms-link">Terms & Conditions</a>
              </label>
            </div>

            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-spinner-container">
                  <span className="btn-spinner"></span> Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        ) : (
          <div className="register-success-state">
            <div className="success-circle">✓</div>
            <h3>Registration Complete</h3>
            <p>Your account has been created for <strong>{email}</strong>! Redirecting to detector dashboard...</p>
          </div>
        )}

        <div className="register-footer">
          <p>Already have an account? <button type="button" className="login-link-btn" onClick={onNavigateToLogin}>Sign in</button></p>
        </div>
      </div>
    </div>
  )
}

export default Register
