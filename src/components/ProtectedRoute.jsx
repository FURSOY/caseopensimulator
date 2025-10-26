import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { userData } = useAuth();

  // Yüklenirken veya kullanıcı admin değilse ana sayfaya yönlendir
  if (!userData || userData.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
