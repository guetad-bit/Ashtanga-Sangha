// src/screens/onboarding/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius } from '@/styles/tokens';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import AppLogo from '@/components/AppLogo';

const { height: SCREEN_H } = Dimensions.get('window');

const warm = {
  bg: '#FAF6F0',
  ink: '#3D3229',
  orange: '#E8834A',
  muted: '#8B7D6E',
};

// Fake avatar colors for social proof
const AVATAR_COLORS = ['#E8834A', '#7A8B5E', '#B8944A', '#A0704C', '#C47B3F'];

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

export default function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [mode, setMode] = useState<'landing' | 'login'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const switchToLogin = () => {
    setMode('login');
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const switchToLanding = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setMode('landing');
    });
  };

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
    <LinearGradient
      colors={['#F5DFC5', '#E8C4A0', '#D4A574', '#B87D4A', '#8B5E3C', '#5C3D28']}
      locations={[0, 0.15, 0.35, 0.55, 0.75, 1]}
      style={st.root}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={st.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            st.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ââ Logo & branding âââââââââââââââââââââââââââ */}
          <View style={st.brandRow}>
            <AppLogo size={52} />
            <Text style={st.brandName}>Ashtanga Sangha</Text>
          </View>

          {/* ââ Headline ââââââââââââââââââââââââââââââââââ */}
          <View style={st.heroBlock}>
            <Text style={st.headline}>
              Practice together.{'\n'}Anywhere.
            </Text>
            <Text style={st.subtitle}>
              Ashtanga is a daily rhythm.{'\n'}You're not alone.
            </Text>
          </View>

          {/* ââ Spacer to push buttons toward bottom âââââ */}
          <View style={st.spacer} />

          {mode === 'landing' ? (
            <>
              {/* ââ Continue button (â register) âââââââââââ */}
              <TouchableOpacity
                style={st.primaryBtn}
                onPress={onGoToRegister}
                activeOpacity={0.85}
              >
                <Text style={st.primaryBtnText}>Continue</Text>
              </TouchableOpacity>

              {/* ââ OR divider ââââââââââââââââââââââââââââââ */}
              <View style={st.divider}>
                <View style={st.dividerLine} />
                <Text style={st.dividerText}>OR</Text>
                <View style={st.dividerLine} />
              </View>

              {/* ââ Google sign-up ââââââââââââââââââââââââââ */}
              <TouchableOpacity
                style={st.googleBtn}
                onPress={() => signInWithGoogle()}
                activeOpacity={0.85}
              >
                <Text style={st.googleBtnText}>
                  Sign up with{' '}
                  <Text style={{ color: '#4285F4' }}>G</Text>
                  <Text style={{ color: '#EA4335' }}>o</Text>
                  <Text style={{ color: '#FBBC05' }}>o</Text>
                  <Text style={{ color: '#4285F4' }}>g</Text>
                  <Text style={{ color: '#34A853' }}>l</Text>
                  <Text style={{ color: '#EA4335' }}>e</Text>
                </Text>
              </TouchableOpacity>

              {/* ââ Log in link âââââââââââââââââââââââââââââ */}
              <TouchableOpacity onPress={switchToLogin} activeOpacity={0.7}>
                <Text style={st.loginLink}>Log in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ââ Back to landing âââââââââââââââââââââââââ */}
              <TouchableOpacity onPress={switchToLanding} style={st.backRow}>
                <Ionicons name="arrow-back" size={18} color="#fff" />
                <Text style={st.backText}>Back</Text>
              </TouchableOpacity>

              {/* ââ Email field âââââââââââââââââââââââââââââ */}
              <View style={st.field}>
                <Text style={st.label}>Email</Text>
                <View style={st.inputWrap}>
                  <Ionicons name="mail-outline" size={17} color="rgba(255,255,255,0.45)" style={st.inputIcon} />
                  <TextInput
                    style={st.input}
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

              {/* ââ Password field ââââââââââââââââââââââââââ */}
              <View style={st.field}>
                <Text style={st.label}>Password</Text>
                <View style={st.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={17} color="rgba(255,255,255,0.45)" style={st.inputIcon} />
                  <TextInput
                    style={[st.input, st.inputPw]}
                    placeholder="Your password"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    autoComplete="current-password"
                  />
                  <TouchableOpacity style={st.eyeBtn} onPress={() => setShowPw(v => !v)}>
                    <Ionicons
                      name={showPw ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="rgba(255,255,255,0.5)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ââ Sign in button ââââââââââââââââââââââââââ */}
              <TouchableOpacity
                style={[st.primaryBtn, loading && st.primaryBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={st.primaryBtnText}>Sign In</Text>
                }
              </TouchableOpacity>

              {/* ââ OR divider ââââââââââââââââââââââââââââââ */}
              <View style={st.divider}>
                <View style={st.dividerLine} />
                <Text style={st.dividerText}>OR</Text>
                <View style={st.dividerLine} />
              </View>

              {/* ââ Google ââââââââââââââââââââââââââââââââââ */}
              <TouchableOpacity
                style={st.googleBtn}
                onPress={() => signInWithGoogle()}
                activeOpacity={0.85}
              >
                <Text style={st.googleBtnText}>
                  Continue with{' '}
                  <Text style={{ color: '#4285F4' }}>G</Text>
                  <Text style={{ color: '#EA4335' }}>o</Text>
                  <Text style={{ color: '#FBBC05' }}>o</Text>
                  <Text style={{ color: '#4285F4' }}>g</Text>
                  <Text style={{ color: '#34A853' }}>l</Text>
                  <Text style={{ color: '#EA4335' }}>e</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ââ Social proof âââââââââââââââââââââââââââââââ */}
          <View style={st.proofRow}>
            <View style={st.avatarStack}>
              {AVATAR_COLORS.map((c, i) => (
                <View key={i} style={[st.avatar, { backgroundColor: c, marginLeft: i === 0 ? 0 : -8 }]}>
                  <Ionicons name="person" size={10} color="rgba(255,255,255,0.85)" />
                </View>
              ))}
            </View>
            <Text style={st.proofText}>3,842 yogis practiced this week</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },

  /* ââ Brand ââââââââââââââââââââââââââââ */
  brandRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: warm.ink,
    marginTop: 10,
    letterSpacing: 0.3,
  },

  /* ââ Hero âââââââââââââââââââââââââââââ */
  heroBlock: {
    alignItems: 'center',
    marginTop: 28,
  },
  headline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 38,
    lineHeight: 46,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  /* ââ Primary button âââââââââââââââââââ */
  primaryBtn: {
    backgroundColor: warm.orange,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: '#fff',
    letterSpacing: 0.3,
  },

  /* ââ Divider ââââââââââââââââââââââââââ */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  dividerText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },

  /* ââ Google button ââââââââââââââââââââ */
  googleBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 18,
  },
  googleBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },

  /* ââ Log in link ââââââââââââââââââââââ */
  loginLink: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
  },

  /* ââ Login form fields ââââââââââââââââ */
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#fff',
  },
  field: { marginBottom: 16 },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#fff',
  },
  inputPw: { paddingRight: 36 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },

  /* ââ Social proof âââââââââââââââââââââ */
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});
