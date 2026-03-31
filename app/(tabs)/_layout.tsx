// app/(tabs)/_layout.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/tokens';
import LogPracticeModal from '@/components/LogPracticeModal';
import { useTranslation } from 'react-i18next';

const HIDDEN_TABS = ['gatherings', 'profile'];

function RTLTabBar({ state, descriptors, navigation }: any) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  // Filter out hidden tabs by route name
  const visibleRoutes = state.routes.filter((route: any) => !HIDDEN_TABS.includes(route.name));

  const orderedRoutes = isRTL ? [...visibleRoutes].reverse() : visibleRoutes;

  return (
    <View style={styles.tabBar}>
      {orderedRoutes.map((route: any) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.indexOf(route);
        const color = isFocused ? '#8A9E78' : '#C4B8A8';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {options.tabBarIcon?.({ color, focused: isFocused, size: 22 })}
            <Text style={[styles.tabLabel, { color }]}>{options.title ?? route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <>
      <Tabs
        tabBar={(props) => <RTLTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('nav.home'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: t('nav.community'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shalas"
          options={{
            title: t('nav.myLog'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'journal' : 'journal-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: t('nav.library'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gatherings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <LogPracticeModal />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8E0D4',
    borderTopWidth: 1,
    paddingTop: 6,
    height: Platform.OS === 'web' ? 65 : 85,
    paddingBottom: Platform.OS === 'web' ? 0 : 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
