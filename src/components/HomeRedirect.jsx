import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import HomePage from '@/pages/HomePage'; // Assuming HomePage is the default for non-participants

const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'participant') {
      navigate('/participant', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // If not authenticated or not a participant, render the HomePage
  return <HomePage />;
};

export default HomeRedirect;