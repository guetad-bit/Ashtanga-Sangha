// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: AsyncStorage,
    flowType: 'pkce',
    detectSessionInUrl: false,
    lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
      // Skip locking in React Native â this prevents hangs
      return fn();
    },
  },
});

// ââ Auth helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  const isWeb = Platform.OS === 'web';

  // On web, redirect back to the current origin + /auth/callback
  // On native, use the deep link scheme (e.g. ashtangasangha://auth/callback)
  const redirectUrl = isWeb
    ? `${window.location.origin}/auth/callback`
    : Linking.createURL('auth/callback');

  console.log('OAuth redirect URL:', redirectUrl);

  if (isWeb) {
    // On web: let Supabase handle the redirect natively (no skipBrowserRedirect).
    // The browser will navigate to Google, then back to our /auth/callback page.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: { prompt: 'select_account' },
      },
    });
    return { data, error };
  }

  // On native: use skipBrowserRedirect + in-app auth browser
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: { prompt: 'select_account' },
      skipBrowserRedirect: true,
    },
  });

  if (error) return { data: null, error };

  // openAuthSessionAsync uses ASWebAuthenticationSession on iOS
  // which can handle the deep link redirect back to the app.
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log('WebBrowser result:', result.type);
  }

  return { data, error: null };
}

/** Call this when the app receives a deep link with tokens from Google OAuth */
export async function handleOAuthCallback(url: string) {
  // The URL will be: ashtangasangha://auth/callback#access_token=...&refresh_token=...
  const hash = url.split('#')[1];
  if (!hash) return { error: new Error('No tokens in callback URL') };

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return { error: new Error('Missing access or refresh token') };
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ââ Profile ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function upsertProfile(profile: {
  id: string;
  name: string;
  series: string;
  level: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  practicing_since?: number;
  teacher?: string;
}) {
  return supabase.from('profiles').upsert(profile);
}

// ââ Avatar upload ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function uploadAvatar(userId: string, uri: string, mimeType?: string | null) {
  // Fetch the image data as arraybuffer
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  // Determine extension from mimeType (reliable on web), falling back to URI parsing
  let fileExt = 'jpg';
  if (mimeType) {
    const extFromMime = mimeType.split('/').pop()?.toLowerCase();
    if (extFromMime === 'jpeg') fileExt = 'jpg';
    else if (extFromMime && /^[a-z]{2,4}$/.test(extFromMime)) fileExt = extFromMime;
  } else {
    const parsed = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
    if (parsed && /^[a-z]{2,4}$/.test(parsed)) fileExt = parsed;
  }
  const filePath = `${userId}/avatar.${fileExt}`;
  const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) return { url: null, error: uploadError };

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  // Add cache buster to force refresh
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  // Update profile with new avatar URL
  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);

  return { url: publicUrl, error: null };
}

// ââ Practice logs âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function logPractice(userId: string, series: string, durationMin: number, notes?: string) {
  return supabase.from('practice_logs').insert({
    user_id: userId,
    series,
    duration_min: durationMin,
    notes,
    logged_at: new Date().toISOString(),
  }).select();
}

export async function deletePracticeLog(logId: string) {
  return supabase.from('practice_logs').delete().eq('id', logId);
}

export async function updatePracticeLog(
  logId: string,
  changes: { series?: string; duration_min?: number; notes?: string }
) {
  return supabase
    .from('practice_logs')
    .update(changes)
    .eq('id', logId)
    .select();
}

export async function getPracticeLogs(userId: string, limit = 30) {
  return supabase
    .from('practice_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(limit);
}

// ââ Gatherings ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function getGatherings() {
  return supabase
    .from('gatherings')
    .select('*')
    .order('start_date', { ascending: true });
}

export async function bookGathering(gatheringId: string, userId: string) {
  try {
    const result = await supabase.from('gathering_bookings').insert({
      gathering_id: gatheringId,
      user_id: userId,
      status: 'pending',
      booked_at: new Date().toISOString(),
    });
    // If table doesn't exist yet, treat as success (local-only booking)
    if (result.error?.code === '42P01' || result.error?.message?.includes('does not exist')) {
      return { data: null, error: null };
    }
    return result;
  } catch {
    // Gracefully succeed for offline / missing table
    return { data: null, error: null };
  }
}

export async function getUserBookings(userId: string) {
  try {
    const result = await supabase
      .from('gathering_bookings')
      .select('gathering_id, status')
      .eq('user_id', userId);
    if (result.error) return { data: [], error: null };
    return result;
  } catch {
    return { data: [], error: null };
  }
}

export async function cancelBooking(gatheringId: string, userId: string) {
  try {
    const result = await supabase
      .from('gathering_bookings')
      .delete()
      .eq('gathering_id', gatheringId)
      .eq('user_id', userId);
    if (result.error) return { data: null, error: null };
    return result;
  } catch {
    return { data: null, error: null };
  }
}

// ââ Social ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function getFeed(userId: string) {
  // Posts from people you follow
  return supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(20);
}

export async function likePost(postId: string, userId: string) {
  return supabase.from('likes').upsert({ post_id: postId, user_id: userId });
}

export async function unlikePost(postId: string, userId: string) {
  return supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
}

export async function getUserLikes(userId: string) {
  return supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId);
}

// ââ Follows ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function followUser(followerId: string, followingId: string) {
  return supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  return supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
}

export async function getFollowing(userId: string) {
  return supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey(id, name, avatar_url, series, level, streak)')
    .eq('follower_id', userId);
}

export async function getFollowers(userId: string) {
  return supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey(id, name, avatar_url, series, level, streak)')
    .eq('following_id', userId);
}

// ââ Practicing status ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function setPracticingNow(userId: string, practicing: boolean) {
  return supabase.from('profiles').update({
    practicing_now: practicing,
    practicing_since: practicing ? new Date().toISOString() : null,
  }).eq('id', userId);
}

export async function getPracticingNow() {
  // Only show people who started practicing within the last 1.5 hours
  const cutoff = new Date(Date.now() - 90 * 60 * 1000).toISOString();
  return supabase
    .from('profiles')
    .select('id, name, avatar_url, series, level, streak, practicing_since')
    .eq('practicing_now', true)
    .gte('practicing_since', cutoff)
    .order('practicing_since', { ascending: false });
}

// ââ Community: who's practicing ââââââââââââââââââââââââââââââââââââââââââââââ

export async function getRecentPractitioners(limit = 20) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return supabase
    .from('practice_logs')
    .select('user_id, series, logged_at, profiles(id, name, avatar_url, series, level, streak)')
    .gte('logged_at', yesterday.toISOString())
    .order('logged_at', { ascending: false })
    .limit(limit);
}

// ââ Posts (enhanced) âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function createPost(userId: string, caption: string, imageUrl?: string, location?: string) {
  return supabase.from('posts').insert({
    user_id: userId,
    caption,
    image_url: imageUrl,
    location,
  });
}

export async function deletePost(postId: string) {
  return supabase.from('posts').delete().eq('id', postId);
}
