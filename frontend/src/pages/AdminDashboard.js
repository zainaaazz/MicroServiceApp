import React from 'react';
import Header from '../components/common/Header';

const AdminDashboard = () => {
  return (
    <div>
      <Header name="Admin" />
      <main style={{ marginTop: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <ul>
          <li>View All Users</li>
          <li>View All Cards</li>
          <li>Search by City/Province/Status</li>
          <li>Block / Unblock Cards</li>
          <li>Reset Credentials</li>
          <li>Update User Records</li>
        </ul>
      </main>
    </div>
  );
};

export default AdminDashboard;
