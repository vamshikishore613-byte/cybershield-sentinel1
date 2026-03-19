import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle, Shield, Clock } from 'lucide-react';
import { transactionAPI } from '../utils/api';
import toast from 'react-hot-toast';

const RISK_COLOR = { HIGH: 'var(--accent-red)', MEDIUM: '#ffc107', LOW: 'var(--accent-green)' };
const RISK_BG = { HIGH: 'rgba(255,45,85,0.08)', MEDIUM: 'rgba(255,193,7,0.08)', LOW: 'rgba(0,255,136,0.08)' };

export default function TransactionGuardPage() {
  const [form, setForm] = useState({ amount: '', recipient: '', upi_id: '', description: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [freezing, setFreezing] = useState(false);

  useEffect(() => {
    transactionAPI.history()
      .then(res => setHistory(res.data.transactions || []))
      .catch(() => {});
  }, []);

  const checkTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await transactionAPI.check(form);
      setResult(res.data);
      setHistory(prev => [{ ...form, ...res.data, createdAt: new Date().toISOString() }, ...prev]);
    } catch (err) { toast.error('Transaction check failed'); }
    finally { setLoading(false); }
  };

  const freezeTransaction = async () => {
    if (!result?.transaction_id) return;
    setFreezing(true);
    try {
      await transactionAPI.freeze({ transaction_id: result.transaction_id });
      toast.success('Transaction frozen! Contact your bank immediately.');
      setResult(prev => ({ ...prev, frozen: true }));
    } catch { toast.error('Failed to freeze transaction'); }
    finally { setFreezing(false); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Transaction Guard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>AI-powered real-time payment risk assessment before you transfer money.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Checker */}
        <div className="card">
          <div className="section-title">Check Transaction Safety</div>
          <form onSubmit={checkTransaction}>
            <div className="form-group">
              <label className="label">Amount (INR)</label>
              <input className="input" type="number" placeholder="5000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Recipient Name</label>
              <input className="input" placeholder="Recipient name" value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">UPI ID</label>
              <input className="input" placeholder="recipient@upi" value={form.upi_id} onChange={e => setForm(f => ({ ...f, upi_id: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Payment Purpose / Description</label>
              <input className="input" placeholder="What is this payment for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner" /> Analyzing...</> : <><Zap size={16} /> Check Transaction Safety</>}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: RISK_BG[result.risk_level], border: `1px solid ${RISK_COLOR[result.risk_level]}44` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {result.risk_level === 'HIGH'
                  ? <AlertTriangle size={20} color="var(--accent-red)" />
                  : result.risk_level === 'MEDIUM'
                  ? <AlertTriangle size={20} color="#ffc107" />
                  : <CheckCircle size={20} color="var(--accent-green)" />}
                <span style={{ fontWeight: 700, fontSize: 15, color: RISK_COLOR[result.risk_level] }}>{result.risk_level} RISK</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 13, color: RISK_COLOR[result.risk_level] }}>
                  {Math.round(result.risk_score * 100)}%
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{result.recommendation}</p>

              {result.risk_factors?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Risk Factors:</div>
                  {result.risk_factors.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: RISK_COLOR[result.risk_level], display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span>⚠️</span> {f}
                    </div>
                  ))}
                </div>
              )}

              {result.risk_level === 'HIGH' && !result.frozen && (
                <button className="btn btn-danger btn-sm" onClick={freezeTransaction} disabled={freezing} style={{ width: '100%', justifyContent: 'center' }}>
                  {freezing ? <><div className="spinner" /> Freezing...</> : '🔒 Freeze This Transaction'}
                </button>
              )}
              {result.frozen && (
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>✅ Transaction Frozen</div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        <div className="card">
          <div className="section-title">Transaction History</div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <Shield size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No transactions checked yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.slice(0, 10).map((tx, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      {tx.recipient && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>→ {tx.recipient}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={10} /> {new Date(tx.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className={`badge badge-${(tx.risk_level || 'medium').toLowerCase()}`}>{tx.risk_level || 'N/A'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
