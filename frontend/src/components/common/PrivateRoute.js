// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const PrivateRoute = ({ children }) => {
  const { token } = useUser();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
