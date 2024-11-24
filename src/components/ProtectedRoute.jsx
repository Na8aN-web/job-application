import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useSelector((state) => state.user);

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
