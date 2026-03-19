import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Shield, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { familyAPI, scamDbAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function FamilyShieldPage() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [checkingCall, setCheckingCall] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', relationship: '' });
  const [callCheck, setCallCheck] = useState({ number: '', result: null });
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    familyAPI.getNetwork()
      .then(res => setNetwork(res.data.network))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createNetwork = async () => {
    setCreating(true);
    try {
      const res = await familyAPI.create({ networkName: "My Family Shield" });
      setNetwork(res.data.network);
      toast.success('Family Shield created!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create network'); }
    finally { setCreating(false); }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await familyAPI.addMember(memberForm);
      setNetwork(res.data.network);
      setMemberForm({ name: '', phone: '', relationship: '' });
      setShowAddMember(false);
      toast.success(`${memberForm.name} added to Family Shield!`);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add member'); }
    finally { setAddingMember(false); }
  };

  const checkCall = async () => {
    if (!callCheck.number) { toast.error('Enter a phone number'); return; }
    setCheckingCall(true);
    try {
      const res = await familyAPI.checkCall({ phone_number: callCheck.number });
      setCallCheck(prev => ({ ...prev, result: res.data }));
    } catch (err) { toast.error('Call check failed'); }
    finally { setCheckingCall(false); }
  };

  const reportNumber = async () => {
    if (!callCheck.number) return;
    try {
      await scamDbAPI.reportNumber({ number: callCheck.number, scam_type: 'voice_clone', description: 'Reported via Family Shield call check' });
      toast.success('Number reported to scam database!');
    } catch { toast.error('Failed to report number'); }
  };

  const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Other'];
  const RISK_COLOR = { HIGH: 'var(--accent-red)', MEDIUM: '#ffc107', LOW: 'var(--accent-green)' };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Family Shield Network</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Protect your family from scam calls and fraudulent communications.</p>
      </div>

      {!network ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} color="var(--accent-purple)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Create Your Family Shield</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Set up a family protection network to monitor calls, check scam numbers, and keep your loved ones safe.
          </p>
          <button className="btn btn-primary btn-lg" onClick={createNetwork} disabled={creating}>
            {creating ? <><div className="spinner" /> Creating...</> : <><Shield size={16} /> Activate Family Shield</>}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Members */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0 }}>Protected Members ({network.members?.length || 0})</div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(v => !v)}>
                <UserPlus size={14} /> Add Member
              </button>
            </div>

            {showAddMember && (
              <form onSubmit={addMember} style={{ marginBottom: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="form-group">
                  <label className="label">Name</label>
                  <input className="input" placeholder="Family member name" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">Phone Number</label>
                  <input className="input" placeholder="+91 9876543210" value={memberForm.phone} onChange={e => setMemberForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">Relationship</label>
                  <select className="input" value={memberForm.relationship} onChange={e => setMemberForm(f => ({ ...f, relationship: e.target.value }))} required>
                    <option value="">Select...</option>
                    {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingMember}>
                    {addingMember ? <><div className="spinner" /> Adding...</> : 'Add Member'}
                  </button>
                </div>
              </form>
            )}

            {network.members?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                No members added yet. Add family members to protect them.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {network.members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14 }}>👤</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.relationship} • {m.phone}</div>
                    </div>
                    <Shield size={14} color="var(--accent-green)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call checker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title">Call Risk Checker</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Check if an incoming call number is a known scam number.</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input
                  className="input"
                  placeholder="+91 9999999999"
                  value={callCheck.number}
                  onChange={e => setCallCheck(prev => ({ ...prev, number: e.target.value, result: null }))}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={checkCall} disabled={checkingCall}>
                  {checkingCall ? <div className="spinner" /> : <><Phone size={14} /> Check</>}
                </button>
              </div>

              {callCheck.result && (
                <div style={{
                  padding: '14px', borderRadius: 8,
                  background: callCheck.result.risk_level === 'HIGH' ? 'rgba(255,45,85,0.08)' : callCheck.result.risk_level === 'MEDIUM' ? 'rgba(255,193,7,0.08)' : 'rgba(0,255,136,0.08)',
                  border: `1px solid ${RISK_COLOR[callCheck.result.risk_level]}44`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {callCheck.result.risk_level === 'HIGH' ? <AlertTriangle size={16} color="var(--accent-red)" /> : <CheckCircle size={16} color={RISK_COLOR[callCheck.result.risk_level]} />}
                    <span style={{ fontWeight: 700, color: RISK_COLOR[callCheck.result.risk_level], fontSize: 13 }}>
                      {callCheck.result.risk_level} RISK
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{callCheck.result.recommendation}</p>
                  {callCheck.result.in_scam_database && <span className="badge badge-critical" style={{ marginBottom: 10 }}>In Scam Database</span>}
                  {callCheck.result.risk_level !== 'LOW' && (
                    <button className="btn btn-danger btn-sm" onClick={reportNumber}>Report This Number</button>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="card">
              <div className="section-title">Shield Stats</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Members Protected</span>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>{network.members?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Calls Checked</span>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>{network.callsChecked || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Network Status</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>🟢 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
