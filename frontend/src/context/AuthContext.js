import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    const stored = localStorage.getItem('cs_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data;
    localStorage.setItem('cs_token', token);
    localStorage.setItem('cs_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user, token } = res.data;
    localStorage.setItem('cs_token', token);
    localStorage.setItem('cs_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
