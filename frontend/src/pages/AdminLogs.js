// src/pages/AdminLogs.js
import React, { useEffect, useState, useMemo } from 'react';
import { useUser }                          from '../context/UserContext';
import '../styles/Admin.css';

const API = process.env.REACT_APP_API_URL;

const EVENT_TYPES = [
  { label: 'All',                       value: '' },
  { label: 'Login Success',             value: 'Login success' },
  { label: 'Unauthorized Card Access',  value: 'Unauthorized card access' },
  { label: 'JWT Validation Failed',     value: 'JWT validation failed' },
  { label: 'Profile Updated',           value: 'updated their profile' },
  { label: 'Incorrect Password',        value: 'Incorrect password' },
  { label: 'Unregistered Email',        value: 'unregistered email' },
  { label: 'Rate Limit Reached',        value: 'Rate limit exceeded' },
  { label: 'Brute Force Attempt',        value: 'Brute' },
];

export default function AdminLogs() {
  const { token }             = useUser();
  const [logs, setLogs]       = useState([]);
  const [filter, setFilter]   = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  // fetch logs once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not load logs');
        setLogs(await res.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // derive unique user_ids from the logs
  const uniqueUsers = useMemo(() => {
    const ids = logs
      .map(e => e.user_id)
      .filter(id => id !== undefined && id !== null);
    return [...new Set(ids)];
  }, [logs]);

  if (loading) return <p>Loading logs…</p>;
  if (err)     return <p className="error">Error: {err}</p>;

  // apply both filters
  const filteredLogs = logs.filter(e => {
    const matchesEvent =
      !filter || e.message.toLowerCase().includes(filter.toLowerCase());
    const matchesUser =
      !userFilter || String(e.user_id) === userFilter;
    return matchesEvent && matchesUser;
  });

  return (
    <div className="admin-page">
      <h2>Activity Logs</h2>

      <div className="filter-row">
        <label>
          Event:
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {EVENT_TYPES.map(evt => (
              <option key={evt.value} value={evt.value}>
                {evt.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          User:
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
          >
            <option value="">All</option>
            {uniqueUsers.map(id => (
              <option key={id} value={String(id)}>
                User {id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Message</th>
            <th>Additional</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((e, i) => (
            <tr key={i}>
              <td>{new Date(e.time).toLocaleString()}</td>
              <td>{e.level}</td>
              <td>{e.message}</td>
              <td>
                {Object.entries(e)
                  .filter(
                    ([k]) =>
                      !['time', 'level', 'message'].includes(k)
                  )
                  .map(([k, v]) => (
                    <div key={k}>
                      <strong>{k}:</strong> {String(v)}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
