import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [consents, setConsents] = useState({ financialGuard: false, familyShield: false, evidenceAutoAttach: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ ...form, consents });
      toast.success('Account created! Welcome to CyberShield.');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const consentItems = [
    { key: 'financialGuard', label: 'Financial Transaction Guard', desc: 'Allow CyberShield to monitor UPI/bank transaction metadata and enable real-time fraud intervention.' },
    { key: 'familyShield', label: 'Family Shield Network', desc: 'Allow contact sync and incoming call risk-checking to protect your family members.' },
    { key: 'evidenceAutoAttach', label: 'Auto-file Evidence to Cyber Crime Portal', desc: 'Auto-generate FIR + evidence ZIP and submit to national cybercrime portal on complaint.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div style={{ position: 'fixed', top: '20%', right: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 30px rgba(0,212,255,0.35)' }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 1 }}>CREATE ACCOUNT</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Join CyberShield Sentinel</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}><AlertTriangle size={16} />{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="label">Phone (optional)</label>
                <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Password (min. 8 characters)</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {/* Consent section */}
            <div style={{ marginBottom: 24 }}>
              <div className="section-title">Permissions & Consent</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                Select the features you want to enable. All consents are optional and can be changed later.
              </p>
              {consentItems.map(({ key, label, desc }) => (
                <label key={key} className="checkbox-wrapper" style={{ marginBottom: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consents[key]}
                    onChange={e => setConsents(c => ({ ...c, [key]: e.target.checked }))}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {consents[key] && <CheckCircle size={13} color="var(--accent-green)" />}
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
              {loading ? <><div className="spinner" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
