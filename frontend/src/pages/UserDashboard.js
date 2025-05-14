import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import './Dashboard.css';

const UserDashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <Header name="Zainaaz" />
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main">
          <h2>Customer Dashboard</h2>
          <div className="card-box">
            <h3>My Card Balance</h3>
            <p className="card-balance">R8,100.00</p>
            <p className="card-status">Status: Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
