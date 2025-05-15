// src/pages/AdminCards.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

export default function AdminCards() {
  const { token } = useUser();
  const [filters, setFilters] = useState({ card_status:'', city:'', province:'' });
  const [cards,   setCards]   = useState([]);
  const [opts,    setOpts]    = useState({ statuses:[], cities:[], provinces:[] });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${process.env.REACT_APP_API_URL}/api/cards`);
      Object.keys(filters).forEach(k => {
        if (filters[k]) url.searchParams.append(k, filters[k]);
      });
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load cards');
      const data = await res.json();
      setCards(data);

      // build filter dropdowns
      setOpts({
        statuses:   [...new Set(data.map(c=>c.card_status))],
        cities:     [...new Set(data.map(c=>c.city))],
        provinces: [...new Set(data.map(c=>c.province))]
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const apply = e => {
    e.preventDefault();
    fetchCards();
  };

  const toggle = async card => {
    const next = card.card_status === 'Active' ? 'Blocked' : 'Active';
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cards/${card.card_id}/status`,
        {
          method:'PUT',
          headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${token}`
          },
          body: JSON.stringify({ status: next })
        }
      );
      if (!res.ok) throw new Error('Could not update');
      fetchCards();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-page">
      <h2>All Cards</h2>

      <form className="filter-form" onSubmit={apply}>
        {[
          ['card_status','Status',opts.statuses],
          ['city','City',opts.cities],
          ['province','Province',opts.provinces]
        ].map(([name,label,list]) => (
          <label key={name}>
            {label}:
            <select name={name} value={filters[name]} onChange={handleChange}>
              <option value="">All</option>
              {list.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        ))}
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
                  className={c.card_status==='Active' ? 'block-btn' : 'unblock-btn'}
                  onClick={() => toggle(c)}
                >
                  {c.card_status==='Active' ? 'Block' : 'Unblock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
