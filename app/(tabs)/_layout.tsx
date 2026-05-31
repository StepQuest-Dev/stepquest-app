import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ukrywa domyślny biały pasek Expo na zawsze
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="dungeon" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="developerPanel" options={{ href: null }} />
    </Tabs>
  );
}