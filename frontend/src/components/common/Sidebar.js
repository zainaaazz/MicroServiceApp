import React from 'react';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCreditCard, faUser } from '@fortawesome/free-solid-svg-icons';


const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
     <li><FontAwesomeIcon icon={faHome} /> Dashboard</li>
     <li><FontAwesomeIcon icon={faCreditCard} /> My Cards</li>
     <li><FontAwesomeIcon icon={faUser} /> Profile</li>
     </ul>
    </div>
  );
};

export default Sidebar;
