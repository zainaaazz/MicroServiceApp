// src/pages/UserCards.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Cards.css';

const API = process.env.REACT_APP_API_URL;

const UserCards = () => {
  const { token } = useUser();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API}/api/cards/my-cards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load cards');
        setCards(await res.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [token]);

  if (loading) return <p>Loading cards…</p>;
  if (err)     return <p>Error: {err}</p>;

  return (
    <div className="cards-page">
      <h2>My Cards</h2>
      <div className="cards-grid">
        {cards.map(c => (
          <div key={c.card_id} className="card">
            <h3>
              {c.card_type} &bull;&bull;&bull;&bull;{' '}
              {c.card_number.slice(-4)}
            </h3>
            <p>Balance: R{Number(c.current_balance).toFixed(2)}</p>
            <p>Status: {c.card_status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCards;
