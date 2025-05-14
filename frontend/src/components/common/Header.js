import React from 'react';
import './Header.css';

function Header({ name }) {
  return (
    <header className="header">
      <div className="logo">Flexitec</div>
      <div className="user">Welcome, {name}</div>
    </header>
  );
}

export default Header;
