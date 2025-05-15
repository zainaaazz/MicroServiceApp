// src/pages/OAuthRedirect.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation }    from 'react-router-dom';
import { useUser }                     from '../context/UserContext';
import '../styles/Login.css'; // reuse login background styling

const OAuthRedirect = () => {
  const { login } = useUser();
  const navigate  = useNavigate();
  const { search }= useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token  = params.get('token');
    if (!token) {
      return setError('No token returned from OAuth');
    }

    // fetch profile & finish login
    (async () => {
      try {
        const profRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profRes.ok) throw new Error('Failed to load profile');
        const userObj = await profRes.json();
        login(token, userObj);
        navigate('/user/dashboard', { replace: true });
      } catch (e) {
        console.error(e);
        setError('OAuth login failed');
      }
    })();
  }, [search, login, navigate]);

  return (
    <div className="login-page">
      {error
        ? <div className="error">{error}</div>
        : <p>Signing you in…</p>}
    </div>
  );
};

export default OAuthRedirect;
