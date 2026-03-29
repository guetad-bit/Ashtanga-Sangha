// src/screens/onboarding/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/styles/tokens';
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import AppLogo from '@/components/AppLogo';

const warm = {
  bg: '#FAF6F0',
  ink: '#3D3229',
  orange: '#E8834A',
  muted: '#8B7D6E',
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
  const { t } = useTranslation();

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert(t('register.enterName')); return; }
    if (!email.includes('@')) { Alert.alert(t('register.email')); return; }
    if (password.length < 8) { Alert.alert(t('register.passwordLength')); return; }

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
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ââ Logo & branding ââââââââââââââââââââââââââââ */}
          <View style={st.brandRow}>
            <AppLogo size={44} />
            <Text style={st.brandName}>Ashtanga Sangha</Text>
          </View>

          {/* ââ Headline ââââââââââââââââââââââââââââââââââ */}
          <Text style={st.headline}>
            {t('register.createAccount')}
          </Text>
          <Text style={st.subtitle}>
            {t('register.joinPractitioners')}
          </Text>

          {/* ââ Name field âââââââââââââââââââââââââââââââââ */}
          <View style={st.field}>
            <Text style={st.label}>{t('register.fullName')}</Text>
            <View style={st.inputWrap}>
              <Ionicons name="person-outline" size={17} color="rgba(255,255,255,0.45)" style={st.inputIcon} />
              <TextInput
                style={st.input}
                placeholder={t('register.namePlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          {/* ââ Email field ââââââââââââââââââââââââââââââââ */}
          <View style={st.field}>
            <Text style={st.label}>{t('register.email')}</Text>
            <View style={st.inputWrap}>
              <Ionicons name="mail-outline" size={17} color="rgba(255,255,255,0.45)" style={st.inputIcon} />
              <TextInput
                style={st.input}
                placeholder={t('register.emailPlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* ââ Password field âââââââââââââââââââââââââââââ */}
          <View style={st.field}>
            <Text style={st.label}>{t('register.password')}</Text>
            <View style={st.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color="rgba(255,255,255,0.45)" style={st.inputIcon} />
              <TextInput
                style={[st.input, st.inputPw]}
                placeholder={t('register.passwordHint')}
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="new-password"
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

          {/* ââ Create Account button ââââââââââââââââââââââ */}
          <TouchableOpacity
            style={[st.primaryBtn, loading && st.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={st.primaryBtnText}>{t('register.createAccountBtn')}</Text>
            }
          </TouchableOpacity>

          {/* ââ Terms ââââââââââââââââââââââââââââââââââââââ */}
          <Text style={st.terms}>
            {t('register.agreeToTerms')}{' '}
            <Text style={st.termsLink}>{t('register.termsOfService')}</Text> {t('common.and')}{' '}
            <Text style={st.termsLink}>{t('register.privacyPolicy')}</Text>
          </Text>

          {/* ââ OR divider âââââââââââââââââââââââââââââââââ */}
          <View style={st.divider}>
            <View style={st.dividerLine} />
            <Text style={st.dividerText}>{t('register.orLabel')}</Text>
            <View style={st.dividerLine} />
          </View>

          {/* ââ Google sign-up ââââââââââââââââââââââââââââââ */}
          <TouchableOpacity
            style={st.googleBtn}
            onPress={() => signInWithGoogle()}
            activeOpacity={0.85}
          >
            <Text style={st.googleBtnText}>
              {t('register.signUpWithGoogle').split('Google')[0]}
              <Text style={{ color: '#4285F4' }}>G</Text>
              <Text style={{ color: '#EA4335' }}>o</Text>
              <Text style={{ color: '#FBBC05' }}>o</Text>
              <Text style={{ color: '#4285F4' }}>g</Text>
              <Text style={{ color: '#34A853' }}>l</Text>
              <Text style={{ color: '#EA4335' }}>e</Text>
            </Text>
          </TouchableOpacity>

          {/* ââ Sign in link âââââââââââââââââââââââââââââââ */}
          <Text style={st.footer}>
            {t('register.alreadyMember')}{'  '}
            <Text style={st.footerLink} onPress={onGoToLogin}>{t('register.signIn')}</Text>
          </Text>
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

  /* ââ Headline âââââââââââââââââââââââââ */
  headline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 34,
    lineHeight: 42,
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* ââ Form fields ââââââââââââââââââââââ */
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

  /* ââ Primary button âââââââââââââââââââ */
  primaryBtn: {
    backgroundColor: warm.orange,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
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

  /* ââ Terms ââââââââââââââââââââââââââââ */
  terms: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: 20,
  },
  termsLink: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'DMSans_500Medium',
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
    marginBottom: 20,
  },
  googleBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },

  /* ââ Footer âââââââââââââââââââââââââââ */
  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  footerLink: {
    color: warm.orange,
    fontFamily: 'DMSans_600SemiBold',
  },
});
