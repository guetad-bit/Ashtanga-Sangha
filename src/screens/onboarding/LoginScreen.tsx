// src/screens/onboarding/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/styles/tokens';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import AppLogo from '@/components/AppLogo';

// ── Stone & Moss palette ──────────────────
const moss = {
  bg: '#F6F2EC',
  ink: '#3B3228',
  inkMid: '#5E5245',
  muted: '#9B8E7E',
  accent: '#8A9E78',
  olive: '#6E8A5C',
  wood: '#D4C4AB',
  amber: '#C4956A',
  divider: '#E8E0D4',
  cardBg: '#FFFFFF',
};

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

export default function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded } = useAppStore();

  const handleLogin = async () => {
    if (!email.includes('@')) { Alert.alert('Please enter a valid email'); return; }
    if (password.length < 1) { Alert.alert('Please enter your password'); return; }

    setLoading(true);
    const { data, error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) { Alert.alert('Error', error.message); return; }

    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name ?? '',
        email: data.user.email ?? email,
        series: 'primary',
        level: 'regular',
      });
      setOnboarded(true);
      onLogin();
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/onboard-1.png')}
      style={s.bg}
      imageStyle={s.bgImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[
          'rgba(246,242,236,0.3)',
          'rgba(246,242,236,0.75)',
          'rgba(246,242,236,0.95)',
        ]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Logo — top */}
      <View style={[s.logoRow, { paddingTop: insets.top + spacing.lg }]}>
        <AppLogo size={30} />
        <Text style={s.appName}>Ashtanga Sangha</Text>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + spacing['2xl'] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Text style={s.kicker}>WELCOME BACK</Text>
          <Text style={s.title}>Sign in to Sangha</Text>
          <Text style={s.sub}>Continue your practice journey</Text>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={17} color={moss.muted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={moss.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={moss.muted} style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputPw]}
                placeholder="Your password"
                placeholderTextColor={moss.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="current-password"
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={moss.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={s.googleBtn} onPress={() => signInWithGoogle()} activeOpacity={0.85}>
            <Text style={s.googleBtnText}>
              Continue with{' '}
              <Text style={{ color: '#4285F4' }}>G</Text>
              <Text style={{ color: '#EA4335' }}>o</Text>
              <Text style={{ color: '#FBBC05' }}>o</Text>
              <Text style={{ color: '#4285F4' }}>g</Text>
              <Text style={{ color: '#34A853' }}>l</Text>
              <Text style={{ color: '#EA4335' }}>e</Text>
            </Text>
          </TouchableOpacity>

          {/* Register link */}
          <Text style={s.footer}>
            New to Sangha?{'  '}
            <Text style={s.footerLink} onPress={onGoToRegister}>Create Account</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#3B3228' },
  bgImage: { left: -80 },
  flex: { flex: 1 },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  appName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 17,
    color: moss.ink,
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
  },

  kicker: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 2,
    color: moss.accent,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 48,
    color: moss.ink,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: moss.inkMid,
    marginBottom: spacing['2xl'],
  },

  field: { marginBottom: spacing.lg },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: moss.ink,
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138,158,120,0.08)',
    borderWidth: 1,
    borderColor: moss.divider,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: moss.ink,
  },
  inputPw: { paddingRight: 36 },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: 4,
  },

  primaryBtn: {
    backgroundColor: moss.accent,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: '#fff',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: moss.divider },
  dividerText: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20, color: moss.muted },

  googleBtn: {
    borderWidth: 1.5,
    borderColor: moss.divider,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    backgroundColor: moss.cardBg,
  },
  googleBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: moss.ink,
  },

  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: moss.muted,
    textAlign: 'center',
  },
  footerLink: {
    color: moss.accent,
    fontFamily: 'DMSans_600SemiBold',
  },
});
