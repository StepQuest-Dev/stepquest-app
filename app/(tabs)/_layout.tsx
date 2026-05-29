import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const segments = useSegments(); // Pozwala sprawdzić, na jakim ekranie obecnie jesteśmy
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // 1. Szukamy tokenu tak jak wcześniej (Web vs Mobile)
        let token = null;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }

        // 2. Sprawdzamy, czy nazwa obecnego pliku to 'login' lub 'register'
        // W Expo Router segments[0] zwraca nazwę bieżącego folderu/pliku
        const isAuthScreen = segments[0] === 'login' || segments[0] === 'register';

        // 3. Logika blokowania
        if (!token && !isAuthScreen) {
          // Ktoś nie ma tokenu i chce wejść w głąb apki -> Wyrzucamy na logowanie
          router.replace('/login');
        } else if (token && isAuthScreen) {
          // Ktoś JEST zalogowany, a wszedł na ekran logowania -> Wpuszczamy na dashboard
          router.replace('/dashboard'); // Zmień na '/(tabs)' lub '/(tabs)/dashboard' jeśli masz taką strukturę
        }
      } catch (error) {
        console.error('Błąd sprawdzania tokenu:', error);
      } finally {
        // Niezależnie od wyniku, wyłączamy ekran ładowania
        setIsChecking(false);
      }
    };

    // Uruchamiamy sprawdzanie za każdym razem, gdy użytkownik zmienia ekran
    verifyAuth();
  }, [segments]);

  // Ekran ładowania podczas sprawdzania tokenu (żeby nie mignął Dashboard niezalogowanym)
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  // Jeśli wszystko jest OK, ładujemy standardowy stos ekranów bez górnych nagłówków
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}