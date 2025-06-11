import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ requiredRole, children }) => {
  const { token, hasRole } = useAuth();
  
  if (!token) {
    return <Navigate to="/auth" />;
  }
  
  if (!hasRole(requiredRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default RoleProtectedRoute;