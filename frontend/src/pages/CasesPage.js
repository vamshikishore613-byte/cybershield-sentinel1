import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { casesAPI } from '../utils/api';
import { Link } from 'react-router-dom';

const RISK_BADGE = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
const SCAM_LABEL = { phishing: 'Phishing', deepfake: 'Deepfake', voice_clone: 'Voice Clone', fake_investment: 'Fake Investment', fake_deal: 'Fake Deal' };
const STATUS_STYLE = {
  open: { color: '#ffc107', label: 'Open' },
  confirmed: { color: 'var(--accent-orange)', label: 'Confirmed' },
  complaint_filed: { color: 'var(--accent-green)', label: 'Complaint Filed' },
  dismissed: { color: 'var(--text-muted)', label: 'Dismissed' },
};

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    casesAPI.list()
      .then(res => setCases(res.data.cases || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.description?.toLowerCase().includes(search.toLowerCase()) || c.url?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.aiAnalysis?.verdict?.risk_level?.toLowerCase() === filter || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>My Cases</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{cases.length} total cases reported</p>
        </div>
        <Link to="/report" className="btn btn-primary">+ Report New Scam</Link>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <select className="input" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Cases</option>
          <option value="critical">Critical</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium</option>
          <option value="complaint_filed">Complaint Filed</option>
          <option value="open">Open</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Shield size={40} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{search ? 'No cases match your search.' : 'No cases yet. Stay safe and report any suspicious activity.'}</p>
          <Link to="/report" className="btn btn-primary" style={{ textDecoration: 'none' }}>Report a Scam</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => {
            const risk = c.aiAnalysis?.verdict?.risk_level || 'MEDIUM';
            const status = STATUS_STYLE[c.status] || STATUS_STYLE.open;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="card"
                style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                {/* Score circle */}
                <div className={`score-circle score-${risk.toLowerCase()}`} style={{ width: 52, height: 52, fontSize: 13, flexShrink: 0 }}>
                  {c.aiAnalysis?.verdict?.confidence_percentage || '?'}%
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description?.slice(0, 80) || 'No description provided'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>🏷️ {SCAM_LABEL[c.scamType] || 'Unknown'}</span>
                    <span>📅 {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    {c.estimatedLoss && <span>💰 ₹{Number(c.estimatedLoss).toLocaleString('en-IN')}</span>}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span className={`badge ${RISK_BADGE[risk] || 'badge-medium'}`}>{risk}</span>
                  <span style={{ fontSize: 11, color: status.color, fontWeight: 500 }}>{status.label}</span>
                </div>

                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
