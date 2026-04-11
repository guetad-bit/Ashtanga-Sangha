// app/(tabs)/_layout.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LogPracticeModal from '@/components/LogPracticeModal';
import { useAppStore } from '@/store/useAppStore';
import { setPracticingNow } from '@/lib/supabase';

const clay = {
  bg: '#FFFFFF',
  border: '#E8DFD0',
  muted: '#8A7A68',
  mutedLight: '#B5A793',
  clay: '#C26B4D',
  clayDark: '#A5502F',
};

const HIDDEN_TABS = ['gatherings', 'profile'];

/**
 * Clay/sand tab bar — Home / Explore / [Practice FAB] / Progress / You
 */
function ClayTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();
  const { isPracticing, setIsPracticing, user, setLogModalOpen } = useAppStore();

  const handlePracticeFAB = () => {
    if (!isPracticing) {
      // Begin practice
      setIsPracticing(true);
      if (user) setPracticingNow(user.id, true).catch(console.error);
    } else {
      // Already practicing — open the log modal to finish
      setLogModalOpen(true);
    }
  };

  const visibleRoutes = state.routes.filter((route: any) => !HIDDEN_TABS.includes(route.name));

  const tabMeta: Record<string, { label: string; icon: any; iconFocused: any }> = {
    index:     { label: 'Home',     icon: 'home-outline',        iconFocused: 'home' },
    community: { label: 'Community', icon: 'people-outline',      iconFocused: 'people' },
    shalas:    { label: 'Gatherings', icon: 'calendar-outline', iconFocused: 'calendar' },
    library:   { label: 'You',      icon: 'person-outline',      iconFocused: 'person' },
  };

  const left = visibleRoutes.slice(0, 2);
  const right = visibleRoutes.slice(2);

  const renderTab = (route: any) => {
    const meta = tabMeta[route.name];
    if (!meta) return null;
    const isFocused = state.index === state.routes.indexOf(route);
    const color = isFocused ? clay.clay : clay.mutedLight;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
        <Ionicons name={isFocused ? meta.iconFocused : meta.icon} size={22} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{meta.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBar}>
      {left.map(renderTab)}

      {/* Center FAB — Begin / Finish Practice */}
      <TouchableOpacity
        style={styles.fabWrap}
        activeOpacity={0.85}
        onPress={handlePracticeFAB}
      >
        <LinearGradient
          colors={isPracticing ? ['#A8B59B', '#7D9A6E'] : [clay.clay, clay.clayDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name={isPracticing ? 'stop-circle-outline' : 'play'} size={isPracticing ? 28 : 26} color="#fff" />
        </LinearGradient>
        <Text style={[styles.fabLabel, isPracticing && { color: '#7D9A6E' }]}>
          {isPracticing ? 'Finish' : 'Practice'}
        </Text>
      </TouchableOpacity>

      {right.map(renderTab)}
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <ClayTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="community" options={{ title: 'Explore' }} />
        <Tabs.Screen name="shalas" options={{ title: 'Progress' }} />
        <Tabs.Screen name="library" options={{ title: 'You' }} />
        <Tabs.Screen name="gatherings" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>

      <LogPracticeModal />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: clay.bg,
    borderTopColor: clay.border,
    borderTopWidth: 1,
    paddingTop: 10,
    height: Platform.OS === 'web' ? 72 : 90,
    paddingBottom: Platform.OS === 'web' ? 0 : 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: clay.clay,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: clay.clay,
    marginTop: 4,
  },
});
