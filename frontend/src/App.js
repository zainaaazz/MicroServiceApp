import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserCards from './pages/UserCards';
import UserProfile from './pages/UserProfile';
import { UserProvider } from './context/UserContext'; // <-- Import your context

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Redirect route example (optional):
          <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
          */}

          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/cards" element={<UserCards />} />
          <Route path="/user/profile" element={<UserProfile />} />

          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
