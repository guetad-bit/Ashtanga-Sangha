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
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(13,25,34,0.65)', 'rgba(13,25,34,0.98)']}
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
            <Text style={s.googleBtnText}>Continue with Google</Text>
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
  bg: { flex: 1, backgroundColor: '#0D1922' },
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
    color: 'rgba(255,255,255,0.9)',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
  },

  kicker: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 1.8,
    color: '#7EC8A4',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 36,
    lineHeight: 42,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: spacing['2xl'],
  },

  field: { marginBottom: spacing.lg },
  label: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    color: '#fff',
  },
  inputPw: { paddingRight: 36 },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: 4,
  },

  primaryBtn: {
    backgroundColor: '#7EC8A4',
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    ...typography.headingLg,
    color: '#fff',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { ...typography.bodySm, color: 'rgba(255,255,255,0.4)' },

  googleBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  googleBtnText: { ...typography.headingSm, color: 'rgba(255,255,255,0.85)' },

  footer: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  footerLink: {
    color: '#7EC8A4',
    fontFamily: 'DMSans_500Medium',
  },
});
