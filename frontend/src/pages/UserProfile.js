// src/pages/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Profile.css';

const API = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const { token, user, login } = useUser();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    city: '',
    province: '',
    zip_code: '',
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    const res = await fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfile({
      full_name:    data.full_name    || '',
      email:        data.email        || '',
      phone_number: data.phone_number || '',
      city:         data.city         || '',
      province:     data.province     || '',
      zip_code:     data.zip_code     || '',
    });
    setLoading(false);
  };

  useEffect(() => {
    loadProfile().catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();

      // refresh context so header name updates
      login(token, updated);

      // reload the full profile from server
      await loadProfile();
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setMessage('Update failed.');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setMessage('');
    loadProfile().catch(console.error);
  };

  if (loading) return <p>Loading profile…</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      {message && <div className="message">{message}</div>}

      {!editMode ? (
        <div className="profile-view">
          {[
            ['Name',     'full_name'],
            ['Email',    'email'],
            ['Phone',    'phone_number'],
            ['City',     'city'],
            ['Province', 'province'],
            ['ZIP Code', 'zip_code'],
          ].map(([label, key]) => (
            <div className="profile-field" key={key}>
              <span className="field-label">{label}:</span>
              <span className="field-value">{profile[key]}</span>
            </div>
          ))}
          <button
            className="btn edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSave}>
          {[
            ['Name',     'full_name'],
            ['Email',    'email'],
            ['Phone',    'phone_number'],
            ['City',     'city'],
            ['Province', 'province'],
            ['ZIP Code', 'zip_code'],
          ].map(([label, key]) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                name={key}
                value={profile[key]}
                onChange={handleChange}
                required={['full_name','email','phone_number'].includes(key)}
              />
            </div>
          ))}
          <div className="profile-buttons">
            <button type="submit" className="btn save-btn">
              Save
            </button>
            <button
              type="button"
              className="btn cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
