import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors'; // 1. Importujemy krokomierz
import api from '../../services/api';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
      headerShown: false,
    });
  }, [navigation]);

  // FUNKCJA SYNCHRONIZACJI KROKÓW Z SERWEREM NestJS
  const syncStepsWithServer = async (currentSteps: number) => {
    try {
      // Wysyłamy aktualną liczbę kroków do bazy
      await api.post('/steps', { count: currentSteps }); // Dopasuj nazwę pola (steps lub count) pod NestJS
    } catch (err) {
      console.error('Błąd synchronizacji kroków z serwerem:', err);
    }
  };

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let isMounted = true;

    const fetchDashboardAndStartPedometer = async () => {
      try {
        // 1. Pobieranie danych profilu
        const userResponse = await api.get('/auth/me');
        if (isMounted) setUsername(userResponse.data.username || userResponse.data.email);

        // 2. Pobieranie GPS
        let { status: gpsStatus } = await Location.requestForegroundPermissionsAsync();
        if (gpsStatus === 'granted') {
          let currentByGps = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(currentByGps);
        } else {
          setErrorMsg('Brak uprawnień do GPS.');
        }

        // 3. OBSŁUGA KROKOMIERZA (PEDOMETER)
        if (Platform.OS !== 'web') {
          const isPedometerAvailable = await Pedometer.isAvailableAsync();
          
          if (isPedometerAvailable) {
            const now = new Date();
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);

            // Pobieramy kroki z telefonu od początku dzisiejszego dnia
            const stepCountResult = await Pedometer.getStepCountAsync(startOfDay, now);
            if (isMounted) {
              setSteps(stepCountResult.steps);
              // Od razu wysyłamy zapisany stan do bazy po wejściu na dashboard
              syncStepsWithServer(stepCountResult.steps); 
            }

            // Słuchamy zmian czujnika na żywo (gdy użytkownik idzie z włączoną aplikacją)
            subscription = Pedometer.watchStepCount((result) => {
              if (isMounted) {
                // Jeśli urządzenie zwróci nowe kroki, aktualizujemy stan na ekranie
                const newSteps = result.steps ?? stepCountResult.steps;
                setSteps(newSteps);
                // Synchronizujemy zmianę z NestJS w tle
                syncStepsWithServer(newSteps);
              }
            });
          }
        } else {
          // Jeśli to przeglądarka Web - pobieramy po prostu ostatni wynik z bazy danych
          const stepsResponse = await api.get('/steps/latest');
          if (isMounted) setSteps(stepsResponse.data.steps || stepsResponse.data.count || 0);
        }

      } catch (error: any) {
        console.error('❌ Błąd aplikacji:', error);
        if (error.response?.status === 401) {
          alert('Sesja wygasła. Zaloguj się ponownie.');
          if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') localStorage.removeItem('userToken');
          } else {
            await SecureStore.deleteItemAsync('userToken');
          }
          router.replace('../login');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardAndStartPedometer();

    return () => {
      isMounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ebd59b" />
        <Text style={styles.loadingText}>Ładowanie świata gry...</Text>
      </View>
    );
  }

  // Funkcja renderująca środek ekranu w zależności od platformy
  const renderMapArea = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webFallbackContainer}>
          <Text style={styles.webFallbackIcon}>🧭</Text>
          <Text style={styles.gameModeTitle}>WKRACZASZ DO ŚWIATA STEPQUEST</Text>
          <Text style={styles.gameModeSubtitle}>
            Interaktywna mapa GPS działa na urządzeniach mobilnych Android i iOS. 
            Uruchom aplikację na telefonie, aby śledzić swoją pozycję na żywo!
          </Text>
          {location && (
            <View style={styles.coordinatesBadge}>
              <Text style={styles.coordinatesText}>
                Sygnał GPS zabezpieczony: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Wersja dla telefonu (iOS/Android)
    if (location && MapView && Marker) {
      return (
        <MapView
          style={styles.map}
          customMapStyle={retroDarkMapStyle}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Twoja Pozycja"
            description="Tutaj zaczyna się Twoja przygoda!"
          >
            <View style={styles.markerContainer}>
              <Text style={{ fontSize: 24 }}>🤠</Text>
            </View>
          </Marker>
        </MapView>
      );
    }

    return (
      <View style={styles.mapErrorContainer}>
        <Text style={styles.mapErrorText}>
          {errorMsg || "Szukanie sygnału GPS satelity..."}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* GÓRNY PANEL PROFILU */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>🤠</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.usernameText} numberOfLines={1}>{username.toUpperCase()}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv. 15</Text>
            <Text style={styles.expLabel}>EX</Text>
            <View style={styles.expBarBg}>
              <View style={[styles.expBarFill, { width: '35%' }]} />
            </View>
          </View>
        </View>

        <View style={styles.stepCoinsContainer}>
          <View style={styles.coinsRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinsValue}>{steps.toLocaleString()}</Text>
          </View>
          <Text style={styles.coinsLabel}>STEP COINS</Text>
        </View>
      </View>

      {/* SEKCJA MAPY / OKNA GRY */}
      <View style={styles.mainContent}>
        {renderMapArea()}
      </View>

      {/* DOLNE MENU RPG */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={[styles.navTab, styles.activeNavTab]}>
          <Text style={styles.navIcon}>🧭</Text>
          <Text style={[styles.navText, styles.activeNavText]}>MAPA</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity style={styles.navTab} onPress={() => alert('Sklep wkrótce!')}>
          <Text style={styles.navIcon}>💰</Text>
          <Text style={styles.navText}>SKLEP</Text>
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity style={styles.navTab} onPress={() => alert('Osada wkrótce!')}>
          <Text style={styles.navIcon}>🏡</Text>
          <Text style={styles.navText}>OSADA</Text>
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity style={styles.navTab} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>PROFIL</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const retroDarkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#12181f" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2631" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8a94a6" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#171f2a" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1d2631" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#212933" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#a38450" }, { "opacity": 0.4 }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0d131a" }] }
];

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12181f',
  },
  loadingText: {
    marginTop: 15,
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: '#12181f',
    justifyContent: 'space-between'
  },
  profileHeader: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 45 : 10,
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: '#2a3642',
    borderWidth: 2,
    borderColor: '#d8b26e',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { fontSize: 22 },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  usernameText: {
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 6,
  },
  expLabel: {
    color: '#8a94a6',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 4,
  },
  expBarBg: {
    width: 65,
    height: 8,
    backgroundColor: '#12181f',
    borderWidth: 1,
    borderColor: '#454f5b',
    borderRadius: 1,
    overflow: 'hidden'
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#717d8c',
  },
  stepCoinsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: { fontSize: 18, marginRight: 4 },
  coinsValue: {
    color: '#ebd59b',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  coinsLabel: {
    color: '#ebd59b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: -2,
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
    marginVertical: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#a38450',
    overflow: 'hidden',
    backgroundColor: '#171f2a',
  },
  
  // Widok Web-Fallback (Stylowany na menu gry)
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webFallbackIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  gameModeTitle: {
    color: '#ebd59b',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  gameModeSubtitle: {
    color: '#8a94a6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    maxWidth: 500,
  },
  coordinatesBadge: {
    marginTop: 20,
    backgroundColor: '#1d2631',
    borderWidth: 1,
    borderColor: '#a38450',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  coordinatesText: {
    color: '#ebd59b',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Style dla mapy na urządzeniach mobilnych
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#ebd59b',
    padding: 4,
    borderRadius: 4,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapErrorText: {
    color: '#8a94a6',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomNavContainer: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeNavTab: {
    backgroundColor: '#222d3a',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navText: {
    color: '#8a94a6',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  activeNavText: {
    color: '#ebd59b',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#ebd59b',
    borderRadius: 2,
  },
  navDivider: {
    width: 2,
    height: '45%',
    backgroundColor: '#a38450',
    opacity: 0.4,
  }
});