import React, { useEffect, useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, ActivityIndicator } from 'react-native';
import api, { logoutUser } from '../../services/api';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthAndCharacter = async () => {
      console.log(`[LAYOUT] Checking auth for path: ${pathname}`);
      let token = null;
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
      } catch (e) {
        console.error('[LAYOUT] Auth storage check error:', e);
      }

      const isAuthenticated = token && token !== 'null' && token !== 'undefined';

      if (!isAuthenticated) {
        console.log('[LAYOUT] Not authenticated, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      try {
        // 1. Verify user profile exists (Handles phantom accounts)
        await api.get('/auth/me');

        // 2. Skip character check if we are ALREADY on the creation screen
        if (pathname === '/CreateCharacter' || pathname.includes('CreateCharacter')) {
          console.log('[LAYOUT] Already on CreateCharacter, skipping character check');
          setIsReady(true);
          return;
        }

        // 3. Check for character
        try {
          await api.get('/character');
          console.log('[LAYOUT] Character found, ready');
          setIsReady(true);
        } catch (charError: any) {
          if (charError.response?.status === 404) {
            console.log('[LAYOUT] No character (404), redirecting to creation');
            router.replace('/(tabs)/CreateCharacter');
          } else {
            console.log('[LAYOUT] Character API error, allowing dashboard fallback');
            setIsReady(true);
          }
        }
      } catch (authError: any) {
        if (authError.response?.status === 401 || authError.response?.status === 404) {
          console.log('[LAYOUT] Session invalid or phantom account (404), logging out');
          await logoutUser();
          router.replace('/(auth)/login');
        } else {
          console.log('[LAYOUT] Network error, assuming ready for local mode');
          setIsReady(true);
        }
      }
    };

    checkAuthAndCharacter();
  }, [pathname]); // Re-run check on pathname change to ensure deep links are protected

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12181f' }}>
        <ActivityIndicator size="large" color="#ebd59b" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ukrywa domyślny biały pasek Expo na zawsze
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="dungeon" />
      <Tabs.Screen name="osada" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="developerPanel" options={{ href: null }} />
      <Tabs.Screen name="CharacterScreen" options={{ href: null }} />
      <Tabs.Screen name="CreateCharacter" options={{ href: null }} />
    </Tabs>
  );
}