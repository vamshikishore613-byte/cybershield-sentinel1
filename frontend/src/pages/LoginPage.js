import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to CyberShield!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      {/* BG glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 40px rgba(0,212,255,0.4)'
          }}>
            <Shield size={32} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 1 }}>CYBERSHIELD SENTINEL</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>AI-Powered Scam Intelligence Platform</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>Sign In</h2>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? <><div className="spinner" /> Authenticating...</> : 'Sign In'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>Create Account</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Demo: register a new account to get started
        </div>
      </div>
    </div>
  );
}
