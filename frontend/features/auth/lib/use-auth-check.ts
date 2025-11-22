import { useAuth } from './auth-context';

/**
 * Hook to check if user is authenticated
 * Useful for conditional rendering based on auth state
 */
export function useAuthCheck() {
  const { user, loading, initialized } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isGuest: !user && initialized && !loading,
    isLoading: loading || !initialized,
  };
}

