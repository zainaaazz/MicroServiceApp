// src/pages/AdminCards.js
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

export default function AdminCards() {
  const { token } = useUser();

  // full dataset + visible (filtered) subset
  const [allCards, setAllCards]     = useState([]);
  const [visible, setVisible]       = useState([]);

  // filter + search state
  const [filters, setFilters] = useState({
    search: '',
    card_status: '',
    city: '',
    province: ''
  });

  // dropdown options
  const [opts, setOpts] = useState({
    statuses: [],
    cities: [],
    provinces: []
  });

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // 1) fetchCards is now reusable
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cards`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Could not load cards');
      const data = await res.json();

      // rebuild dropdown options
      setOpts({
        statuses:   [...new Set(data.map(c => c.card_status))],
        cities:     [...new Set(data.map(c => c.city))],
        provinces: [...new Set(data.map(c => c.province))]
      });

      setAllCards(data);
      // apply whatever filters are currently set
      applyFilters(data, filters);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // run on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // applyFilters now takes an explicit list
  function applyFilters(list, { search, card_status, city, province }) {
    let filtered = list;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(term) ||
        c.user_id.toString() === term
      );
    }
    if (card_status) {
      filtered = filtered.filter(c => c.card_status === card_status);
    }
    if (city) {
      filtered = filtered.filter(c => c.city === city);
    }
    if (province) {
      filtered = filtered.filter(c => c.province === province);
    }

    setVisible(filtered);
  }

  // form changes only update state
  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  // on “Filter” click, reapply to the existing allCards
  const onFilter = e => {
    e.preventDefault();
    applyFilters(allCards, filters);
  };

  // 2) toggle and then re-fetch
  const toggleStatus = async card => {
    const next = card.card_status === 'Active' ? 'Blocked' : 'Active';
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cards/${card.card_id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: next })
        }
      );
      if (!res.ok) throw new Error('Could not update status');

      // now re-fetch (which will reapply filters)
      await fetchCards();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-page">
      <h2>All Cards</h2>

      <form className="filter-form" onSubmit={onFilter}>
        <label>
          Search (Name or ID):
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="e.g. Zain or 1001"
          />
        </label>

        <label>
          Status:
          <select
            name="card_status"
            value={filters.card_status}
            onChange={handleChange}
          >
            <option value="">All</option>
            {opts.statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>
          City:
          <select
            name="city"
            value={filters.city}
            onChange={handleChange}
          >
            <option value="">All</option>
            {opts.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>
          Province:
          <select
            name="province"
            value={filters.province}
            onChange={handleChange}
          >
            <option value="">All</option>
            {opts.provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <button type="submit" className="btn">Filter</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>Last 4</th>
            <th>Type</th><th>Expiry</th><th>Status</th>
            <th>Balance</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(c => (
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
                  className={c.card_status === 'Active' ? 'block-btn' : 'unblock-btn'}
                  onClick={() => toggleStatus(c)}
                >
                  {c.card_status === 'Active' ? 'Block' : 'Unblock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
