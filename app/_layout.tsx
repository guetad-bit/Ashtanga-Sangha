// app/_layout.tsx
import { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthListener } from '@/lib/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/styles/tokens';
import '@/i18n'; // Initialize i18n

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  // Start listening for auth changes
  useAuthListener();

  // Check if there's an existing session on app start
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // DEMO MODE: auto-login with a guest profile if no session
      if (!session) {
        useAppStore.getState().setUser({
          id: 'demo-user',
          name: 'Guest Yogi',
          email: 'guest@sangha.app',
          series: 'primary' as any,
          level: 'beginner' as any,
        });
      }
      setTimeout(() => setIsReady(true), 500);
    });
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOAuthCallback = segments[0] === 'auth'; // /auth/callback route

    // Skip redirects while processing OAuth callback
    if (inOAuthCallback) return;

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in — redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Signed in — redirect to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isReady]);

  // Show loading while checking session
  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.page,
  },
});
