import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCreditCard, faUser } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li>

          <NavLink
                to="/user/dashboard"
                className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                }
                >
                <FontAwesomeIcon icon={faHome} /> Dashboard
            </NavLink>

        </li>
        <li>

       <NavLink
            to="/user/cards"
            className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
            }
            >
            <FontAwesomeIcon icon={faCreditCard} /> My Cards
        </NavLink>

        </li>
        <li>

            <NavLink
                to="/user/profile"
                className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                }
                >
                <FontAwesomeIcon icon={faUser} /> Profile
            </NavLink>

        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
