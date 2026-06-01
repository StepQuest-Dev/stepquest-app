import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Lista obrazów do preloada
const imagesToPreload = [
  require('../assets/images/logo.png'),
  require('../assets/images/osada_bg.gif'),
  require('../assets/images/dungeon-background.png'),
  require('../assets/images/coins.png'),
  require('../assets/images/serce.png'),
  require('../assets/images/barracks.png'),
  require('../assets/images/guild.png'),
  require('../assets/images/workshop.png'),
  require('../assets/images/zwoj.png'),
  require('../assets/images/user-icon.png'),
  require('../assets/images/warrior-icon.png'),
  require('../assets/images/mnich-icon.png'),
  require('../assets/images/mag-icon.png'),
  require('../assets/images/loczek-icon.png'),
  require('../assets/images/framed-icons/warrior-icon-ramka.png'),
  require('../assets/images/framed-icons/monk-icon-ramka.png'),
  require('../assets/images/framed-icons/mag-icon-ramka.png'),
  require('../assets/images/framed-icons/loczek-icon-ramka.png'),
  require('../assets/images/framed-icons/goblin-icon-ramka.png'),
];

export default function RootLayout() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Minecraftia': require('../assets/fonts/Minecraftia-Regular.ttf'),
    'determination': require('../assets/fonts/determination.ttf'),
    'loveyalikeasister': require('../assets/fonts/LoveYaLikeASister-Regular.ttf'),
  });

  useEffect(() => {
    async function preloadAssets() {
      try {
        const cacheImages = imagesToPreload.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });
        await Promise.all(cacheImages);
      } catch (e) {
        console.warn('Błąd podczas preloada obrazów:', e);
      } finally {
        setAssetsLoaded(true);
      }
    }

    preloadAssets();
  }, []);

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
    if ((fontsLoaded || fontError) && assetsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, assetsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!assetsLoaded) {
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
