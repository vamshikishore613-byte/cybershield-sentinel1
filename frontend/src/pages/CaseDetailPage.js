import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Download, FileText, Bot, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, ExternalLink, Phone, RefreshCw } from 'lucide-react';
import { casesAPI, actionPlansAPI, recoveryAPI, legalAPI } from '../utils/api';
import toast from 'react-hot-toast';

const RISK_COLOR = { CRITICAL: 'var(--accent-red)', HIGH: 'var(--accent-orange)', MEDIUM: '#ffc107', LOW: 'var(--accent-green)' };
const SCAM_LABEL = { phishing: 'Phishing Website', deepfake: 'Deepfake Image/Video', voice_clone: 'AI Voice Clone', fake_investment: 'Fake Investment', fake_deal: 'Fake Deal/Refund' };

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filing, setFiling] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  const token = localStorage.getItem('cs_token');

  useEffect(() => {
    Promise.all([
      casesAPI.get(id),
      actionPlansAPI.get(id),
      recoveryAPI.get(id)
    ]).then(([caseRes, planRes, recRes]) => {
      setCaseData(caseRes.data.case);
      setActionPlan(planRes.data.action_plan);
      setRecovery(recRes.data.recovery_plan);
    }).catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileComplaint = async () => {
    setFiling(true);
    try {
      const res = await casesAPI.fileComplaint(id);
      setCaseData(prev => ({ ...prev, complaintId: res.data.complaintId, status: 'complaint_filed' }));
      toast.success(`Complaint filed! ID: ${res.data.complaintId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to file complaint');
    } finally {
      setFiling(false);
    }
  };

  const handleFeedback = async (feedback) => {
    try {
      await casesAPI.feedback(id, feedback);
      toast.success('Feedback submitted. Thank you for improving our AI!');
    } catch { toast.error('Failed to submit feedback'); }
  };

  const downloadDoc = (url) => {
    const fullUrl = `${url}?token=${token}`;
    // Open with auth header not possible via anchor, use direct URL with bearer in query won't work either
    // Best approach: open route which has the token in the Authorization header via fetch then blob download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = url.split('/').pop() + '.pdf';
        a.click();
        toast.success('Document downloaded!');
      })
      .catch(() => toast.error('Download failed'));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!caseData) return <div className="alert alert-danger">Case not found.</div>;

  const risk = caseData.aiAnalysis?.verdict?.risk_level || 'MEDIUM';
  const riskColor = RISK_COLOR[risk] || '#ffc107';
  const score = caseData.aiAnalysis?.verdict?.confidence_percentage || 0;

  const tabs = [
    { key: 'analysis', label: 'AI Analysis' },
    { key: 'action', label: 'Action Plan' },
    { key: 'recovery', label: 'Recovery Plan' },
    { key: 'documents', label: 'Legal Docs' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/cases')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Cases
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 24, borderColor: riskColor + '44' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`badge badge-${risk.toLowerCase()}`}>{risk} RISK</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SCAM_LABEL[caseData.scamType] || 'Unknown Type'}</span>
              {caseData.complaintId && <span className="badge badge-info">Complaint Filed</span>}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>{caseData.description}</p>
            {caseData.url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <ExternalLink size={12} />
                <span style={{ fontFamily: 'var(--font-mono)' }}>{caseData.url}</span>
              </div>
            )}
            {caseData.complaintId && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-green)' }}>
                ✅ Complaint ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{caseData.complaintId}</span>
              </div>
            )}
          </div>

          {/* Score circle */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div className={`score-circle score-${risk.toLowerCase()}`} style={{ width: 80, height: 80, fontSize: 20, margin: '0 auto 8px' }}>
              {score}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Scam Score</div>
          </div>
        </div>

        {/* Actions */}
        <div className="divider" style={{ margin: '16px 0' }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!caseData.complaintId ? (
            <button className="btn btn-danger btn-sm" onClick={handleFileComplaint} disabled={filing}>
              {filing ? <><div className="spinner" /> Filing...</> : <><FileText size={14} /> File Cyber Complaint</>}
            </button>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(0,255,136,0.08)', borderRadius: 6, border: '1px solid rgba(0,255,136,0.2)' }}>
              <CheckCircle size={14} /> Complaint Filed at Cyber Crime Portal
            </div>
          )}
          <Link to={`/scammer-bot/${id}`} className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
            <Bot size={14} /> Launch Scammer Bot
          </Link>
          <Link to={`/legal-docs/${id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            <Download size={14} /> Legal Documents
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Was this correct?</span>
            <button className="btn btn-ghost btn-sm" onClick={() => handleFeedback('false_positive')} title="Mark as False Positive">
              <ThumbsDown size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => handleFeedback('confirmed')} title="Confirm Scam">
              <ThumbsUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              color: activeTab === t.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === t.key ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Verdict */}
          <div className="card">
            <div className="section-title">AI Verdict</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scam Probability</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: riskColor }}>{score}%</span>
              </div>
              <div className="risk-bar"><div className="risk-bar-fill" style={{ width: `${score}%`, background: riskColor }} /></div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {caseData.aiAnalysis?.verdict?.recommendation}
            </p>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Model: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{caseData.aiAnalysis?.model_version}</span>
            </div>
          </div>

          {/* Text Analysis */}
          {caseData.aiAnalysis?.text_analysis && (
            <div className="card">
              <div className="section-title">Text Analysis</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Suspicion Score</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: riskColor }}>{Math.round(caseData.aiAnalysis.text_analysis.score * 100)}%</span>
              </div>
              {caseData.aiAnalysis.text_analysis.keywords_found?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Suspicious Keywords Detected:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {caseData.aiAnalysis.text_analysis.keywords_found.map(kw => (
                      <span key={kw} className="tag" style={{ color: 'var(--accent-red)', borderColor: 'rgba(255,45,85,0.3)', background: 'rgba(255,45,85,0.08)' }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Analysis */}
          {caseData.aiAnalysis?.image_analysis && (
            <div className="card">
              <div className="section-title">Deepfake Analysis</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: caseData.aiAnalysis.image_analysis.is_manipulated ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
                  {caseData.aiAnalysis.image_analysis.is_manipulated ? '⚠️ MANIPULATION DETECTED' : '✅ No Manipulation'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <strong>Origin Hint:</strong> {caseData.aiAnalysis.image_analysis.probable_origin_hint}
              </div>
              {caseData.aiAnalysis.image_analysis.metadata_anomalies?.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Anomalies: {caseData.aiAnalysis.image_analysis.metadata_anomalies.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Audio Analysis */}
          {caseData.aiAnalysis?.audio_analysis && (
            <div className="card">
              <div className="section-title">Voice Clone Analysis</div>
              <div style={{ fontSize: 13, color: caseData.aiAnalysis.audio_analysis.is_voice_clone ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600, marginBottom: 8 }}>
                {caseData.aiAnalysis.audio_analysis.is_voice_clone ? '⚠️ VOICE CLONE DETECTED' : '✅ Natural Voice'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <strong>Hint:</strong> {caseData.aiAnalysis.audio_analysis.voice_clone_hint}
              </div>
              {caseData.aiAnalysis.audio_analysis.tts_pattern_match && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Pattern Match: <span className="tag">{caseData.aiAnalysis.audio_analysis.tts_pattern_match}</span>
                </div>
              )}
            </div>
          )}

          {/* Safe Alternatives */}
          {caseData.aiAnalysis?.safe_alternatives?.length > 0 && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-title">✅ Safe Alternatives</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                Instead of the detected scam platform, consider these regulated & trusted alternatives:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {caseData.aiAnalysis.safe_alternatives.map((alt, i) => (
                  <a key={i} href={alt.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)', marginBottom: 4 }}>{alt.name} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} /></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alt.reason}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'action' && actionPlan && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="section-title">Immediate Steps</div>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actionPlan.immediate_steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: 'var(--text-primary)', paddingTop: 2 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card">
            <div className="section-title">Legal Steps</div>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actionPlan.legal_steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: 'var(--text-primary)', paddingTop: 2 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="section-title">Emergency Helplines</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {Object.entries(actionPlan.helpline_numbers).map(([key, num]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <Phone size={13} color="var(--accent-cyan)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent-cyan)', fontWeight: 600 }}>{num}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recovery' && recovery && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div className="section-title" style={{ margin: 0, marginBottom: 4 }}>Recovery Checklist</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Recovery Probability: <strong style={{ color: 'var(--accent-green)' }}>{recovery.recovery_probability}</strong></div>
              </div>
              {recovery.estimated_loss > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estimated Loss</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent-red)' }}>₹{Number(recovery.estimated_loss).toLocaleString('en-IN')}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recovery.checklist.map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.urgency === 'IMMEDIATE' ? 'var(--accent-red)' : item.urgency.includes('HOURS') ? 'var(--accent-orange)' : 'var(--text-muted)', flexShrink: 0, paddingTop: 2 }}>
                    {item.urgency}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <Link to={`/legal-docs/${id}`} style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', cursor: 'pointer' }}>
            <FileText size={40} color="var(--accent-cyan)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Legal Documents</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Download FIR, Bank Dispute Letter and full evidence package for this case.</p>
            <span className="btn btn-primary">View Legal Documents</span>
          </div>
        </Link>
      )}
    </div>
  );
}
