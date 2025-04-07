import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './auth';

export function useProtectedRoute() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to the main page if authenticated
      router.replace('/');
    }
  }, [user, segments]);
} 