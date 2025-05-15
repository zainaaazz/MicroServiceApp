// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';

import Header       from './components/common/Header';
import Sidebar      from './components/common/Sidebar';
import PrivateRoute from './components/common/PrivateRoute';

import OAuthRedirect    from './pages/OAuthRedirect';
import Login            from './pages/Login';
import UserDashboard    from './pages/UserDashboard';
import UserCards        from './pages/UserCards';
import UserProfile      from './pages/UserProfile';
import AdminDashboard   from './pages/AdminDashboard';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>

              {/* OAuth redirect handler (no sidebar) */}
              <Route path="/oauth2/redirect" element={<OAuthRedirect />} />

              {/* Login page */}
              <Route path="/login" element={<Login />} />

              {/* Protected user routes */}
              <Route
                path="/user/dashboard"
                element={<PrivateRoute><UserDashboard/></PrivateRoute>}
              />
              <Route
                path="/user/cards"
                element={<PrivateRoute><UserCards/></PrivateRoute>}
              />
              <Route
                path="/user/profile"
                element={<PrivateRoute><UserProfile/></PrivateRoute>}
              />

              {/* Protected admin */}
              <Route
                path="/admin"
                element={<PrivateRoute><AdminDashboard/></PrivateRoute>}
              />

            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
