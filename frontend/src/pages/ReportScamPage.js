import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, FileText, Mic, Video, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { casesAPI, evidenceAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SCAM_TYPES = [
  { value: 'phishing', label: 'Phishing Website', icon: '🎣' },
  { value: 'deepfake', label: 'Deepfake Image/Video', icon: '🎭' },
  { value: 'voice_clone', label: 'Voice Clone / AI Call', icon: '🎙️' },
  { value: 'fake_investment', label: 'Fake Investment', icon: '📈' },
  { value: 'fake_deal', label: 'Fake Deal / Refund', icon: '🛒' },
];

export default function ReportScamPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    description: '',
    url: '',
    contact: '',
    estimatedLoss: '',
    incidentDate: '',
    scamType: '',
  });

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'audio/*': [], 'video/*': [], 'application/pdf': [] },
    maxSize: 50 * 1024 * 1024,
  });

  const hasImage = files.some(f => f.type.startsWith('image/'));
  const hasAudio = files.some(f => f.type.startsWith('audio/'));
  const hasVideo = files.some(f => f.type.startsWith('video/'));

  const handleSubmit = async () => {
    if (!form.description && !form.url) {
      toast.error('Please provide a description or URL');
      return;
    }
    setLoading(true);
    try {
      const res = await casesAPI.create({ ...form, hasImage, hasAudio, hasVideo });
      const caseId = res.data.case.id;

      // Upload evidence files
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('caseId', caseId);
        fd.append('evidenceType', file.type.split('/')[0]);
        await evidenceAPI.upload(fd).catch(() => {});
      }

      toast.success('Case created! AI analysis complete.');
      navigate(`/cases/${caseId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Report a Scam</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Our multi-stage AI will analyze your report and generate an action plan.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: step >= s ? 'var(--accent-cyan)' : 'var(--border)',
              color: step >= s ? '#000' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>{s}</div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--accent-cyan)' : 'var(--border)', transition: 'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div className="section-title">Scam Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              {SCAM_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setForm(f => ({ ...f, scamType: value }))}
                  style={{
                    padding: '14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    background: form.scamType === value ? 'rgba(0,212,255,0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${form.scamType === value ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    color: 'var(--text-primary)', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  {form.scamType === value && <CheckCircle size={14} color="var(--accent-cyan)" style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', justifyContent: 'center' }}>
              Next: Add Details <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div className="section-title">Case Details</div>
            <div className="form-group">
              <label className="label">Description *</label>
              <textarea className="input" placeholder="Describe the scam in detail — what happened, how they contacted you, what they asked for..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 120 }} />
            </div>
            <div className="form-group">
              <label className="label">Suspicious URL (if any)</label>
              <div style={{ position: 'relative' }}>
                <Link2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="https://suspicious-site.com" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={{ paddingLeft: 34 }} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Scammer Contact (phone/email)</label>
                <input className="input" placeholder="+91 9999999999" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Estimated Loss (INR)</label>
                <input className="input" type="number" placeholder="0" value={form.estimatedLoss} onChange={e => setForm(f => ({ ...f, estimatedLoss: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Date of Incident</label>
              <input className="input" type="date" value={form.incidentDate} onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 2, justifyContent: 'center' }}>Next: Evidence <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div className="section-title">Upload Evidence</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Upload screenshots, audio recordings, videos, or PDFs. Supported: JPG, PNG, MP3, MP4, WAV, PDF (max 50MB each).
            </p>

            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--accent-cyan)' : 'var(--border)'}`,
                borderRadius: 12, padding: 32, textAlign: 'center',
                cursor: 'pointer', marginBottom: 16,
                background: isDragActive ? 'rgba(0,212,255,0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <input {...getInputProps()} />
              <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}
              </p>
            </div>

            {files.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                    {f.type.startsWith('image/') ? '🖼️' : f.type.startsWith('audio/') ? '🎵' : f.type.startsWith('video/') ? '🎬' : '📄'}
                    <span style={{ color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: 16 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              Our AI will run deepfake detection, voice clone analysis, and URL scanning on your evidence.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {loading ? <><div className="spinner" /> Analyzing with AI...</> : '🛡️ Submit & Analyze'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
