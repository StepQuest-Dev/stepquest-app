import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api, { logoutUser } from '../services/api';

export default function IndexScreen() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndCharacter = async () => {
      console.log('[INDEX] Starting initial auth check');
      let token = null;
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
      } catch (error: any) {
        console.error('[INDEX] Auth storage error:', error);
      }

      const isAuthenticated = token && token !== 'null' && token !== 'undefined';

      if (!isAuthenticated) {
        console.log('[INDEX] No token found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      // If we have a token, check if the account actually exists first (Double Check)
      try {
        console.log('[INDEX] Token found, verifying user account...');
        const userRes = await api.get('/auth/me');
        console.log('[INDEX] Account confirmed for:', userRes.data.username);

        // Account exists, now check for character
        try {
          console.log('[INDEX] Checking character status...');
          await api.get('/character');
          console.log('[INDEX] Character confirmed, going to dashboard');
          router.replace('/(tabs)/dashboard');
        } catch (charError: any) {
          if (charError.response?.status === 404) {
            console.log('[INDEX] No character found, going to creation');
            router.replace('/(tabs)/CreateCharacter');
          } else {
            console.log('[INDEX] Character API error, falling back to dashboard');
            router.replace('/(tabs)/dashboard');
          }
        }
      } catch (authError: any) {
        if (authError.response?.status === 401 || authError.response?.status === 404) {
          console.log('[INDEX] Account invalid or missing (Phantom), clearing token');
          await logoutUser(); // Clean up stale token
          router.replace('/(auth)/login');
        } else {
          console.log('[INDEX] Connection error, staying at index or trying login');
          router.replace('/(auth)/login');
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12181f' }}>
      <ActivityIndicator size="large" color="#ebd59b" />
    </View>
  );
}
