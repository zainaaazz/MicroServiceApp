import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

const UserProfile = () => {
  return (
    <DashboardLayout>
      <h2>My Profile</h2>
      <div className="card-box">
        <p><strong>Full Name:</strong> Zainaaz Hansa</p>
        <p><strong>Email:</strong> zainaaz@example.com</p>
        <p><strong>Phone:</strong> +27 71 234 5678</p>
        <p className="card-status">Status: Active</p>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
