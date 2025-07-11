// HOC or higher order component AKA wrapper component
// the purpose of these is to take in other components as a child or sometimes a prop
// then add behavior, logic, or styling(ie themeprovider as u may know)
// then renders the child component conditionally or with effects or enhancements from its logic

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import Unauthorized from '../Unauthorized.jsx';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUserRole(data.user.role);

          if (allowedRoles.includes(data.user.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        setIsAuthorized(false);
      }
    };

    fetchUser();
  }, [allowedRoles]);

  if (isAuthorized === null) return <div>Loading...</div>;
  if (!isAuthorized) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
