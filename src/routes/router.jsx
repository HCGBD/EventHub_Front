import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/adminLayout';
import OrganizerLayout from '@/layouts/OrganizerLayout';
import ParticipantLayout from '@/layouts/ParticipantLayout';

// Pages
import HomePage from '@/pages/HomePage';
import HomeRedirect from '@/components/HomeRedirect';
import Dashboard from '@/pages/Dashboard';
import Event from '@/pages/Event';
import Category from '@/pages/Category';
import Location from '@/pages/Location';
import UserManagementPage from '@/pages/UserManagementPage';
import UserProfilePage from '@/pages/UserProfilePage';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import EventFormPage from '@/pages/EventFormPage';
import LocationFormPage from '@/pages/LocationFormPage';
import UnauthorizedPage from '@/pages/Unauthorized';
import OrganizerDashboard from '@/pages/OrganizerDashboard';
import LogoutRedirect from '@/pages/LogoutRedirect';
import EventDetailPage from '@/pages/EventDetailPage';
import LocationDetailPage from '@/pages/LocationDetailPage';
import PublicEventsPage from '@/pages/PublicEventsPage';
import PublicLocationsPage from '@/pages/PublicLocationsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import MyParticipatedEventsPage from '@/pages/MyParticipatedEventsPage'; // New Import
import MyTicketsPage from '@/pages/MyTicketsPage';

import SettingsPage from '@/pages/SettingsPage';
import PaymentSimulationPage from '@/pages/PaymentSimulationPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentFailedPage from '@/pages/PaymentFailedPage';



// Auth & Routing
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '@/stores/authStore';

const router = createBrowserRouter([
  // Route d'accueil publique
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      // Vous pouvez ajouter ici d'autres pages publiques comme /events, /about, etc.
      { path: '/events', element: <PublicEventsPage /> }, 
      { path: '/events/:eventId', element: <EventDetailPage /> },
      { path: '/locations/:locationId', element: <LocationDetailPage /> },
      { path: '/locations', element: <PublicLocationsPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> }, 
    ]
  },

  // Route de redirection après déconnexion (non protégée)
  {
    path: '/logout-redirect',
    element: <LogoutRedirect />
  },

  // Routes publiques pour l'authentification
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />
  },

  // Routes pour les administrateurs
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'events', element: <Event /> },
      { path: 'events/new', element: <EventFormPage /> },
      { path: 'events/:id/edit', element: <EventFormPage /> },
      { path: 'categories', element: <Category /> },
      { path: 'locations', element: <Location /> },
      { path: 'locations/new', element: <LocationFormPage /> },
      { path: 'locations/:id/edit', element: <LocationFormPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'profile', element: <UserProfilePage /> }
    ]
  },

  // Routes pour les organisateurs
  {
    path: '/organizer',
    element: (
      <ProtectedRoute allowedRoles={['organizer']}>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <OrganizerDashboard /> },
      { path: 'dashboard', element: <OrganizerDashboard /> },
      { path: 'events', element: <Event /> },
      { path: 'events/new', element: <EventFormPage /> },
      { path: 'events/:id/edit', element: <EventFormPage /> },
      { path: 'locations', element: <Location /> },
      { path: 'locations/new', element: <LocationFormPage /> },
      { path: 'locations/:id/edit', element: <LocationFormPage /> },
      { path: 'categories', element: <Category /> },
      { path: 'profile', element: <UserProfilePage /> }
    ]
  },

  // Routes pour les participants
  {
    path: '/participant',
    element: (
      <ProtectedRoute allowedRoles={['participant']}>
        <ParticipantLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element:<HomePage /> },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'my-participated-events', element: <MyParticipatedEventsPage /> }, // New Route
      { path: 'my-tickets', element: <MyTicketsPage /> },
    ]
  },

  // Routes pour les Paramètres (accessible à tous les utilisateurs connectés)
  {
    path: '/settings',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SettingsPage /> }
    ]
  },

  // Routes pour le flux de paiement (protégées)
  {
    path: '/payment',
    element: <ProtectedRoute allowedRoles={['admin', 'organizer', 'participant']}><ParticipantLayout /></ProtectedRoute>,
    children: [
      { path: 'success', element: <PaymentSuccessPage /> },
      { path: 'failed', element: <PaymentFailedPage /> },
    ]
  },
  {
    path: '/events/:eventId/simulate-payment',
    element: <ProtectedRoute allowedRoles={['admin', 'organizer', 'participant']}><ParticipantLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PaymentSimulationPage /> }
    ]
  },

  // Route pour les pages non trouvées
  {
    path: '*',
    element: <NotFound />
  }
]);

// Cette fonction n'est plus utilisée par la route '/', mais peut rester pour référence
function RoleBasedRedirect () {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (user.role === 'admin') {
    return <Navigate to='/admin/dashboard' replace />
  } else if (user.role === 'organizer') {
    return <Navigate to='/organizer/dashboard' replace />
  } else if (user.role === 'participant') {
    return <Navigate to='/participant/dashboard' replace />
  } else {
    return <Navigate to='/unauthorized' replace />
  }
}

export default router;