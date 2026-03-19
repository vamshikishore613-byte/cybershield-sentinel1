import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, LayoutDashboard, FilePlus, FolderOpen,
  Users, Zap, Bot, FileText, LogOut, Menu, X, Bell, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/report', icon: FilePlus, label: 'Report Scam' },
  { to: '/cases', icon: FolderOpen, label: 'My Cases' },
  { to: '/family-shield', icon: Users, label: 'Family Shield' },
  { to: '/transaction-guard', icon: Zap, label: 'Transaction Guard' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '68px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 0 16px rgba(0,212,255,0.4)'
          }}>
            <Shield size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: 1 }}>CYBERSHIELD</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Sentinel v2.1</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 10px', borderRadius: 8,
                marginBottom: 4,
                textDecoration: 'none',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                fontSize: 14,
                fontWeight: 500,
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 10px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? '240px' : '68px', transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          height: 60, borderBottom: '1px solid var(--border)',
          background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 50
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'block', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 500 }}>AI Shield Active</span>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1200, width: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
