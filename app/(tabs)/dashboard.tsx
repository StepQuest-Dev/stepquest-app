import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import GameDiagnostics from '../../components/GameDiagnostics';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Dashboard';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- STAN UKRYWANIA PASKA NAWIGACYJNEGO ---
  const [isNavVisible, setIsNavVisible] = useState(true);

  // --- STANY DIAGNOSTYKI ---
  const [currentStatus, setCurrentStatus] = useState('Inicjalizacja świata gry...');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkErrorDetails, setNetworkErrorDetails] = useState<string | null>(null);

  const addLog = (msg: string) => {
    console.log(`[DASHBOARD] ${msg}`);
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setCurrentStatus(msg);
  };

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' }, headerShown: false });
  }, [navigation]);

  const syncStepsWithServer = async (currentSteps: number) => {
    try {
      await api.post('/steps', { count: currentSteps });
    } catch (err) {
      console.error('Błąd synchronizacji kroków:', err);
    }
  };

  const handleManualSync = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Czy chcesz zsynchronizować swoje kroki z serwerem?')) {
        syncStepsWithServer(steps);
        alert('Kroki zostały zsynchronizowane!');
      }
    } else {
      Alert.alert(
        'Synchronizacja',
        'Czy chcesz zsynchronizować swoje kroki z serwerem?',
        [
          { text: 'NIE', style: 'cancel' },
          { text: 'TAK', onPress: () => { syncStepsWithServer(steps); Alert.alert('Sukces', 'Kroki zapisane!'); } }
        ]
      );
    }
  };

  // Dodawanie wirtualnych kroków z poziomu mini-panela na mapie
  const handleAddMockSteps = async (amount: number) => {
    const updatedSteps = steps + amount;
    setSteps(updatedSteps);
    await syncStepsWithServer(updatedSteps);
    Alert.alert('Sukces', `Dodano ${amount} kroków!`);
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchLatestSteps = async () => {
        try {
          const res = await api.get('/steps/latest');
          const serverSteps = res.data.steps || res.data.count || 0;
          if (isActive) setSteps((prev) => (serverSteps > prev ? serverSteps : prev));
        } catch (e) { }
      };
      fetchLatestSteps();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let isMounted = true;
    let watchAccumulator = 0;

    const fetchDashboardAndStartPedometer = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (isMounted) setUsername(userResponse.data.username || userResponse.data.email);

        let { status: gpsStatus } = await Location.requestForegroundPermissionsAsync();
        if (gpsStatus === 'granted') {
          let currentByGps = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(currentByGps);
        } else {
          setErrorMsg('Brak uprawnień do GPS.');
        }

        if (Platform.OS !== 'web') {
          const isPedometerAvailable = await Pedometer.isAvailableAsync();
          if (isPedometerAvailable) {
            try {
              const res = await api.get('/steps/latest');
              if (isMounted) setSteps(res.data.steps || res.data.count || 0);
            } catch (e) { }

            subscription = Pedometer.watchStepCount((result) => {
              if (isMounted) {
                const hardwareCounter = result.steps;
                const delta = hardwareCounter - watchAccumulator;
                if (delta > 0) {
                  setSteps((prevTotal) => {
                    const updatedTotal = prevTotal + delta;
                    syncStepsWithServer(updatedTotal);
                    return updatedTotal;
                  });
                  watchAccumulator = hardwareCounter;
                }
              }
            });
          }
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.replace('/(auth)/login');
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

  // Odbieranie sygnału z mapy (kliknięcie by ukryć/pokazać pasek)
  const onWebViewMessage = (event: any) => {
    if (event.nativeEvent.data === 'toggle_nav') {
      setIsNavVisible((prev) => !prev);
    }
  };

  if (loading) return <GameDiagnostics currentStatus={currentStatus} debugLogs={debugLogs} networkErrorDetails={networkErrorDetails} />;

  const renderMapArea = () => {
    if (!location) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>{errorMsg || "Szukanie sygnału GPS satelity..."}</Text>
        </View>
      );
    }

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
              .leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution {
                  /* Ustawia ciemny motyw dla mapy (opcjonalne, w razie czego można usunąć ten filtr) */
                  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '© OpenStreetMap'
              }).addTo(map);

              var cowboyIcon = L.divIcon({
                  html: '<div style="font-size: 30px; text-shadow: 2px 2px 4px #000;">🤠</div>',
                  className: 'custom-div-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
              });

              L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: cowboyIcon})
                .addTo(map)
                .bindPopup('<b>Tutaj jesteś!</b><br>Eksploruj świat StepQuest.');

              // Zdarzenie kliknięcia wysyłające wiadomość do React Native
              map.on('click', function() {
                  window.ReactNativeWebView.postMessage('toggle_nav');
              });
          </script>
      </body>
      </html>
    `;

    if (Platform.OS !== 'web') {
      return (
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={{ flex: 1, backgroundColor: '#171f2a' }}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onMessage={onWebViewMessage}
        />
      );
    }

    return (
      <TouchableOpacity activeOpacity={1} style={styles.webFallbackContainer} onPress={() => setIsNavVisible(!isNavVisible)}>
        <Text style={styles.webFallbackIcon}>🧭</Text>
        <Text style={styles.gameModeTitle}>MAPA WEB</Text>
        <Text style={styles.gameModeSubtitle}>Kliknij tło, aby ukryć/pokazać nawigację.</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* 1. TŁO: PEŁNOEKRANOWA MAPA */}
      <View style={styles.mapContainer}>
        {renderMapArea()}
      </View>

      {/* 2. GÓRNA NAKŁADKA (PROFIL + DEV PANEL ZDJĘCIA) */}
      <View style={styles.topOverlay} pointerEvents="box-none">

        {/* Główny pasek profilu */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarPlaceholder} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
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

          <TouchableOpacity style={styles.stepCoinsContainer} onPress={handleManualSync} activeOpacity={0.7}>
            <View style={styles.coinsRow}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{steps.toLocaleString()}</Text>
            </View>
            <Text style={styles.coinsLabel}>STEP COINS</Text>
          </TouchableOpacity>
        </View>

        {/* Mały panel dodawania kroków (jak na załączonym screenie) */}
        <View style={styles.devPanel}>
          <Text style={styles.devPanelTitle}>🛠 PANEL DEWELOPERSKI (MOCK STEPS)</Text>
          <View style={styles.devButtonsRow}>
            <TouchableOpacity style={styles.devButton} onPress={() => handleAddMockSteps(1000)}>
              <Text style={styles.devButtonText}>+1 000 KROKÓW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => handleAddMockSteps(5000)}>
              <Text style={styles.devButtonText}>+5 000 KROKÓW</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* 3. DOLNA NAKŁADKA (NAWIGACJA - UKRYWANA PRZY KLIKNIĘCIU W MAPĘ) */}
      {isNavVisible && (
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
      )}

    </View>
  );
}