import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectRoute({ children }) {
  const token = window.localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectRoute;
