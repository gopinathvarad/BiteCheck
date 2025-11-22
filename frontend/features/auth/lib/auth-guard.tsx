import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './auth-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Protected tab routes that require authentication
const PROTECTED_TABS = ['history', 'favorites', 'profile'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const currentTab = segments[1]; // e.g., 'index', 'history', 'favorites', 'profile'

    if (user && inAuthGroup) {
      // User is authenticated but in auth group, redirect to tabs
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup && currentTab && PROTECTED_TABS.includes(currentTab)) {
      // User is not authenticated and trying to access protected tab
      // Redirect to login, but allow them to continue as guest if they want
      router.replace('/(auth)/login');
    }
    // Allow guest access to:
    // - Auth screens (login/signup)
    // - Scan screen (index tab)
    // - Product detail pages
    // - Any other non-protected routes
  }, [user, initialized, loading, segments, router]);

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

