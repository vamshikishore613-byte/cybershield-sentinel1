import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, FilePlus, Users, Zap, ChevronRight } from 'lucide-react';
import { casesAPI, scamDbAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RISK_COLOR = { CRITICAL: 'var(--accent-red)', HIGH: 'var(--accent-orange)', MEDIUM: '#ffc107', LOW: 'var(--accent-green)' };
const SCAM_TYPE_LABEL = { phishing: 'Phishing', deepfake: 'Deepfake', voice_clone: 'Voice Clone', fake_investment: 'Fake Investment', fake_deal: 'Fake Deal' };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([casesAPI.list(), scamDbAPI.stats()])
      .then(([casesRes, statsRes]) => {
        setCases(casesRes.data.cases || []);
        setDbStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === 'open' || c.status === 'confirmed').length;
  const criticalCases = cases.filter(c => c.aiAnalysis?.verdict?.risk_level === 'CRITICAL').length;
  const resolvedCases = cases.filter(c => c.status === 'complaint_filed' || c.status === 'dismissed').length;

  const quickActions = [
    { label: 'Report a Scam', desc: 'Analyze URL, image, audio or video', icon: FilePlus, to: '/report', color: 'var(--accent-blue)' },
    { label: 'Family Shield', desc: 'Protect your family members', icon: Users, to: '/family-shield', color: 'var(--accent-purple)' },
    { label: 'Transaction Guard', desc: 'Check payment safety', icon: Zap, to: '/transaction-guard', color: 'var(--accent-orange)' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Your AI shield is active and monitoring threats in real-time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { value: totalCases, label: 'Total Cases', icon: Shield, color: 'var(--accent-cyan)' },
          { value: activeCases, label: 'Active Cases', icon: AlertTriangle, color: 'var(--accent-orange)' },
          { value: criticalCases, label: 'Critical Threats', icon: AlertTriangle, color: 'var(--accent-red)' },
          { value: resolvedCases, label: 'Resolved', icon: CheckCircle, color: 'var(--accent-green)' },
        ].map(({ value, label, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Recent Cases */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Recent Cases</div>
            <Link to="/cases" style={{ fontSize: 13, color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
          ) : cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <Shield size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No cases reported yet.</p>
              <Link to="/report" className="btn btn-primary btn-sm" style={{ marginTop: 12, textDecoration: 'none' }}>
                Report Your First Scam
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cases.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description?.slice(0, 60) || 'No description'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {SCAM_TYPE_LABEL[c.scamType] || 'Unknown'} • {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                    <span className={`badge badge-${(c.aiAnalysis?.verdict?.risk_level || 'medium').toLowerCase()}`}>
                      {c.aiAnalysis?.verdict?.risk_level || 'N/A'}
                    </span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="section-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickActions.map(({ label, desc, icon: Icon, to, color }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '66'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* DB Stats */}
          <div className="card">
            <div className="section-title">Scam Intelligence DB</div>
            {dbStats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Numbers Reported</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{dbStats.total_numbers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Reports</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{dbStats.total_reports}</span>
                </div>
                <div className="divider" style={{ margin: '8px 0' }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Helpline: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>1930</span> (Cyber Crime)</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading stats...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
