import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const user = useAuthStore(state => state.user)
  const justLoggedOut = useAuthStore(state => state.justLoggedOut)
  const resetJustLoggedOut = useAuthStore(state => state.resetJustLoggedOut)
  const location = useLocation()

  useEffect(() => {
    // Reset justLoggedOut flag only if the user has successfully landed on '/' after logout
    if (justLoggedOut && location.pathname === '/') {
      resetJustLoggedOut()
    }
  }, [location.pathname, justLoggedOut, resetJustLoggedOut])

  // 1. Pas authentifié
  if (!isAuthenticated) {
    // Si l'utilisateur vient de se déconnecter et tente d'accéder à une route protégée,
    // on le redirige vers la page d'accueil publique.
    if (justLoggedOut) {
      return <Navigate to='/' replace />
    }
    // Sinon, si l'utilisateur n'est pas authentifié et n'est pas en cours de déconnexion,
    // on le redirige vers la page de connexion.
    return <Navigate to='/login' replace />
  }

  // 2. Authentifié mais `user` pas encore chargé → affiche un loader
  if (isAuthenticated && !user) {
    return <div>Chargement...</div>
  }

  // 3. Authentifié mais rôle non autorisé → redirection vers unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />
  }

  // 4. Authentifié + user chargé + rôle autorisé → affiche les enfants
  return children
}

export default ProtectedRoute
