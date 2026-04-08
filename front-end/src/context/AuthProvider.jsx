import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/verify-token`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          // data.data contient userId, email, role si le backend le retourne
          if (data.data && typeof data.data === 'object') {
            setUser(data.data);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
      .finally(() => {
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login';
      });
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) return { isAuthenticated: true, user: null, login: () => {}, logout: () => {} };
  return context;
}
