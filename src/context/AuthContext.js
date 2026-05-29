import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pm_admin_token';
const EXP_KEY   = 'pm_admin_exp';

const AuthContext = createContext({
  token: null,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        const exp    = await SecureStore.getItemAsync(EXP_KEY);
        if (stored && exp && Date.now() < parseInt(exp)) {
          setToken(stored);
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(EXP_KEY);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (newToken) => {
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(EXP_KEY, String(exp));
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(EXP_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
