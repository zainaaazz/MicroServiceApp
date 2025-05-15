// src/pages/AdminUsers.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

export default function AdminUsers() {
  const { token } = useUser();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load users');
        setUsers(await res.json());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-page">
      <h2>All Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th>
            <th>Phone</th><th>City</th><th>Province</th>
            <th>Role</th><th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td>{u.city}</td>
              <td>{u.province}</td>
              <td>{u.role_id === 2 ? 'Staff' : 'Customer'}</td>
              <td>{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
