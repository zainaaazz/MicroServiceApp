// src/pages/UserCards.js
import React, { useEffect, useState } from 'react';
import { useUser }               from '../context/UserContext';
import Modal                     from '../components/common/Modal';
import '../styles/Cards.css';

export default function UserCards() {
  const { token } = useUser();
  const [cards, setCards]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [err, setErr]                   = useState('');

  // OTP / Details modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [otp, setOtp]                   = useState('');
  const [otpError, setOtpError]         = useState('');
  const [details, setDetails]           = useState(null);

  // NEW: track which card ID is currently sending an OTP
  const [requestingCardId, setRequestingCardId] = useState(null);

  // fetch your cards on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/cards/my-cards`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Could not load cards');
        setCards(await res.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // 1) ask backend to send OTP
  const openDetails = async card => {
    setErr('');
    setRequestingCardId(card.card_id);          // 🚩 start loading for this card
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cards/${card.card_id}/details/request`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error('Could not send code');
      setSelectedCard(card);
      setOtp('');
      setOtpError('');
      setDetails(null);
      setModalOpen(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setRequestingCardId(null);                // 🚩 stop loading
    }
  };

  // 2) verify code & fetch real details
  const verifyOtp = async e => {
    e.preventDefault();
    setOtpError('');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cards/${selectedCard.card_id}/details/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: otp })
        }
      );
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Invalid code');
      }
      setDetails(await res.json());
    } catch (e) {
      setOtpError(e.message);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
    setDetails(null);
  };

  if (loading) return <p>Loading cards…</p>;
  if (err)     return <p className="error">Error: {err}</p>;

  return (
    <div className="cards-page">
      <h2>My Cards</h2>
      <div className="cards-container">
        {cards.map(card => {
          const isRequesting = requestingCardId === card.card_id;
          return (
            <div key={card.card_id} className="card">
              <h3>
                {card.card_type} •••• {card.card_number.slice(-4)}
              </h3>
              <p>Balance: R{Number(card.current_balance).toFixed(2)}</p>
              <p>Status: {card.card_status}</p>

              {/* ← REPLACE your old <button> here with the snippet below: */}
              <button
                onClick={() => openDetails(card)}
                disabled={isRequesting}
              >
                {isRequesting
                  ? (
                    <>
                      <span className="button-spinner" />
                      <span>Sending code…</span>
                    </>
                  )
                  : 'View Details'
                }
              </button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <h3>Enter your one-time code</h3>
        <p>We have emailed you a 6-digit code (expires in 5 minutes).</p>

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="123456"
          />
          {otpError && <p className="error">{otpError}</p>}
          <button type="submit">Verify &amp; Show</button>
        </form>

        {details && (
          <div className="card-details">
            <p>
              <strong>Card Number:</strong> {details.card_number}
            </p>
            <p>
              <strong>Expiry Date:</strong> {details.expiry_date}
            </p>
            <p>
              <strong>CVV:</strong> {details.cvv}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
