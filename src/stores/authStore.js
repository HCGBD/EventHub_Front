import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QueryClient } from '@tanstack/react-query';
import { logout as logoutApi } from '@/lib/api'; // Import the logout API function

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      justLoggedOut: false,
      setToken: (token, user) => {
        set({ token, user, isAuthenticated: true, justLoggedOut: false });
      },
      updateUserProfile: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      logout: async () => {
        try {
          await logoutApi(); // Call the backend logout API
        } catch (error) {
          console.error('Failed to logout from backend:', error);
        } finally {
          set({ token: null, user: null, isAuthenticated: false, justLoggedOut: true });
          // Clear React Query cache on logout
          const queryClient = new QueryClient(); // Create a new instance to clear
          queryClient.clear();
        }
      },
      resetJustLoggedOut: () => {
        set({ justLoggedOut: false });
      },
    }),
    {
      name: 'auth-storage', // Nom de l'item dans le localStorage
      storage: createJSONStorage(() => localStorage), // Utiliser localStorage
    }
  )
);

export default useAuthStore;
