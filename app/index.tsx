import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndCharacter = async () => {
      let token = null;
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            token = localStorage.getItem('userToken');
          }
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
      } catch (error: unknown) {
        console.error('Auth check error:', error);
      }

      const isAuthenticated = token && token !== 'null' && token !== 'undefined';

      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }

      // If we have a token, check if the user actually exists and has a character
      try {
        await api.get('/character');
        // If character exists, go to dashboard
        router.replace('/(tabs)/dashboard');
      } catch (error: unknown) {
        if (api.isAxiosError(error)) {
          if (error.response?.status === 401) {
            // Token is invalid/expired
            router.replace('/(auth)/login');
          } else if (error.response?.status === 404) {
            // User exists but has no character
            router.replace('/(tabs)/CreateCharacter');
          } else {
            // Other network error, maybe try dashboard anyway and let it handle errors
            router.replace('/(tabs)/dashboard');
          }
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }
    };

    const timeout = setTimeout(checkAuthAndCharacter, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12181f' }}>
      <ActivityIndicator size="large" color="#ebd59b" />
    </View>
  );
}