import { Tabs } from 'expo-router';
import React from 'react';
import { useNavigationStore } from '@/store/navigationStore';

export default function TabLayout() {
  const setMode = useNavigationStore((state) => state.setMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
        listeners={{ focus: () => setMode('default') }}
      />
      <Tabs.Screen
        name="readings"
        options={{ title: 'Bible' }}
        listeners={{ focus: () => setMode('bible') }}
      />
      <Tabs.Screen
        name="mass-responses"
        options={{ title: 'Mass' }}
        listeners={{ focus: () => setMode('mass') }}
      />
      <Tabs.Screen
        name="prayers"
        options={{ title: 'Prayers' }}
        listeners={{ focus: () => setMode('prayer') }}
      />
      <Tabs.Screen
        name="songs"
        options={{ title: 'Songs' }}
        listeners={{ focus: () => setMode('music') }}
      />
      <Tabs.Screen
        name="groups"
        options={{ title: 'Groups' }}
        listeners={{ focus: () => setMode('groups') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
        listeners={{ focus: () => setMode('default') }}
      />
    </Tabs>
  );
}
