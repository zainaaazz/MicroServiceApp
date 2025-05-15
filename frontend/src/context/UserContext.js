// src/context/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

// Helpers to safely read from localStorage
const getInitialToken = () => {
  try {
    const raw = localStorage.getItem('token');
    if (raw && raw !== 'undefined') return raw;
  } catch {}
  return null;
};

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        // normalize full_name → name
        name: parsed.full_name || parsed.name || '',
      };
    }
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
  }
  return null;
};

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser]   = useState(getInitialUser);

  const login = (newToken, userObj) => {
    const normalizedUser = {
      ...userObj,
      name: userObj.full_name || userObj.name || '',
    };
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
    setToken(newToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ token, user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
