import { Tabs } from 'expo-router';
import React from 'react';

// The (tabs) group is kept only to satisfy the Expo Router anchor.
// All navigation is handled by the employee/manager route groups.
// The Explore tab from the Expo starter is hidden.
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home', href: null }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', href: null }} />
    </Tabs>
  );
}
