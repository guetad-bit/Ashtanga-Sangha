// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthListener } from '@/lib/useAuth';
import { useAppStore } from '@/store/useAppStore';
import '@/i18n'; // Initialize i18n

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  // Still listen for auth changes — if someone signs in later, we pick it up
  useAuthListener();

  // Auto-set a guest user so screens that reference user data don't crash
  useEffect(() => {
    const { user, setUser, setOnboarded } = useAppStore.getState();
    if (!user) {
      setUser({
        id: 'guest',
        name: 'אורח',          // "Guest" in Hebrew
        email: '',
        series: 'primary',
        level: 'regular',
      });
      setOnboarded(true);
    }
  }, []);

  // If user somehow lands on the auth screens, redirect to main app
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="new-post" options={{ presentation: 'modal' }} />
      <Stack.Screen name="log-practice" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
