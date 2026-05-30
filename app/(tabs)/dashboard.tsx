import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Platform, Text, TouchableOpacity, View, Modal } from 'react-native';
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

  

  // --- STAN UKRYWANIA PASKA ---
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- STANY DIAGNOSTYKI ---
  const [currentStatus, setCurrentStatus] = useState('Inicjalizacja świata gry...');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkErrorDetails, setNetworkErrorDetails] = useState<string | null>(null);

  // Zmiana opcji nawigacji ZAWSZE, gdy zmieni się stan isNavVisible (kliknięcie w mapę)

 useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' }, headerShown: false });
  }, [navigation]);


  useEffect(() => {
    navigation.setOptions({ 
      tabBarStyle: { display: isNavVisible ? 'flex' : 'none' }, 
      headerShown: false 
    });
  }, [isNavVisible, navigation]);

  const addLog = (msg: string) => {
    console.log(`[DASHBOARD] ${msg}`);
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setCurrentStatus(msg);
  };

  const syncStepsWithServer = async (currentSteps: number) => {
    try {
      await api.post('/steps', { count: currentSteps });
    } catch (err) {
      console.error('Błąd synchronizacji kroków:', err);
    }
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
        addLog('Uderzam do NestJS po dane profilu...');
        const userResponse = await api.get('/auth/me');
        if (isMounted) setUsername(userResponse.data.username || userResponse.data.email);
        addLog('✅ Zalogowano wojownika: ' + (userResponse.data.username || userResponse.data.email).toUpperCase());

        addLog('Żądanie uprawnień do lokalizacji satelitarnej...');
        let { status: gpsStatus } = await Location.requestForegroundPermissionsAsync();
        if (gpsStatus === 'granted') {
          addLog('✅ Uprawnienia GPS przyznane. Ustalanie pozycji...');
          let currentByGps = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(currentByGps);
          addLog('✅ Sygnał GPS zabezpieczony.');
        } else {
          addLog('⚠️ Odmowa uprawnień GPS.');
          setErrorMsg('Brak uprawnień do GPS.');
        }

        if (Platform.OS !== 'web') {
          addLog('Sprawdzanie czujników ruchu telefonu...');
          const isPedometerAvailable = await Pedometer.isAvailableAsync();
          if (isPedometerAvailable) {
            addLog('✅ Znaleziono sprzętowy krokomierz.');
            try {
              addLog('Pobieram historię kroków z bazy...');
              const res = await api.get('/steps/latest');
              if (isMounted) setSteps(res.data.steps || res.data.count || 0);
              addLog(`✅ Baza wczytana: ${res.data.steps || res.data.count || 0} kroków.`);
            } catch (e) { 
              addLog('⚠️ Brak poprzednich wpisów na serwerze.');
            }

            addLog('Uruchamianie nasłuchu aktywności w tle...');
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
          } else {
            addLog('⚠️ Brak sprzętowego wsparcia dla pedometru.');
          }
        } else {
          addLog('Wykryto przeglądarkę Web. Ładowanie z chmury...');
          const stepsResponse = await api.get('/steps/latest');
          if (isMounted) setSteps(stepsResponse.data.steps || stepsResponse.data.count || 0);
        }

        addLog('🚀 Inicjalizacja świata zakończona pomyślnie!');

      } catch (error: any) {
        addLog('❌ WYSTĄPIŁ BŁĄD SIECIOWY!');
        let details = `Wiadomość: ${error.message}\n`;
        if (error.response) details += `Kod HTTP: ${error.response.status}\nOdpowiedź: ${JSON.stringify(error.response.data)}`;
        if (isMounted) setNetworkErrorDetails(details);

        if (error.response?.status === 401) {
          addLog('Sesja wygasła. Wylogowywanie...');
          router.replace('/(auth)/login');
        }
      } finally {
        // Małe opóźnienie, żeby gracz mógł przeczytać na zielono, że wszystko gra, zanim konsola zniknie
        if (isMounted && !networkErrorDetails) {
          setTimeout(() => {
            setLoading(false);
          }, 600);
        }
      }
    };

    fetchDashboardAndStartPedometer();
    return () => {
      isMounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  const onWebViewMessage = (event: any) => {
    if (event.nativeEvent.data === 'toggle_nav') {
      setIsNavVisible((prev) => !prev);
    }
  };

  if (loading || networkErrorDetails) {
    return (
      <GameDiagnostics 
        currentStatus={currentStatus} 
        debugLogs={debugLogs} 
        networkErrorDetails={networkErrorDetails} 
      />
    );
  }

  const renderMapArea = () => {
    if (!location) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>{errorMsg || "Szukanie sygnału GPS satelity..."}</Text>
        </View>
      );
    }

    // 1. Rozwiąż ścieżkę do lokalnego obrazka, aby WebView mogło go odczytać
    const userIconUri = Image.resolveAssetSource(require('@/assets/images/user-icon.png')).uri;

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
                  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
              /* 2. Stylizacja nowego znacznika gracza (Zlota ramka, okragly ksztalt) */
              .custom-player-icon {
                  border-radius: 25%;
                  background-color: #2a3642;
                  box-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                  object-fit: cover;
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '漏 OpenStreetMap'
              }).addTo(map);

              // 3. U偶ywamy L.icon zamiast L.divIcon do wy艣wietlenia grafiki
              var playerIcon = L.icon({
                  iconUrl: '${userIconUri}', // Wstrzykni臋ty link do obrazka
                  iconSize: [40, 40],        // Rozmiar obrazka [szeroko艣膰, wysoko艣膰]
                  iconAnchor: [20, 20],      // Punkt zaczepienia (艣rodek)
                  popupAnchor: [0, -20],     // Gdzie ma pojawi膰 si臋 dymek (nad ikon膮)
                  className: 'custom-player-icon' // Dodaje klas臋 CSS zdefiniowan膮 wy偶ej
              });

              L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: playerIcon})
                .addTo(map)
                .bindPopup('<b>Tutaj jesteś!</b><br>Eksploruj Świat StepQuest.');

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

      {/* --- WŁASNY, STYLIZOWANY ALERT RPG --- */}
      <Modal animationType="fade" transparent={true} visible={syncModalVisible} onRequestClose={() => setSyncModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.customAlertBox}>
            <Text style={styles.alertTitle}>🛡️ SYNCHRONIZACJA</Text>
            {successMessage ? (
              <View>
                <Text style={styles.alertMessageSuccess}>{successMessage}</Text>
                <TouchableOpacity 
                  style={styles.alertButtonOk} 
                  onPress={() => { setSyncModalVisible(false); setTimeout(() => setSuccessMessage(null), 300); }}
                >
                  <Text style={styles.alertButtonText}>DOBRZE</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.alertMessage}>Czy chcesz przymusowo zsynchronizować zebrane {steps} kroków z bazą danych?</Text>
                <View style={styles.alertButtonsRow}>
                  <TouchableOpacity style={styles.alertButtonCancel} onPress={() => setSyncModalVisible(false)}>
                    <Text style={styles.alertButtonTextCancel}>NIE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.alertButtonConfirm} 
                    onPress={() => { syncStepsWithServer(steps); setSuccessMessage('Kroki zostały pomyślnie zapisane w chmurze!'); }}
                  >
                    <Text style={styles.alertButtonText}>TAK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 1. TŁO: PEŁNOEKRANOWA MAPA */}
      <View style={styles.mapContainer}>
        {renderMapArea()}
      </View>

      {/* 2. GÓRNA NAKŁADKA (PROFIL + MONETY) */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarPlaceholder} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
            {/* Zastąpiony tekst komponentem Image */}
            <Image
              source={require('@/assets/images/user-icon.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.usernameText} numberOfLines={1}>{username.toUpperCase()}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Lv. 15</Text>
              <Text style={styles.expLabel}>EXP</Text>
              <View style={styles.expBarBg}>
                <View style={[styles.expBarFill, { width: '35%' }]} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.stepCoinsContainer} onPress={() => setSyncModalVisible(true)} activeOpacity={0.7}>
            <View style={styles.coinsRow}>
              <Image
                source={require('@/assets/images/coins.png')} // Podmień na plik swojej monety
                style={styles.coinImage}
                resizeMode="contain"
              />
              <Text style={styles.coinsValue}>{steps.toLocaleString()}</Text>
            </View>
            <Text style={styles.coinsLabel}>STEP COINS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. DOLNA NAKŁADKA (NAWIGACJA - UKRYWANA PRZY KLIKNIĘCIU W MAPĘ) */}
            {isNavVisible && (
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity style={[styles.navTab, styles.activeNavTab]}>
            <Image
              source={require('@/assets/images/mapa.png')} // Zmie艅 nazw臋 pliku na swoj膮
              style={styles.navImage}
              resizeMode="contain"
            />
            <Text style={[styles.navText, styles.activeNavText]}>MAPA</Text>
            <View style={styles.activeIndicator} />
          </TouchableOpacity>

           <View style={styles.navDivider} />

          <TouchableOpacity style={styles.navTab} onPress={() => alert('Sklep wkr贸tce!')}>
            <Image
              source={require('@/assets/images/money.png')} // Zmie艅 nazw臋 pliku na swoj膮
              style={styles.navImage}
              resizeMode="contain"
            />
            <Text style={styles.navText}>SKLEP</Text>
          </TouchableOpacity>

          <View style={styles.navDivider} />

          <TouchableOpacity style={styles.navTab} onPress={() => alert('Osada wkr贸tce!')}>
            <Image
              source={require('@/assets/images/osada.png')} // Zmie艅 nazw臋 pliku na swoj膮
              style={styles.navImage}
              resizeMode="contain"
            />
            <Text style={styles.navText}>OSADA</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}