// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Login.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const { login }      = useUser();
  const navigate       = useNavigate();
  const location       = useLocation();
  const from           = location.state?.from?.pathname || '/user/dashboard';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      // 1) authenticate
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        return setError(data.error || 'Login failed');
      }

      // 2) fetch profile
      const profRes = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (!profRes.ok) {
        return setError('Could not fetch user profile');
      }
      const userObj = await profRes.json();

      // 3) finish login in context & redirect
      login(data.token, userObj);
      navigate(from, { replace: true });

    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Flexitec Login</h2>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {/* This must be submit! */}
        <button type="submit" className="btn">
          Log In
        </button>

        <button
          type="button"
          className="btn google-btn"
          onClick={() => window.location.href = `${API}/api/auth/google`}
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default Login;
