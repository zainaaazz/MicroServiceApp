// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

const API = process.env.REACT_APP_API_URL;

export default function AdminDashboard() {
  const { token }               = useUser();
  const [users, setUsers]       = useState([]);
  const [cards, setCards]       = useState([]);
  const [filters, setFilters]   = useState({ city: '', province: '', card_status: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cities, setCities]     = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load users');
      setUsers(await res.json());
    } catch (e) {
      setError(e.message);
    }
  };

  // Fetch cards with current filters
  const fetchCards = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${API}/api/cards`);
      Object.entries(filters).forEach(([k, v]) => {
        if (v) url.searchParams.append(k, v);
      });
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load cards');
      const data = await res.json();
      setCards(data);

      // build filter dropdown options
      setCities([...new Set(data.map(c => c.city).filter(Boolean))]);
      setProvinces([...new Set(data.map(c => c.province).filter(Boolean))]);
      setStatuses([...new Set(data.map(c => c.card_status).filter(Boolean))]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const applyFilters = e => {
    e.preventDefault();
    fetchCards();
  };

  // Toggle block/unblock status
  const toggleStatus = async card => {
    const newStatus = card.card_status === 'Active' ? 'Blocked' : 'Active';
    try {
      const res = await fetch(
        `${API}/api/cards/${card.card_id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error('Failed to update status');
      fetchCards();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading admin…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <section className="admin-section">
        <h3>All Users</h3>
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
      </section>

      <section className="admin-section">
        <h3>All Cards</h3>

        <form className="filter-form" onSubmit={applyFilters}>
          <label>
            Status:
            <select name="card_status" value={filters.card_status} onChange={handleFilterChange}>
              <option value="">All</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            City:
            <select name="city" value={filters.city} onChange={handleFilterChange}>
              <option value="">All</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Province:
            <select name="province" value={filters.province} onChange={handleFilterChange}>
              <option value="">All</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <button type="submit" className="btn">Filter</button>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Card ID</th>
              <th>User</th>
              <th>Last 4</th>
              <th>Type</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.card_id}>
                <td>{c.card_id}</td>
                <td>{c.full_name} ({c.user_id})</td>
                <td>•••• {c.card_number.slice(-4)}</td>
                <td>{c.card_type}</td>
                <td>{c.expiry_date}</td>
                <td>{c.card_status}</td>
                <td>R{Number(c.current_balance).toFixed(2)}</td>
                <td>
                  <button
                    className={`action-btn ${c.card_status==='Active'?'block-btn':'unblock-btn'}`}
                    onClick={() => toggleStatus(c)}
                  >
                    {c.card_status==='Active' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
