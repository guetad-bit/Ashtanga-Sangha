// app/auth/callback.tsx
// Handles the OAuth redirect — PKCE flow returns ?code= in query params
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getProfile } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/styles/tokens';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const handled = useRef(false);
  const { setUser, setOnboarded } = useAppStore();

  useEffect(() => {
    const code = params.code;
    console.log('AuthCallback mounted, code:', code);

    if (!code || handled.current) return;
    handled.current = true;

    (async () => {
      try {
        // 1. Read the PKCE code verifier from AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        const verifierKey = allKeys.find((k) => k.includes('code-verifier'));

        let codeVerifier: string | null = null;
        if (verifierKey) {
          const raw = await AsyncStorage.getItem(verifierKey);
          try {
            codeVerifier = raw ? JSON.parse(raw) : null;
          } catch {
            codeVerifier = raw;
          }
        }

        if (!codeVerifier) {
          // Silently redirect — this can happen on app relaunch
          router.replace('/(tabs)');
          return;
        }

        // 2. Exchange code for tokens via direct REST call
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        console.log('Exchanging code...');
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': supabaseKey ?? '',
          },
          body: JSON.stringify({
            auth_code: code,
            code_verifier: codeVerifier,
          }),
        });

        const result = await response.json();
        console.log('Token exchange status:', response.status);

        if (!result.access_token || !result.refresh_token) {
          console.error('Token exchange failed:', JSON.stringify(result));
          router.replace('/(auth)/login');
          return;
        }

        // 3. Store the session directly in AsyncStorage (bypass setSession which hangs)
        const storageKey = 'sb-tcjqdwknbogtogujozxp-auth-token';
        const sessionData = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: result.expires_at,
          expires_in: result.expires_in,
          token_type: result.token_type,
          user: result.user,
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify(sessionData));
        console.log('Session stored in AsyncStorage');

        // 4. Clean up code verifier
        if (verifierKey) await AsyncStorage.removeItem(verifierKey);

        // 5. Load user profile and update Zustand store directly
        const userId = result.user?.id;
        const email = result.user?.email ?? '';

        if (userId) {
          const { data: profile } = await getProfile(userId);
          if (profile) {
            setUser({
              id: userId,
              name: profile.name ?? '',
              email,
              avatarUrl: profile.avatar_url ?? undefined,
              series: profile.series ?? 'primary',
              level: profile.level ?? 'regular',
              location: profile.location ?? undefined,
              bio: profile.bio ?? undefined,
              practicingSince: profile.practicing_since ?? undefined,
            });
            setOnboarded(true);
          } else {
            // New user — create minimal profile
            setUser({
              id: userId,
              name: result.user?.user_metadata?.full_name ?? email.split('@')[0],
              email,
              avatarUrl: result.user?.user_metadata?.avatar_url ?? undefined,
              series: 'primary',
              level: 'regular',
            });
          }
        }

        console.log('Google sign-in complete! Navigating home.');
        router.replace('/(tabs)');
      } catch (e: any) {
        console.error('OAuth callback error:', e?.message ?? e);
        router.replace('/(auth)/login');
      }
    })();
  }, [params.code]);

  // Timeout fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!handled.current) {
        console.log('OAuth callback timeout');
        router.replace('/(auth)/login');
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.blue} />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.page,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: colors.muted,
  },
});
