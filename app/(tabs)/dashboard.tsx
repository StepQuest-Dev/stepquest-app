import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { WebView } from 'react-native-webview';
import api from '../../services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation(); // Poprawiono: usunięto podwójne przypisanie
  const [username, setUsername] = useState('');
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false); // Status wysyłania mocków
  
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
      await api.post('/steps', { count: currentSteps });
    } catch (err) {
      console.error('Błąd synchronizacji kroków z serwerem:', err);
    }
  };

  // MOCK: Bezpieczna funkcja deweloperska do ręcznego nabijania kroków i wysyłki
  const handleAddMockSteps = async (amount: number) => {
    setSyncing(true);
    const updatedSteps = steps + amount;
    
    // 1. Aktualizujemy lokalny stan na ekranie natychmiast
    setSteps(updatedSteps);
    
    // 2. Strzelamy do backendu nową wartością w bloku try-catch
    try {
      console.log(`🚀 [DEV MOCK] Wysyłam ${updatedSteps} kroków do backendu...`);
      await syncStepsWithServer(updatedSteps);
    } catch (err) {
      console.error('Błąd wysyłki mocka:', err);
    } finally {
      setSyncing(false); // Zawsze odblokuje przyciski, nawet jak sieć padnie
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

        // 3. OBSŁUGA KROKOMIERZA (PEDOMETER) - ZABEZPIECZONA PRZED CRASHEM ANDROIDA
        if (Platform.OS !== 'web') {
          const isPedometerAvailable = await Pedometer.isAvailableAsync();
          
          if (isPedometerAvailable) {
            // getStepCountAsync wywołujemy TYLKO na iOS!
            if (Platform.OS === 'ios') {
              const now = new Date();
              const startOfDay = new Date(now);
              startOfDay.setHours(0, 0, 0, 0);

              const stepCountResult = await Pedometer.getStepCountAsync(startOfDay, now);
              if (isMounted) {
                setSteps(stepCountResult.steps);
                syncStepsWithServer(stepCountResult.steps); 
              }
            } else {
              // Na Androidzie bezpiecznie pobieramy ostatni stan z bazy danych NestJS
              try {
                const stepsResponse = await api.get('/steps/latest');
                if (isMounted) setSteps(stepsResponse.data.steps || stepsResponse.data.count || 0);
              } catch (e) {
                if (isMounted) setSteps(0); // Jeśli baza jest pusta, startujemy od zera
              }
            }

            // Nasłuchiwanie kroków w tle/na żywo podczas marszu
            subscription = Pedometer.watchStepCount((result) => {
              if (isMounted) {
                if (Platform.OS === 'ios') {
                  setSteps(result.steps);
                  syncStepsWithServer(result.steps);
                } else {
                  // Poprawne sumowanie kroków na żywo dla systemu Android
                  setSteps((prevSteps) => {
                    const updatedSteps = prevSteps + (result.steps ?? 0);
                    syncStepsWithServer(updatedSteps);
                    return updatedSteps;
                  });
                }
              }
            });
          }
        } else {
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

 const renderMapArea = () => {
    // Jeśli jeszcze nie mamy GPS, pokazujemy komunikat
    if (!location) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>
            {errorMsg || "Szukanie sygnału GPS satelity..."}
          </Text>
        </View>
      );
    }

    // Generujemy czysty silnik Leaflet z darmowym OpenStreetMap
    // Dodaliśmy filtr CSS "invert", dzięki czemu mapa ma od razu piękny, mroczny klimat retro!
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
              body { padding: 0; margin: 0; background-color: #12181f; }
              #map { width: 100%; height: 100vh; }
              
              /* Ten filtr zamienia zwykłą jasną mapę w mroczną mapę RPG! */
              .leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution {
                  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              // Inicjalizacja mapy na Twoich koordynatach
              var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
              
              // Darmowe kafelki bez proszenia Google o zgodę
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '© OpenStreetMap'
              }).addTo(map);

              // Twój znacznik (Kowboj)
              var cowboyIcon = L.divIcon({
                  html: '<div style="font-size: 30px; text-shadow: 2px 2px 4px #000;">🤠</div>',
                  className: 'custom-div-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
              });

              L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: cowboyIcon})
                .addTo(map)
                .bindPopup('<b>Tutaj jesteś!</b><br>Eksploruj świat StepQuest.');
          </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.map}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={{ flex: 1, backgroundColor: '#171f2a' }}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* GÓRNY PANEL PROFILU */}
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.avatarPlaceholder} 
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarText}>🤠</Text>
        </TouchableOpacity>
        
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
          <Text style={styles.stepCoinsLabel}>STEP COINS</Text>
        </View>
      </View>

      {/* PANEL MOCK (DEWELOPERSKI) */}
      <View style={styles.mockPanelContainer}>
        <View style={styles.mockHeaderRow}>
          <Text style={styles.mockPanelTitle}>🛠️ PANEL DEWELOPERSKI (MOCK STEPS)</Text>
          {syncing && <ActivityIndicator size="small" color="#ebd59b" />}
        </View>
        <View style={styles.mockButtonsRow}>
          <TouchableOpacity 
            style={styles.mockButton} 
            onPress={() => handleAddMockSteps(1000)}
            disabled={syncing}
          >
            <Text style={styles.mockButtonText}>+1 000 KROKÓW</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mockButton, styles.mockButtonEpic]} 
            onPress={() => handleAddMockSteps(5000)}
            disabled={syncing}
          >
            <Text style={styles.mockButtonText}>+5 000 KROKÓW</Text>
          </TouchableOpacity>
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
      </View>

    </View>
  );
}

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
  stepCoinsLabel: { // Nazwa zsynchronizowana z JSX u góry
    color: '#ebd59b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: -2,
    opacity: 0.9,
  },
  mockPanelContainer: {
    backgroundColor: '#1a222b',
    borderWidth: 2,
    borderColor: '#d8b26e',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  mockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mockPanelTitle: {
    color: '#ebd59b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mockButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mockButton: {
    flex: 1,
    backgroundColor: '#2a3642',
    borderWidth: 1,
    borderColor: '#a38450',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  mockButtonEpic: {
    borderColor: '#ebd59b',
    backgroundColor: '#352e25',
  },
  mockButtonText: {
    color: '#ebd59b',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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