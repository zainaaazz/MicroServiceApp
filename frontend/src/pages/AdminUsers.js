// src/pages/AdminUsers.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

export default function AdminUsers() {
  const { token } = useUser();
  const [allUsers, setAllUsers]     = useState([]);
  const [visible, setVisible]       = useState([]);
  const [filters, setFilters]       = useState({
    city: '',
    province: '',
    role: '',
    is_active: ''
  });
  const [options, setOptions]       = useState({
    cities: [],
    provinces: [],
    roles:    ['Customer','Staff'],
    statuses: ['Yes','No']
  });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // Fetch once
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        if (!res.ok) throw new Error('Could not load users');
        const data = await res.json();

        // build dynamic dropdowns from the data
        const cities    = [...new Set(data.map(u => u.city).filter(Boolean))];
        const provinces = [...new Set(data.map(u => u.province).filter(Boolean))];

        setOptions(o => ({ ...o, cities, provinces }));
        setAllUsers(data);
        setVisible(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // handle form dropdown changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  // apply filters to the full list
  const applyFilters = e => {
    e.preventDefault();
    let filtered = allUsers;
    if (filters.city) {
      filtered = filtered.filter(u => u.city === filters.city);
    }
    if (filters.province) {
      filtered = filtered.filter(u => u.province === filters.province);
    }
    if (filters.role) {
      filtered = filtered.filter(u => 
        (filters.role === 'Staff' ? u.role_id === 2 : u.role_id !== 2)
      );
    }
    if (filters.is_active) {
      filtered = filtered.filter(u => 
        filters.is_active === 'Yes' ? u.is_active : !u.is_active
      );
    }
    setVisible(filtered);
  };

  if (loading) return <p>Loading users…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-page">
      <h2>All Users</h2>

      <form className="filter-form" onSubmit={applyFilters}>
        <label>
          City:
          <select name="city" value={filters.city} onChange={handleChange}>
            <option value="">All</option>
            {options.cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Province:
          <select name="province" value={filters.province} onChange={handleChange}>
            <option value="">All</option>
            {options.provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          Role:
          <select name="role" value={filters.role} onChange={handleChange}>
            <option value="">All</option>
            {options.roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label>
          Active:
          <select name="is_active" value={filters.is_active} onChange={handleChange}>
            <option value="">All</option>
            {options.statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn">Filter</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Province</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(u => (
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
