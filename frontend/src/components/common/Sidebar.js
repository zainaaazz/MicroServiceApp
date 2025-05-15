// src/components/common/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const { pathname } = useLocation();
  // Hide on login & OAuth redirect
  if (pathname === '/login' || pathname === '/oauth2/redirect') {
    return null;
  }

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><NavLink to="/user/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/user/cards">My Cards</NavLink></li>
          <li><NavLink to="/user/profile">Profile</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
