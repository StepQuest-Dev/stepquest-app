import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// --- IMPORTY SYSTEMOWE ---
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// --- IMPORTY TWOICH KOMPONENTÓW ---
import GameDiagnostics from '../../components/GameDiagnostics';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Dashboard';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';

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

  // --- STANY ALERTÓW ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    title: '', 
    message: '', 
    isSuccess: true, 
    onConfirm: undefined as (() => void) | undefined 
  });

  // --- STANY DIAGNOSTYKI ---
  const [currentStatus, setCurrentStatus] = useState('Inicjalizacja świata gry...');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkErrorDetails, setNetworkErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' }, headerShown: false });
  }, [navigation]);

  const addLog = (msg: string) => {
    console.log(`[DASHBOARD] ${msg}`);
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setCurrentStatus(msg);
  };

  // --- WYSYŁKA NA SERWER ---
  const syncStepsWithServer = async (currentSteps: number) => {
    try {
      await api.post('/steps', { count: currentSteps });
      setAlertConfig({
        title: '🛡️ SYNCHRONIZACJA',
        message: 'Kroki zostały pomyślnie zapisane w chmurze!',
        isSuccess: true,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } catch (err) {
      console.error('Błąd synchronizacji kroków:', err);
    }
  };

  // --- POBIERANIE Z HEALTH CONNECT (ANDROID) ---
  const fetchStepsFromHealthConnect = async (isManualSync = false) => {
    if (Platform.OS !== 'android') return;

    try {
      if (isManualSync) addLog('Ręczne wymuszenie synchronizacji Health Connect...');
      
      const isInitialized = await initialize();
      if (!isInitialized) {
        addLog('⚠️ Health Connect nie jest dostępny na tym urządzeniu.');
        return;
      }

      await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: tomorrow.toISOString(),
        },
      });

      // Bezpieczne sumowanie z records.reduce
      const totalStepsToday = result.records.reduce((sum, record) => sum + record.count, 0);

      setSteps((prevTotal) => {
        if (totalStepsToday > prevTotal) {
          if (isManualSync) syncStepsWithServer(totalStepsToday);
          return totalStepsToday;
        }
        if (isManualSync) syncStepsWithServer(prevTotal);
        return prevTotal;
      });
      
      addLog(`✅ Pomyślnie zaciągnięto kroki z telefonu: ${totalStepsToday}`);
    } catch (error: any) {
      addLog('❌ Błąd pobierania danych z Health Connect: ' + error.message);
    }
  };

  // --- ALERT SYNCHRONIZACJI ---
  const openSyncAlert = () => {
    setAlertConfig({
      title: '🛡️ SYNCHRONIZACJA',
      message: `Czy chcesz pobrać najnowsze kroki z telefonu i zapisać je w chmurze?`,
      isSuccess: false,
      onConfirm: () => {
        setAlertVisible(false);
        fetchStepsFromHealthConnect(true);
      }
    });
    setAlertVisible(true);
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
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        addLog('Uderzam do NestJS po dane profilu...');
        const userResponse = await api.get('/auth/me');
        if (isMounted) setUsername(userResponse.data.username || userResponse.data.email);
        addLog('✅ Zalogowano wojownika: ' + (userResponse.data.username || userResponse.data.email).toUpperCase());

        addLog('Żądanie uprawnień do lokalizacji satelitarnej...');
        let { status: gpsStatus } = await Location.requestForegroundPermissionsAsync();
        if (gpsStatus === 'granted') {
          addLog('✅ Uprawnienia GPS przyznane.');
          let currentByGps = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(currentByGps);
        } else {
          addLog('⚠️ Odmowa uprawnień GPS.');
          setErrorMsg('Brak uprawnień do GPS.');
        }

        if (Platform.OS === 'android') {
          addLog('Inicjalizacja integracji z Health Connect...');
          await fetchStepsFromHealthConnect(false);
        } else {
          const res = await api.get('/steps/latest');
          if (isMounted) setSteps(res.data.steps || res.data.count || 0);
        }

        addLog('🚀 Inicjalizacja zakończona!');
      } catch (error: any) {
        addLog('❌ BŁĄD SIECI!');
        let details = `Wiadomość: ${error.message}\n`;
        if (error.response) details += `Kod: ${error.response.status}`;
        if (isMounted) setNetworkErrorDetails(details);
        if (error.response?.status === 401) router.replace('/(auth)/login');
      } finally {
        if (isMounted && !networkErrorDetails) {
          setTimeout(() => setLoading(false), 600);
        }
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  if (loading || networkErrorDetails) {
    return (
      <GameDiagnostics 
        currentStatus={currentStatus} 
        debugLogs={debugLogs} 
        networkErrorDetails={networkErrorDetails} 
      />
    );
  }

  // --- OBSŁUGA KLIKNIĘĆ Z MAPY WEBVIEW ---
  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'toggle_nav') {
        setIsNavVisible(!isNavVisible);
      } else if (data.type === 'dungeon_click') {
        // Gdy gracz kliknie w loch na mapie:
        setAlertConfig({
          title: `⚔️ ${data.name.toUpperCase()}`,
          message: `Znalazłeś loch! Czy chcesz zużyć 500 Step Coins, aby wejść do środka i zmierzyć się z przeciwnikiem?`,
          isSuccess: false, // false wymusza pokazanie przycisku Anuluj/Potwierdź
          onConfirm: () => {
            setAlertVisible(false);
            // Tutaj możesz dodać logikę odejmowania kroków lub przekierowanie do walki
            alert(`Wkraczasz do: ${data.name}! (Logika walki wkrótce)`);
          }
        });
        setAlertVisible(true);
      }
    } catch (e) {
      console.warn("Nierozpoznana wiadomość z WebView", e);
    }
  };

  const renderMapArea = () => {
    if (!location) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>{errorMsg || "Szukanie sygnału GPS..."}</Text>
        </View>
      );
    }
    
    const userIconUri = Image.resolveAssetSource(require('@/assets/images/user-icon.png')).uri;
    
    // Generujemy mapę z nałożonymi lochami (przesuniętymi względem gracza)
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding:0; margin:0; background-color:#12181f; }
          #map { width:100%; height:100vh; }
          .leaflet-layer { filter:invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
          .custom-player-icon { border-radius:25%; background-color:#2a3642; box-shadow:2px 2px 4px rgba(0,0,0,0.8); object-fit:cover; }
          .dungeon-icon { font-size:32px; text-shadow: 0 0 15px rgba(255,50,50,0.8), 2px 2px 5px #000; text-align:center; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map',{zoomControl:false}).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
          
          // --- ZNACZNIK GRACZA ---
          var playerIcon = L.icon({iconUrl:'${userIconUri}', iconSize:[40,40], iconAnchor:[20,20], className:'custom-player-icon'});
          L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon:playerIcon})
           .addTo(map)
           .bindPopup("<b>To Ty!</b><br>Eksploruj okolicę.");

          // --- GENEROWANIE LOCHÓW (IKONKI) ---
          var dungeons = [
            { name: "Mroczne Podziemia", icon: "🏰", lat: ${location.coords.latitude + 0.0015}, lng: ${location.coords.longitude + 0.002} },
            { name: "Jaskinia Goblinów", icon: "💀", lat: ${location.coords.latitude - 0.002}, lng: ${location.coords.longitude + 0.001} },
            { name: "Opuszczona Kopalnia", icon: "🦇", lat: ${location.coords.latitude + 0.0008}, lng: ${location.coords.longitude - 0.0025} }
          ];

          dungeons.forEach(function(dungeon) {
            var dIcon = L.divIcon({ html: '<div class="dungeon-icon">' + dungeon.icon + '</div>', className: '', iconSize: [36,36], iconAnchor: [18,18] });
            var marker = L.marker([dungeon.lat, dungeon.lng], {icon: dIcon}).addTo(map);
            
            // Kliknięcie w loch wysyła sygnał do aplikacji w React Native
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dungeon_click', name: dungeon.name }));
            });
          });

          // --- KLIKNIĘCIE W PUSTĄ MAPĘ (Ukrywa/Pokazuje pasek zadań) ---
          map.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggle_nav' }));
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
          onMessage={handleMapMessage} // <--- Podpięta nowa funkcja
        />
      );
    }
    return (
      <TouchableOpacity activeOpacity={1} style={styles.webFallbackContainer} onPress={() => setIsNavVisible(!isNavVisible)}>
        <Text style={styles.webFallbackIcon}>🧭</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.mapContainer}>{renderMapArea()}</View>

      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarPlaceholder} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
            <Image source={require('@/assets/images/user-icon.png')} style={styles.avatarImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.usernameText} numberOfLines={1}>{username.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.stepCoinsContainer} onPress={openSyncAlert} activeOpacity={0.7}>
            <View style={styles.coinsRow}>
              <Image source={require('@/assets/images/coins.png')} style={styles.coinImage} resizeMode="contain" />
              <Text style={styles.coinsValue}>{steps.toLocaleString()}</Text>
            </View>
            <Text style={styles.coinsLabel}>STEP COINS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isNavVisible && <BottomNavBar/>}
    </View>
  );
}