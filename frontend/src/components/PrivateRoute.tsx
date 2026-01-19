import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '@/app/store';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token, user } = useStore();

  // Check if user is authenticated and is an admin
  const isAuthenticated = token && user && user.role === 'admin';

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
