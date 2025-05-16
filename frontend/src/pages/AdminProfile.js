// src/pages/AdminProfile.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Profile.css';

const API = process.env.REACT_APP_API_URL;

export default function AdminProfile() {
  const { token } = useUser();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    city: '',
    province: '',
    zip_code: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1) Fetch current admin data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not load profile');
        const data = await res.json();
        setProfile(data);
        setFormData({
          full_name:    data.full_name    || '',
          email:        data.email        || '',
          phone_number: data.phone_number || '',
          city:         data.city         || '',
          province:     data.province     || '',
          zip_code:     data.zip_code     || ''
        });
      } catch (e) {
        setError(e.message);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // 2) Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  // 3) Save updates
  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Could not update profile');
      const updated = await res.json();
      setProfile(updated);
      setMessage('Profile updated successfully');
      setEditing(false);
    } catch (e) {
      setError(e.message);
    }
  };

  // 4) Cancel edits
  const onCancel = () => {
    setError('');
    setEditing(false);
    if (profile) {
      setFormData({
        full_name:    profile.full_name,
        email:        profile.email,
        phone_number: profile.phone_number,
        city:         profile.city,
        province:     profile.province,
        zip_code:     profile.zip_code
      });
    }
  };

  if (!profile && !error) return <p>Loading...</p>;
  if (error && !profile)    return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="profile-page">
      <h2>Admin Profile</h2>
      {message && <div className="message">{message}</div>}
      {error   && <div className="error"  style={{ color: 'red' }}>{error}</div>}

      {!editing ? (
        <div className="profile-view">
          <div className="profile-field">
            <div className="field-label">Name:</div>
            <div className="field-value">{profile.full_name}</div>
          </div>
          <div className="profile-field">
            <div className="field-label">Email:</div>
            <div className="field-value">{profile.email}</div>
          </div>
          <div className="profile-field">
            <div className="field-label">Phone:</div>
            <div className="field-value">{profile.phone_number}</div>
          </div>
          <div className="profile-field">
            <div className="field-label">City:</div>
            <div className="field-value">{profile.city}</div>
          </div>
          <div className="profile-field">
            <div className="field-label">Province:</div>
            <div className="field-value">{profile.province}</div>
          </div>
          <div className="profile-field">
            <div className="field-label">ZIP Code:</div>
            <div className="field-value">{profile.zip_code}</div>
          </div>

          <button
            className="edit-btn"
            onClick={() => { setEditing(true); setMessage(''); }}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <>
          <form className="profile-form" onSubmit={onSave}>
            {[
              { name: 'full_name',    label: 'Name'     },
              { name: 'email',        label: 'Email'    },
              { name: 'phone_number', label: 'Phone'    },
              { name: 'city',         label: 'City'     },
              { name: 'province',     label: 'Province' },
              { name: 'zip_code',     label: 'ZIP Code' }
            ].map(({ name, label }) => (
              <div className="form-group" key={name}>
                <label>{label}:</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </form>

          <div className="profile-buttons">
            <button className="btn save-btn"   onClick={onSave}>   Save   </button>
            <button className="btn cancel-btn" onClick={onCancel}> Cancel </button>
          </div>
        </>
      )}
    </div>
  );
}
