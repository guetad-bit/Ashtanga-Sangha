// app/(tabs)/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/styles/tokens';
import LogPracticeModal from '@/components/LogPracticeModal';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#A855F7',
          tabBarInactiveTintColor: '#6B5C82',
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
            title: 'My Log',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'journal' : 'journal-outline'} size={22} color={color} />
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
    backgroundColor: '#0F0B1E',
    borderTopColor: '#231A3D',
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
