import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import HumanCheck from './HumanCheck';

const Login = ({ toggleView }) => {
  const { login, loading, showToast } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isHuman, setIsHuman] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(Date.now());

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    if (honeypot) return;

    if (!isHuman) {
      showToast('Please confirm you are human before signing in.', 'error');
      return;
    }

    await login(email, password, {
      isHuman,
      formLoadedAt: formLoadedAt.current,
      website: honeypot
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to access your secure dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-control search-input"
                placeholder="you@example.com"
                value={email}
                onChange={handleChange}
              />
              <Mail className="search-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-control search-input"
                placeholder="••••••••"
                value={password}
                onChange={handleChange}
              />
              <Lock className="search-icon" size={18} />
            </div>
          </div>

          <HumanCheck
            checked={isHuman}
            onChange={setIsHuman}
            honeypotValue={honeypot}
            onHoneypotChange={setHoneypot}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading || !isHuman}
          >
            {loading ? 'Logging in...' : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => toggleView('register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 6,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Register</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
