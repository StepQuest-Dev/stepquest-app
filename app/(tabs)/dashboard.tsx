import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import GameDiagnostics from '../../components/GameDiagnostics';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Dashboard';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';
import TopStatusOverlay from '../../components/TopStatusOverlay';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<any[]>([]);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- STAN UKRYWANIA PASKA ---
  const [isNavVisible, setIsNavVisible] = useState(true);

  // --- NOWE STANY ALERTÓW ---
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

  const openSyncAlert = () => {
    setAlertConfig({
      title: '🛡️ SYNCHRONIZACJA',
      message: `Czy chcesz przymusowo zsynchronizować zebrane ${steps} kroków z bazą danych?`,
      isSuccess: false,
      onConfirm: () => {
        setAlertVisible(false);
        syncStepsWithServer(steps);
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

      const fetchPlaces = async () => {
        try {
          const res = await api.get('/places');
          if (isActive) setDiscoveredPlaces(res.data);
        } catch (e) { }
      };

      fetchLatestSteps();
      fetchPlaces();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let isMounted = true;
    let watchAccumulator = 0;

    const fetchDashboardAndStartPedometer = async () => {
      try {
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

        if (Platform.OS !== 'web') {
          addLog('Sprawdzanie czujników ruchu...');
          const isPedometerAvailable = await Pedometer.isAvailableAsync();
          if (isPedometerAvailable) {
            try {
              const res = await api.get('/steps/latest');
              if (isMounted) setSteps(res.data.steps || res.data.count || 0);
            } catch (e) { addLog('⚠️ Brak wpisów w bazie.'); }

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

    fetchDashboardAndStartPedometer();
    return () => { isMounted = false; if (subscription) subscription.remove(); };
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

  const renderMapArea = () => {
    if (!location) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>{errorMsg || "Szukanie sygnału GPS..."}</Text>
        </View>
      );
    }
    const userIconUri = Image.resolveAssetSource(require('@/assets/images/user-icon.png')).uri;
    
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: #43688b; }
        #map { width: 100%; height: 100vh; }
        
        /* ZWIĘKSZONO JASNOŚĆ: brightness zmienione z 95% na 120% */
        .leaflet-layer {
          filter: invert(100%) hue-rotate(180deg) brightness(250%) contrast(80%);
        }
        
        .custom-player-icon {
          border-radius: 25%;
          background-color: #2a3642;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          object-fit: cover;
        }

        .custom-poi-icon {
          font-size: 24px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .poi-collected {
          filter: grayscale(100%) brightness(70%);
          opacity: 0.6;
        }

        .popup-btn {
          background-color: #a38450;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          font-family: sans-serif;
          font-weight: bold;
          cursor: pointer;
          margin-top: 5px;
          width: 100%;
        }
      </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }).addTo(map);
          
          var playerIcon = L.icon({
            iconUrl: '${userIconUri}',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'custom-player-icon'
          });
          L.marker([${location.coords.latitude}, ${location.coords.longitude}], { icon: playerIcon }).addTo(map);
          
          // --- ODKRYTE MIEJSCA ---
          ${JSON.stringify(discoveredPlaces)}.forEach(function(place) {
            var iconClass = 'custom-poi-icon' + (place.isCollected ? ' poi-collected' : '');
            var poiIcon = L.divIcon({
              html: place.isCollected ? '🚩' : '🏰',
              className: iconClass,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });

            var marker = L.marker([place.lat, place.lon], { icon: poiIcon }).addTo(map);
            
            var popupContent = '<div style="text-align:center"><b style="color:#000">' + place.name + '</b><br/>';
            if (!place.isCollected) {
              popupContent += '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\\\'collect_place:' + place.id + '\\\')">ZBIERZ NAGRODĘ</button>';
            } else {
              popupContent += '<small style="color:#666">Miejsce odwiedzone</small>';
            }
            popupContent += '</div>';
            
            marker.bindPopup(popupContent);
          });

          map.on('click', function(e) {
            if (e.originalEvent.target.id === 'map') {
              window.ReactNativeWebView.postMessage('toggle_nav');
            }
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
          style={{ flex: 1, backgroundColor: '#27384e' }}
          scrollEnabled={false}
          onMessage={(e) => { 
            const msg = e.nativeEvent.data;
            if (msg === 'toggle_nav') {
              setIsNavVisible(!isNavVisible);
            } else if (msg.startsWith('collect_place:')) {
              const placeId = msg.split(':')[1];
              handleCollectPlace(placeId);
            }
          }}
        />
      );
    }
    return (
      <TouchableOpacity activeOpacity={1} style={styles.webFallbackContainer} onPress={() => setIsNavVisible(!isNavVisible)}>
        <Text style={styles.webFallbackIcon}>🧭</Text>
      </TouchableOpacity>
    );
  };

  const handleCollectPlace = async (placeId: string) => {
    if (!location) return;
    try {
      const res = await api.post(`/places/collect/${placeId}`, {
        lat: location.coords.latitude,
        lon: location.coords.longitude
      });
      
      setAlertConfig({
        title: '🏆 MIEJSCE ODWIEDZONE',
        message: `Gratulacje! Odwiedziłeś "${res.data.placeName}".\n\nNagrody:\n⭐ ${res.data.rewards.exp} EXP\n💰 ${res.data.rewards.gold} Złota`,
        isSuccess: true,
        onConfirm: () => {
          setAlertVisible(false);
          // Odśwież listę miejsc
          api.get('/places').then(res => setDiscoveredPlaces(res.data));
        }
      });
      setAlertVisible(true);
    } catch (err: any) {
      setAlertConfig({
        title: '⚠️ ZA DALEKO',
        message: err.response?.data?.message || 'Nie udało się zebrać nagrody.',
        isSuccess: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    }
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

      <TopStatusOverlay steps={steps} onSyncPress={openSyncAlert} />

      {isNavVisible && <BottomNavBar/>}
    </View>
  );
}