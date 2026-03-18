// src/lib/useAuth.ts
import { useEffect } from 'react';
import { supabase, getProfile } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

/**
 * Listens for Supabase auth state changes and syncs with Zustand store.
 * Call this once in the root layout.
 */
export function useAuthListener() {
  const { setUser, clearUser, setOnboarded } = useAppStore();

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(
          session.user.id,
          session.user.email ?? '',
          session.user.user_metadata,
        );
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(
            session.user.id,
            session.user.email ?? '',
            session.user.user_metadata,
          );
        } else if (event === 'SIGNED_OUT') {
          clearUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(
    userId: string,
    email: string,
    userMetadata?: Record<string, any>,
  ) {
    const { data: profile } = await getProfile(userId);

    // Derive the best available name: profiles table → OAuth metadata → email prefix
    const name =
      profile?.name ||
      userMetadata?.full_name ||
      userMetadata?.name ||
      email.split('@')[0] ||
      'Yogi';

    // Always set the user as long as we have a valid auth session,
    // even if the profiles row hasn't been created yet.
    setUser({
      id: userId,
      name,
      email,
      avatarUrl: profile?.avatar_url ?? userMetadata?.avatar_url ?? undefined,
      series: (profile?.series as any) ?? 'primary',
      level: (profile?.level as any) ?? 'regular',
      location: profile?.location ?? undefined,
      bio: profile?.bio ?? undefined,
      practicingSince: profile?.practicing_since ?? undefined,
    });
    setOnboarded(true);
  }
}
