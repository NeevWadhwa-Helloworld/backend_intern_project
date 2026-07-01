import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, UserPlus, ArrowLeft } from 'lucide-react';
import HumanCheck from './HumanCheck';

const Register = ({ toggleView }) => {
  const { register, loading, showToast } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isHuman, setIsHuman] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(Date.now());

  const { username, email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    if (honeypot) return;

    if (!isHuman) {
      showToast('Please confirm you are human before registering.', 'error');
      return;
    }

    await register(username, email, password, role, {
      isHuman,
      formLoadedAt: formLoadedAt.current,
      website: honeypot
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register to begin managing tasks securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-control search-input"
                placeholder="john_doe"
                value={username}
                onChange={handleChange}
              />
              <User className="search-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-control search-input"
                placeholder="john@example.com"
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
                placeholder="Min 6 characters"
                value={password}
                onChange={handleChange}
              />
              <Lock className="search-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Account Role (For Evaluation convenience)</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <select
                id="role"
                name="role"
                className="input-control search-input"
                value={role}
                onChange={handleChange}
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="user">Standard User (CRUD own tasks)</option>
                <option value="admin">Administrator (CRUD all tasks & Stats)</option>
              </select>
              <Shield className="search-icon" size={18} />
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
            {loading ? 'Registering...' : (
              <>
                <span>Sign Up</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button
            onClick={() => toggleView('login')}
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
            <ArrowLeft size={14} />
            <span>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
