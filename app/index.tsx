import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function IndexScreen() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = null;
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
      } catch (error) {
        console.error('Błąd tokenu:', error);
      }

      // Jeśli jest token -> rzucamy do (tabs)/dashboard, jeśli nie -> login
      if (token) {
        setTargetRoute('/(tabs)/dashboard');
      } else {
        setTargetRoute('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  if (!targetRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return <Redirect href={targetRoute as any} />;
}