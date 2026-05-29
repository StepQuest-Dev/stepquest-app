import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
 useEffect(() => {
  if (Platform.OS === 'android') {
    // Definiujemy wewnętrzną funkcję asynchroniczną
    const configureAndroidBar = async () => {
      try {
        // Dodajemy "Async" na końcu obu metod
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (error) {
        console.warn('Nie udało się skonfigurować paska nawigacji:', error);
      }
    };

    configureAndroidBar();
  }
}, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" /> 
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}