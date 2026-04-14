// src/screens/onboarding/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

// ── Clay / terracotta palette (same as LoginScreen) ─────────────────────
const clay = {
  bg:        '#F5EFE6',
  ink:       '#2A2420',
  sub:       '#6B5E52',
  muted:     '#8A7A68',
  mutedLight:'#B5A793',
  clay:      '#C26B4D',
  clayDark:  '#A5502F',
  sage:      '#A8B59B',
  sand:      '#D4C5A9',
  warm:      '#F9F4ED',
  border:    '#E8DFD0',
};

interface RegisterScreenProps {
  onComplete: () => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onComplete, onGoToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded } = useAppStore();

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Please enter your name'); return; }
    if (!email.includes('@')) { Alert.alert('Please enter a valid email'); return; }
    if (password.length < 8) { Alert.alert('Password must be at least 8 characters'); return; }

    setLoading(true);
    const { data, error } = await signUpWithEmail(email, password, name);
    setLoading(false);

    if (error) { Alert.alert('Error', error.message); return; }

    if (data.user) {
      setUser({ id: data.user.id, name, email, series: 'primary', level: 'regular' });
      setOnboarded(true);
      onComplete();
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/onboard-4.png')}
      style={s.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[
          'rgba(245,239,230,0.45)',
          'rgba(245,239,230,0.85)',
          'rgba(245,239,230,0.98)',
        ]}
        locations={[0, 0.35, 0.75]}
        style={StyleSheet.absoluteFill}
      />

      {/* Brand — top */}
      <View style={[s.brandRow, { paddingTop: insets.top + 16 }]}>
        <Text style={s.brand}>sangha</Text>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Text style={s.kicker}>JOIN THE SANGHA</Text>
          <Text style={s.title}>Step onto{'\n'}the mat</Text>
          <Text style={s.sub}>Create your account to begin</Text>

          {/* Full Name */}
          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={17} color={clay.muted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={clay.mutedLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={17} color={clay.muted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={clay.mutedLight}
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
              <Ionicons name="lock-closed-outline" size={17} color={clay.muted} style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputPw]}
                placeholder="At least 8 characters"
                placeholderTextColor={clay.mutedLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="new-password"
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={clay.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Account */}
          <TouchableOpacity
            style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[clay.clay, clay.clayDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.primaryBtnGradient}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.primaryBtnText}>Create Account</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={s.terms}>
            By creating an account, you agree to our{' '}
            <Text style={s.termsLink}>Terms</Text> and{' '}
            <Text style={s.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={s.googleBtn} onPress={() => signInWithGoogle()} activeOpacity={0.85}>
            <Text style={s.googleBtnText}>
              Sign up with{' '}
              <Text style={{ color: '#4285F4' }}>G</Text>
              <Text style={{ color: '#EA4335' }}>o</Text>
              <Text style={{ color: '#FBBC05' }}>o</Text>
              <Text style={{ color: '#4285F4' }}>g</Text>
              <Text style={{ color: '#34A853' }}>l</Text>
              <Text style={{ color: '#EA4335' }}>e</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign in link */}
          <Text style={s.footer}>
            Already a member?{'  '}
            <Text style={s.footerLink} onPress={onGoToLogin}>Sign In</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: clay.bg },
  flex: { flex: 1 },

  brandRow: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  brand: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 7,
    color: clay.clay,
    paddingLeft: 7,
  },

  scroll: {
    paddingHorizontal: 28,
    paddingTop: 24,
  },

  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: clay.clay,
    marginBottom: 10,
  },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '300',
    color: clay.ink,
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: clay.sub,
    marginBottom: 24,
  },

  field: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: clay.ink,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: clay.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: clay.ink,
  },
  inputPw: { paddingRight: 36 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },

  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: clay.clayDark,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },

  terms: {
    fontSize: 12,
    lineHeight: 18,
    color: clay.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  termsLink: {
    color: clay.clay,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: clay.border },
  dividerText: { fontSize: 13, color: clay.muted },

  googleBtn: {
    borderWidth: 1,
    borderColor: clay.border,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: clay.ink,
  },

  footer: {
    fontSize: 14,
    color: clay.sub,
    textAlign: 'center',
  },
  footerLink: {
    color: clay.clay,
    fontWeight: '700',
  },
});
