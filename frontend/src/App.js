// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';

import Header       from './components/common/Header';
import Sidebar      from './components/common/Sidebar';
import PrivateRoute from './components/common/PrivateRoute';

import Login        from './pages/Login';
import OAuthRedirect from './pages/OAuthRedirect';

import UserDashboard  from './pages/UserDashboard';
import UserCards      from './pages/UserCards';
import UserProfile    from './pages/UserProfile';

import AdminUsers     from './pages/AdminUsers';
import AdminCards     from './pages/AdminCards';
import AdminLogs     from './pages/AdminLogs';
import AdminProfile  from './pages/AdminProfile';


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>

              {/* OAuth & login */}
              <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
              <Route path="/login" element={<Login />} />

              {/* User routes */}
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

             
             {/* Admin profile */}
              <Route
                path="/admin/profile"
                element={<PrivateRoute><AdminProfile/></PrivateRoute>}
              />
               
              {/* Admin logs */}
              <Route
                path="/admin/logs"
                element={<PrivateRoute><AdminLogs/></PrivateRoute>}
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/users" replace />}
              />
              <Route
                path="/admin/users"
                element={<PrivateRoute><AdminUsers/></PrivateRoute>}
              />
              <Route
                path="/admin/cards"
                element={<PrivateRoute><AdminCards/></PrivateRoute>}
              />

            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
