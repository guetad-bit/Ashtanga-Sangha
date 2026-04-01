// src/components/AppHeader.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, Modal,
  Pressable, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import AppLogo from '@/components/AppLogo';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

export default function AppHeader() {
  const router = useRouter();
  const { user, clearUser } = useAppStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    clearUser();
  };

  return (
    <>
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <AppLogo size={36} />
          <Text style={s.appTitle}>{t('header.brand')}</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.75}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <Text style={s.avatarLetter}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Dropdown menu modal ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={s.menuContainer}>
            {/* User info */}
            <View style={[s.menuHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.menuAvatar} />
              ) : (
                <View style={[s.menuAvatar, s.avatarPlaceholder]}>
                  <Text style={s.avatarLetter}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[s.menuName, isRTL && { textAlign: 'right' }]}>{user?.name ?? 'Yogi'}</Text>
              </View>
            </View>

            <View style={s.menuDivider} />

            {/* My Profile */}
            <TouchableOpacity
              style={[s.menuItem, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => { setMenuOpen(false); router.push('/(tabs)/profile'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color="#5E5245" />
              <Text style={s.menuItemText}>{t('header.myProfile')}</Text>
            </TouchableOpacity>

            <View style={s.menuDivider} />

            {/* Sign Out */}
            <TouchableOpacity style={[s.menuItem, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color="#C0392B" />
              <Text style={[s.menuItemText, { color: '#C0392B' }]}>{t('header.signOut')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: colors.ink,
    lineHeight: 22,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#8A9E78' },
  avatarPlaceholder: {
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, color: '#fff', fontWeight: '600' },

  // ── Dropdown menu ──
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 95,
    paddingRight: spacing.lg,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    width: 240,
    ...shadows.lg,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  menuAvatar: { width: 46, height: 46, borderRadius: 23 },
  menuName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
  },
  menuDivider: { height: 1, backgroundColor: '#F0EDE8' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuItemText: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 22, color: colors.ink },
});
