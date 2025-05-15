// src/components/common/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Sidebar.css';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user }     = useUser();

  if (pathname === '/login' || pathname === '/oauth2/redirect') {
    return null;
  }

  const isAdmin = user?.role_id === 2;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {isAdmin ? (
            <>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  All Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/cards"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  All Cards
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/profile"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Admin Profile
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/user/dashboard"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/cards"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  My Cards
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/profile"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Profile
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
