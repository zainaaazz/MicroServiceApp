
import React from 'react';
import './Header.css';
import { useUser } from '../../context/UserContext';

const Header = () => {
  const { userName } = useUser();

  return (
    <header className="header">
      <h1>Flexitec Bank</h1>
      <span className="welcome">Welcome, {userName}</span>
    </header>
  );
};

export default Header;

