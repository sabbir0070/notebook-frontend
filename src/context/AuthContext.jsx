import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error("Error fetching user data", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, [token]);

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, isAuthenticated: !!user, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
