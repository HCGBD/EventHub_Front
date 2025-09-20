import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-lg text-gray-700 dark:text-gray-300">Redirection vers la page d'accueil...</p>
    </div>
  );
};

export default LogoutRedirect;
