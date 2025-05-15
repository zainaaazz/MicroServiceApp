// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Admin.css';

const API = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const { token } = useUser();
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          fetch(`${API}/api/users`,   { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/cards`,   { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!uRes.ok || !cRes.ok) throw new Error('Could not load admin data');
        setUsers(await uRes.json());
        setCards(await cRes.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [token]);

  if (loading) return <p>Loading admin…</p>;
  if (err)     return <p>Error: {err}</p>;

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <section>
        <h3>All Users</h3>
        <ul>
          {users.map(u => (
            <li key={u.id}>
              {u.name} ({u.email}) – role {u.role_id}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>All Cards</h3>
        <ul>
          {cards.map(c => (
            <li key={c.id}>
              {c.cardType} •••• {c.last4} – {c.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
