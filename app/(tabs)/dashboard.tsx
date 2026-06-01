import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';
import GameDiagnostics from '../../components/GameDiagnostics';
import TopStatusOverlay from '../../components/TopStatusOverlay';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Dashboard';

// --- FUNKCJA POMOCNICZA DO AWATARU POSTACI ---
const getCharacterAvatar = (className?: string) => {
  if (!className) return require('@/assets/images/user-icon.png');
  switch (className.toLowerCase()) {
    case 'wojownik': return require('@/assets/images/framed-icons/warrior-icon-ramka.png');
    case 'mnich': return require('@/assets/images/framed-icons/monk-icon-ramka.png');
    case 'czarnoksiężnik': return require('@/assets/images/framed-icons/mag-icon-ramka.png');
    case 'zwiadowca': return require('@/assets/images/framed-icons/loczek-icon-ramka.png');
    default: return require('@/assets/images/user-icon.png');
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<any[]>([]);

  const [character, setCharacter] = useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isNavVisible, setIsNavVisible] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    isSuccess: true,
    onConfirm: undefined as (() => void) | undefined
  });

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
    // Backend wymaga liczby całkowitej dodatniej (@IsInt, @IsPositive)
    const validCount = Math.floor(currentSteps);
    if (validCount <= 0) return; 

    try {
      await api.post('/steps', { count: validCount });
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
          const serverSteps = res.data?.steps || res.data?.count || res.data?.totalSteps || 0;
          if (isActive) setSteps((prev) => (serverSteps > prev ? serverSteps : prev));
        } catch (e) { }
      };

      const fetchPlaces = async () => {
        try {
          const res = await api.get('/places');
          if (isActive) setDiscoveredPlaces(res.data);
        } catch (e) { }
      };

      const fetchCharacter = async () => {
        try {
          const res = await api.get('/character');
          if (isActive && res.data) {
            const charData = Array.isArray(res.data) ? res.data[0] : res.data;
            setCharacter(charData);
          }
        } catch (e) { }
      };

      fetchLatestSteps();
      fetchPlaces();
      fetchCharacter();
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
              if (isMounted) setSteps(res.data?.steps || res.data?.count || res.data?.totalSteps || 0);
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
            if (isMounted) setSteps(res.data?.steps || res.data?.count || res.data?.totalSteps || 0);
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

    const userIconSource = getCharacterAvatar(character?.class?.name);

    let userIconUri = '';
    try {
      userIconUri = Image.resolveAssetSource(userIconSource).uri;
    } catch (e) {
      userIconUri = typeof userIconSource === 'string' ? userIconSource : '';
    }

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
        
        .leaflet-layer {
          filter: invert(100%) hue-rotate(180deg) brightness(250%) contrast(80%);
        }
        
        /* --- DODANA ZŁOTA RAMKA Z CSS --- */
        .custom-player-icon {
          border-radius: 8px; /* Lekkie zaokrąglenie dla estetyki */
          background-color: #2a3642; /* Tło pod ikonką, na wypadek gdyby miała przezroczystość */
          //border: 2px solid #a38450; /* Złoty border RPG */
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
          key={character?.class?.name || 'default-map'}
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

      {isNavVisible && <BottomNavBar />}
    </View>
  );
}