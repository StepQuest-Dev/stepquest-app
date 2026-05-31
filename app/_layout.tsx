import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Minecraftia': require('../assets/fonts/Minecraftia-Regular.ttf'),
    'determination': require('../assets/fonts/determination.ttf'),
    'loveyalikeasister': require('../assets/fonts/LoveYaLikeASister-Regular.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      const configureAndroidBar = async () => {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } catch (error) {
          console.warn('Nie udało się skonfigurować paska nawigacji:', error);
        }
      };
      configureAndroidBar();
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}