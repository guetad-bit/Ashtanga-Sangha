// app/(tabs)/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/styles/tokens';
import LogPracticeModal from '@/components/LogPracticeModal';

// Reliable cross-platform way to hide a tab (works on both native and web)
const HiddenTab = () => null;

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.ink,
          tabBarInactiveTintColor: colors.mutedL,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shalas"
          options={{
            title: 'Shalas',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'map-marker-radius' : 'map-marker-radius-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gatherings"
          options={{
            href: null,
            tabBarButton: HiddenTab,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            tabBarButton: HiddenTab,
          }}
        />
      </Tabs>
      <LogPracticeModal />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.skyMid,
    borderTopWidth: 1,
    paddingTop: 6,
    height: Platform.OS === 'web' ? 65 : 85,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
