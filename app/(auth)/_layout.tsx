import { Redirect } from 'expo-router';
import { useProtectedRoute } from '../../lib/useProtectedRoute';

export default function AuthLayout() {
  useProtectedRoute();
  return <Redirect href="/login" />;
} 