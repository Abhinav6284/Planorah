import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * Checks for a valid access token in localStorage or sessionStorage.
 * Redirects to /login if no token is found, preserving the intended destination.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  if (!token) {
    // Redirect to login, saving the attempted path for post-login redirect
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
