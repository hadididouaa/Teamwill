// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {
          withCredentials: true,
        });
        if (res.data && res.data.roleUtilisateur) {
  setAuthenticated(true);
}
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return authenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
