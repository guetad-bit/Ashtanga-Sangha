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

// ── Insta Ocean palette ──────────────────
const ocean = {
  bg: '#F0F4FF',
  ink: '#1A2744',
  inkMid: '#3D5070',
  muted: '#7B8FAD',
  accent: '#405DE6',
  sky: '#5B8DEF',
  lavender: '#8B5CF6',
  coral: '#FF6B6B',
  divider: '#DDE4F0',
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
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          'rgba(64,93,230,0.08)',
          'rgba(91,141,239,0.55)',
          'rgba(64,93,230,0.95)',
        ]}
        locations={[0, 0.4, 1]}
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
          <Text style={s.title}>Sign in to{'\n'}your sangha</Text>
          <Text style={s.sub}>Continue your practice journey</Text>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={17} color="rgba(255,255,255,0.45)" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
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
              <Ionicons name="lock-closed-outline" size={17} color="rgba(255,255,255,0.45)" style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputPw]}
                placeholder="Your password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="current-password"
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="rgba(255,255,255,0.5)"
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
            New to the sangha?{'  '}
            <Text style={s.footerLink} onPress={onGoToRegister}>Create account</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#1A2744' },
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
    color: 'rgba(255,255,255,0.85)',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
  },

  kicker: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 2,
    color: '#5B8DEF',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 48,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing['2xl'],
  },

  field: { marginBottom: spacing.lg },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64,93,230,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(91,141,239,0.25)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#fff',
  },
  inputPw: { paddingRight: 36 },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: 4,
  },

  primaryBtn: {
    backgroundColor: ocean.accent,
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
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.55)' },

  googleBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(91,141,239,0.35)',
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    backgroundColor: 'rgba(64,93,230,0.1)',
  },
  googleBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },

  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  footerLink: {
    color: '#5B8DEF',
    fontFamily: 'DMSans_600SemiBold',
  },
});
