// src/pages/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import CardBalancePieChart from '../components/common/CardBalancePieChart';
import '../styles/Dashboard.css';

const API = process.env.REACT_APP_API_URL;

const UserDashboard = () => {
  const { token, user } = useUser();
  const [balance, setBalance] = useState(0);
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    if (!token) {
      setErr('Not logged in');
      setLoading(false);
      return;
    }

    const fetchCards = async () => {
      try {
        const res = await fetch(`${API}/api/cards/my-cards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load cards');
        const cards = await res.json();

        // Sum up the DB's current_balance field
        const total = cards.reduce((sum, c) => {
          const num = Number(c.current_balance);
          return sum + (isNaN(num) ? 0 : num);
        }, 0);

        setBalance(total);
        setCards(cards);  // <-- use the fetched cards array here
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [token]);

  if (loading) return <p>Loading…</p>;
  if (err)     return <p>Error: {err}</p>;

  return (
    <div className="dashboard">
      <h2>Welcome back, {user.name}!</h2>
      <p>Your total balance is <strong>R{balance.toFixed(2)}</strong></p>

      <h3>Breakdown by Card</h3>
      <CardBalancePieChart cards={cards} />
    </div>
  );
};

export default UserDashboard;
