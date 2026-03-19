import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Send, AlertTriangle, Shield } from 'lucide-react';
import { botAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ScammerBotPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const startBot = async () => {
    setStarting(true);
    try {
      const res = await botAPI.start(caseId);
      setSession(res.data);
      setMessages([{
        role: 'bot',
        text: res.data.initial_response,
        timestamp: new Date().toISOString(),
        note: '🤖 Bot persona activated'
      }]);
      toast.success('AI Scammer Engagement Bot activated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to start bot'); }
    finally { setStarting(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !session) return;

    const scammerMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'scammer', text: scammerMsg, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await botAPI.respond(caseId, { scammer_message: scammerMsg, session_id: session.session_id });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.bot_response, timestamp: new Date().toISOString(), note: res.data.intelligence_note }]);
    } catch { toast.error('Bot response failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      <button onClick={() => navigate(`/cases/${caseId}`)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Case
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>AI Scammer Engagement Bot</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          The bot poses as a potential victim to gather intelligence on the scammer while protecting your identity.
        </p>
      </div>

      {/* Warning */}
      <div className="alert alert-warning" style={{ marginBottom: 20 }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span>All conversations are logged and may be used as legal evidence. Paste scammer messages below to have the AI respond as a decoy victim.</span>
      </div>

      {!session ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Bot size={48} color="var(--accent-cyan)" style={{ marginBottom: 16, animation: 'pulse-glow 2s infinite' }} />
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Deploy Scammer Engagement Bot</h2>
          {session === null && (
            <>
              <div style={{ margin: '16px auto', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', maxWidth: 360, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Bot Persona</div>
                <div style={{ fontSize: 13 }}>👤 <strong>Ramesh Kumar</strong>, 45, Retired Teacher, Bhopal</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Curious about investment opportunities, cautious but interested</div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                Once activated, paste any messages you receive from the scammer. The AI will respond as the decoy persona to keep them engaged while gathering intelligence.
              </p>
              <button className="btn btn-primary btn-lg" onClick={startBot} disabled={starting}>
                {starting ? <><div className="spinner" /> Deploying Bot...</> : <><Bot size={16} /> Activate Bot</>}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Bot header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0066ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-glow 2s infinite' }}>
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Decoy: {session.bot_persona?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)' }}>🟢 Bot Active — Intelligence Gathering Mode</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <Shield size={12} />
              Session: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{session.session_id?.slice(0, 8)}</span>
            </div>
          </div>

          {/* Chat */}
          <div ref={chatRef} style={{ height: 400, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'bot' ? 'flex-start' : 'flex-end' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 4, paddingRight: 4 }}>
                  {msg.role === 'bot' ? `🤖 ${session.bot_persona?.name}` : '❗ Scammer Message'} • {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div className={`chat-bubble ${msg.role === 'bot' ? 'chat-bot' : 'chat-scammer'}`}>
                  {msg.text}
                </div>
                {msg.note && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', paddingLeft: 4 }}>📊 {msg.note}</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Bot is crafting response...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              className="input"
              placeholder="Paste scammer's message here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
