import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

const UserCards = () => {
  return (
    <DashboardLayout>
      <h2>My Cards</h2>
      <div className="card-box">
        <h3>Visa Debit Card</h3>
        <p className="card-balance">Balance: R5,400.00</p>
        <p className="card-status">Status: Active</p>
        <p>Card Number: **** **** **** 0145</p>
      </div>
    </DashboardLayout>
  );
};

export default UserCards;
