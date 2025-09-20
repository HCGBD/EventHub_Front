import axios from 'axios'
import useAuthStore from '@/stores/authStore'
import { refreshToken as refreshAuthToken } from '@/lib/api' // Renommer pour éviter la confusion

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/'
  withCredentials: true // Autoriser l'envoi des cookies
})

// Intercepteur de requête pour ajouter le token
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass browser cache for GET requests
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Variable pour éviter les boucles de rafraîchissement
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Intercepteur de réponse pour gérer l'expiration du token
apiClient.interceptors.response.use(
  response => response, // Si la réponse est bonne, on ne fait rien
  async error => {
    const originalRequest = error.config

    // Si l'erreur est 401 et que ce n'est pas une tentative de rafraîchissement
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return apiClient(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { accessToken } = await refreshAuthToken()
        useAuthStore
          .getState()
          .setToken(accessToken, useAuthStore.getState().user)

        apiClient.defaults.headers.common['Authorization'] =
          'Bearer ' + accessToken
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken

        processQueue(null, accessToken)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        window.location = '/login' // Redirection forcée
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
