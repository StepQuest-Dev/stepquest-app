import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export default function TabsLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthAndCharacter = async () => {
      let token = null;
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
      } catch (e) {
        console.error('Auth check in layout error:', e);
      }

      const isAuthenticated = token && token !== 'null' && token !== 'undefined';

      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        await api.get('/character');
        setIsReady(true);
      } catch (error: unknown) {
        if (api.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.replace('/(auth)/login');
          } else if (error.response?.status === 404) {
            router.replace('/(tabs)/CreateCharacter');
          } else {
            // If it's a generic error, we might be offline, allow to proceed to dashboard
            setIsReady(true);
          }
        } else {
          setIsReady(true);
        }
      }
    };

    checkAuthAndCharacter();
  }, []);

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