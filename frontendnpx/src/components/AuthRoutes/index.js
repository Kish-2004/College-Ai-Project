// src/components/AuthRoutes/index.js
import React from "react";
// This path goes up two levels (out of AuthRoutes, out of components)
// and into the context folder.
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const UserRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated && !isAdmin) {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated && isAdmin) {
    return <Outlet />;
  }
  return <Navigate to="/new-claim" replace />;
};

export const PublicRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return isAdmin ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/new-claim" replace />
    );
  }
  return <Outlet />;
};

export const AuthenticatedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Outlet />; // Show the child route
  }

  // If not logged in at all, send to login
  return <Navigate to="/login" replace />;
};
