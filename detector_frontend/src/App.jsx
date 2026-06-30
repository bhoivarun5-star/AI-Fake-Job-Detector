import { useState } from 'react'
import Login from './app/login/login'
import Register from './app/register/register'
import './App.css'

function App() {
  const [view, setView] = useState('login') // 'login', 'register', 'dashboard'
  const [userEmail, setUserEmail] = useState('')
  const [registrationNotice, setRegistrationNotice] = useState('')
  const [form, setForm] = useState({
    title: '',
    company_profile: '',
    description: '',
    requirements: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleLoginSuccess = (email) => {
    setUserEmail(email)
    setView('dashboard')
  }

  const handleRegisterSuccess = () => {
    setRegistrationNotice('Registration successful! Please log in to continue.')
    setView('login')
  }

  const handleLogout = () => {
    setView('login')
    setUserEmail('')
    setRegistrationNotice('')
    setResult(null)
    setError('')
    setForm({
      title: '',
      company_profile: '',
      description: '',
      requirements: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setForm({
      title: '',
      company_profile: '',
      description: '',
      requirements: ''
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() && !form.description.trim()) {
      setError('Please provide at least a Job Title or Description to analyze.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/detect/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()
      if (response.ok) {
        if (data.status === 'error') {
          setError(data.error || 'Server error. Model might not be trained yet.');
        } else {
          setResult(data)
        }
      } else {
        setError(data.error || 'Something went wrong during analysis.')
      }
    } catch (err) {
      console.error(err)
      setError('Unable to communicate with the detector backend. Ensure Django is running.')
    } finally {
      setLoading(false)
    }
  }

  // Render correct view based on current state
  if (view === 'login') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateToRegister={() => {
          setRegistrationNotice('')
          setView('register')
        }} 
        notice={registrationNotice}
      />
    )
  }

  if (view === 'register') {
    return (
      <Register 
        onNavigateToLogin={() => {
          setRegistrationNotice('')
          setView('login')
        }} 
        onRegisterSuccess={handleRegisterSuccess} 
      />
    )
  }

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-top">
          <span className="user-indicator">Signed in as: <strong>{userEmail}</strong></span>
          <button className="logout-link-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="badge">AI Fraud Prevention</div>
        <h1 className="title-gradient">Fake Job Detector</h1>
        <p className="subtitle">Analyze job posts using Machine Learning to safeguard against recruitment scams and fake employment listings.</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      {!result ? (
        <form onSubmit={handleSubmit} className="glass-card form-container">
          <div className="input-group">
            <label htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Remote Data Entry Assistant"
              value={form.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="company_profile">Company Profile / Name</label>
            <input
              type="text"
              id="company_profile"
              name="company_profile"
              placeholder="e.g. Acme Corp (Vague profiles often indicate risk)"
              value={form.company_profile}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Paste the primary job responsibilities and description here..."
              value={form.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="requirements">Job Requirements & Qualifications</label>
            <textarea
              id="requirements"
              name="requirements"
              rows="3"
              placeholder="Paste the required skills, qualifications, or experience..."
              value={form.requirements}
              onChange={handleInputChange}
            />
          </div>

          <div className="button-row">
            <button type="button" className="btn-secondary" onClick={handleClear} disabled={loading}>
              Clear
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="loading-spinner-container">
                  <span className="spinner"></span> Analyzing Listing...
                </span>
              ) : 'Run AI Analysis'}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card result-container fade-in">
          <div className={`result-header ${result.prediction === 1 ? 'danger' : 'safe'}`}>
            <div className="result-indicator-ring">
              <div className="percentage-display">
                <span className="percentage">{result.prediction === 1 ? result.fraud_probability : result.safe_probability}%</span>
                <span className="label-text">{result.prediction === 1 ? 'Scam Risk' : 'Safety Score'}</span>
              </div>
            </div>
            <h2 className="prediction-label">{result.label}</h2>
          </div>

          <div className="result-details">
            <div className="risk-metrics">
              <div className="metric-box">
                <div className="metric-label">Fraud Probability</div>
                <div className="metric-value danger-text">{result.fraud_probability}%</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">Safe Probability</div>
                <div className="metric-value safe-text">{result.safe_probability}%</div>
              </div>
            </div>

            {result.risk_flags && result.risk_flags.length > 0 ? (
              <div className="risk-section">
                <h3>Risk Flags Detected</h3>
                <ul className="risk-flags-list">
                  {result.risk_flags.map((flag, idx) => (
                    <li key={idx} className="risk-flag-item">
                      <span className="warning-icon">⚠️</span>
                      <span className="flag-text">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="safe-msg-container">
                <p>✅ No immediate risk indicators detected. The linguistic structure and keywords align with normal, legitimate job advertisements.</p>
              </div>
            )}

            <div className="safety-tips-section">
              <h3>Safety Guidelines for Job Seekers</h3>
              <ul className="safety-tips-list">
                <li>Never share private personal information (like SSN, birth certificate, bank details) before a formal in-person or live video interview.</li>
                <li>Be wary of jobs offering high pay for minimal hours or requiring zero previous training/skills.</li>
                <li>Legitimate companies will never request payment from you for "onboarding software", "laptop shipping fee", or training materials.</li>
                <li>Verify the sender's email domain matches the official company website (e.g., support@company.com, not company@gmail.com).</li>
              </ul>
            </div>

            <button className="btn-primary reset-btn" onClick={() => setResult(null)}>
              Analyze Another Posting
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
