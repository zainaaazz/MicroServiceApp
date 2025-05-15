// src/components/common/Header.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <h1>Flexitec Bank</h1>
      {user && (
        <div className="header-right">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      )}
    </header>
  );
};

export default Header;
