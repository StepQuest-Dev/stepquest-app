import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import api from '../../services/api';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';
import TopStatusOverlay from '../../components/TopStatusOverlay';
import { styles } from '../../styles/tabs/Osada';


const { width, height } = Dimensions.get('window');

export default function OsadaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: true, onConfirm: undefined as (() => void) | undefined  });
  const [activeNpc, setActiveNpc] = useState<null | 'elder' | 'warlord' | 'builder'>(null);

  const [steps, setSteps] = useState(0);

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Brak uprawnień do GPS.');
      
      const location = await Location.getCurrentPositionAsync({});
      const res = await api.post('/places/discover', { 
        lat: location.coords.latitude, 
        lon: location.coords.longitude 
      });

      setAlertConfig({
        title: '✨ ODKRYCIE!',
        message: `Mędrzec wskazuje na mapie: \n\n"${res.data.name}"\n\nTo miejsce pojawiło się na Twojej mapie świata!`,
        isSuccess: true,
        onConfirm: undefined
      });
      setAlertVisible(true);
      setActiveNpc(null);
    } catch (error: any) {
      setAlertConfig({
        title: 'Błąd',
        message: error.response?.data?.message || error.message || 'Nie udało się odkryć niczego nowego.',
        isSuccess: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
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

  const renderNpcModal = () => {
    if (!activeNpc) return null;

    const npcData = {
      elder: {
        name: 'STARY MĘDRZEC',
        emoji: '🧙‍♂️',
        dialog: '"Mapy starego świata skrywają skarby, o których inni zapomnieli..."',
        actionLabel: 'SZUKAJ WIEDZY',
        onAction: handleDiscover,
        color: '#a38450'
      },
      warlord: {
        name: 'KAPITAN STRAŻY',
        emoji: '🛡️',
        dialog: '"Moi ludzie trenują dzień i noc. Wkrótce uderzymy na sąsiednie osady!"',
        actionLabel: 'NAJAZD (WKRÓTCE)',
        onAction: () => {},
        disabled: true,
        color: '#e74c3c'
      },
      builder: {
        name: 'MISTRZ BUDOWNICZY',
        emoji: '👷',
        dialog: '"Potrzebujemy więcej surowców, jeśli chcesz wzmocnić mury tej osady."',
        actionLabel: 'ROZBUDUJ (WKRÓTCE)',
        onAction: () => {},
        disabled: true,
        color: '#3498db'
      }
    }[activeNpc];

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.npcDialogCard, { borderColor: npcData.color }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveNpc(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalEmoji}>{npcData.emoji}</Text>
          <Text style={styles.modalName}>{npcData.name}</Text>
          <Text style={styles.modalDialog}>{npcData.dialog}</Text>
          <TouchableOpacity 
            style={[styles.modalActionBtn, { backgroundColor: npcData.color }, npcData.disabled && styles.disabledBtn]} 
            onPress={npcData.onAction}
            disabled={npcData.disabled || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalActionText}>{npcData.actionLabel}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/osada_bg.png')} 
      style={styles.container}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onClose={() => setAlertVisible(false)}
      />

      <TopStatusOverlay steps={steps} onSyncPress={openSyncAlert} />

      {/* --- SCENA MIASTA (TOWN VIEW) --- */}
      <View style={styles.townView}>
        {/* Elder's Hut (Top Left) */}
        <TouchableOpacity style={[styles.building, styles.hut]} onPress={() => setActiveNpc('elder')}>
          <View style={styles.bubbleWrapper}>
            <View style={styles.plaque}>
              <Text style={styles.plaqueIcon}>📜</Text>
              <Text style={styles.plaqueText}>ŚWIĄTYNIA</Text>
            </View>
            <View style={styles.bubblePointer} />
          </View>
        </TouchableOpacity>

        {/* Barracks (Middle Right) */}
        <TouchableOpacity style={[styles.building, styles.barracks]} onPress={() => setActiveNpc('warlord')}>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.plaque, { borderColor: '#e74c3c' }]}>
              <Text style={styles.plaqueIcon}>⚔️</Text>
              <Text style={styles.plaqueText}>KOSZARY</Text>
            </View>
            <View style={[styles.bubblePointer, { borderTopColor: '#e74c3c' }]} />
          </View>
        </TouchableOpacity>

        {/* Workshop (Bottom Left) */}
        <TouchableOpacity style={[styles.building, styles.workshop]} onPress={() => setActiveNpc('builder')}>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.plaque, { borderColor: '#3498db' }]}>
              <Text style={styles.plaqueIcon}>🔨</Text>
              <Text style={styles.plaqueText}>WARSZTAT</Text>
            </View>
            <View style={[styles.bubblePointer, { borderTopColor: '#3498db' }]} />
          </View>
        </TouchableOpacity>
      </View>

      {renderNpcModal()}
      <BottomNavBar />
    </ImageBackground>
  );
}

