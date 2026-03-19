import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportScamPage from './pages/ReportScamPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import FamilyShieldPage from './pages/FamilyShieldPage';
import TransactionGuardPage from './pages/TransactionGuardPage';
import ScammerBotPage from './pages/ScammerBotPage';
import LegalDocsPage from './pages/LegalDocsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1526',
              color: '#e8f0fe',
              border: '1px solid #1a2840',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#050810' } },
            error: { iconTheme: { primary: '#ff2d55', secondary: '#050810' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="report" element={<ReportScamPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="family-shield" element={<FamilyShieldPage />} />
            <Route path="transaction-guard" element={<TransactionGuardPage />} />
            <Route path="scammer-bot/:caseId" element={<ScammerBotPage />} />
            <Route path="legal-docs/:caseId" element={<LegalDocsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
