import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../pages/Dashboard.css';


const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-wrapper">
      <Header />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
