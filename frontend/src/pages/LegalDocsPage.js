import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Shield, AlertTriangle, Archive } from 'lucide-react';
import { legalAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function LegalDocsPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState('');
  const token = localStorage.getItem('cs_token');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const downloadDoc = async (type) => {
    setDownloading(type);
    const url = type === 'fir'
      ? `${API_BASE}/legal-documents/fir/${caseId}`
      : `${API_BASE}/legal-documents/bank-dispute/${caseId}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${type === 'fir' ? 'FIR' : 'BankDispute'}_${caseId}.pdf`;
      a.click();
      toast.success('Document downloaded successfully!');
    } catch (err) { toast.error('Download failed. Please try again.'); }
    finally { setDownloading(''); }
  };

  const documents = [
    {
      id: 'fir',
      title: 'First Information Report (FIR)',
      desc: 'Official FIR document with AI analysis summary, case details, and complainant information. Submit to police cyber cell or cybercrime.gov.in.',
      icon: '📋',
      badge: 'Official Document',
      color: 'var(--accent-red)',
    },
    {
      id: 'bank',
      title: 'Bank Dispute Letter',
      desc: 'Formal letter to your bank requesting transaction freeze, chargeback, or reversal. Includes FIR reference and AI evidence summary.',
      icon: '🏦',
      badge: 'Bank Submission',
      color: 'var(--accent-blue)',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680 }}>
      <button onClick={() => navigate(`/cases/${caseId}`)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Case
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Legal Documents</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Auto-generated legal documents for case <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{caseId?.slice(0, 12)}...</span>
        </p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <Shield size={16} style={{ flexShrink: 0 }} />
        All documents are auto-generated from your case data and AI analysis. Review before submission to authorities.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {documents.map(doc => (
          <div key={doc.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>{doc.icon}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title}</h3>
                  <span className="badge badge-info" style={{ fontSize: 10 }}>{doc.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{doc.desc}</p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}
              onClick={() => downloadDoc(doc.id)}
              disabled={!!downloading}
            >
              {downloading === doc.id ? <><div className="spinner" /> Generating PDF...</> : <><Download size={14} /> Download PDF</>}
            </button>
          </div>
        ))}

        {/* Complaint package info */}
        <div className="card" style={{ borderColor: 'rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.03)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 32 }}>📦</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Full Complaint Package</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Bundle all evidence, AI analysis report, FIR, and bank dispute letter into a single ZIP package — ready to submit to the National Cyber Crime Reporting Portal.
              </p>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} />
                Use the "File Cyber Complaint" button on the case page to auto-submit to cybercrime.gov.in
              </div>
            </div>
          </div>
        </div>

        {/* Helplines */}
        <div className="card">
          <div className="section-title">Submission Channels</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { name: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', num: '1930' },
              { name: 'RBI Banking Ombudsman', url: 'https://rbisb.rbi.org.in', num: '14440' },
              { name: 'SEBI Investor Helpline', url: 'https://scores.gov.in', num: '1800-266-7575' },
              { name: 'Consumer Forum', url: 'https://consumerhelpline.gov.in', num: '1800-11-4000' },
            ].map(item => (
              <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>{item.num}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
