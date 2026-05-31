import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';
import TopStatusOverlay from '../../components/TopStatusOverlay';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Osada';


const { width, height } = Dimensions.get('window');

export default function OsadaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: true, onConfirm: undefined as (() => void) | undefined });
  const [activeNpc, setActiveNpc] = useState<null | 'elder' | 'warlord' | 'builder' | 'guild'>(null);

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

    // 1. Podmiana 'emoji' na 'imageSource' z funkcją require()
    const npcData = {
      elder: {
        name: 'STARY MĘDRZEC',
        imageSource: require('@/assets/images/mnich-icon.png'),
        dialog: '"Mapy starego świata skrywają skarby, o których inni zapomnieli..."',
        actionLabel: 'SZUKAJ WIEDZY',
        onAction: handleDiscover,
        color: '#a38450'
      },
      warlord: {
        name: 'KAPITAN STRAŻY',
        imageSource: require('@/assets/images/warrior-icon.png'),
        dialog: '"Moi ludzie trenują dzień i noc. Wkrótce uderzymy na sąsiednie osady!"',
        actionLabel: 'NAJAZD (WKRÓTCE)',
        onAction: () => { },
        disabled: true,
        color: '#e74c3c'
      },
      builder: {
        name: 'MISTRZ BUDOWNICZY',
        imageSource: require('@/assets/images/loczek-icon.png'), // <-- Twój obrazek budowniczego
        dialog: '"Potrzebujemy więcej surowców, jeśli chcesz wzmocnić mury tej osady."',
        actionLabel: 'ROZBUDUJ (WKRÓTCE)',
        onAction: () => { },
        disabled: true,
        color: '#3498db'
      },
      guild: {
        name: 'MISTRZ GILDII',
        imageSource: require('@/assets/images/templar-icon.png'),
        dialog: '"W jedności siła, wędrowcze. Dołącz do nas, by wspólnie podbijać ten mroczny świat!"',
        actionLabel: 'GILDIE (WKRÓTCE)',
        onAction: () => { },
        disabled: true,
        color: '#9b59b6'
      }
    }[activeNpc];

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.npcDialogCard, { borderColor: npcData.color }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveNpc(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* 2. Zastąpienie <Text> komponentem <Image> */}
          <Image
            source={npcData.imageSource}
            style={styles.modalImage}
            resizeMode="contain"
          />

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

        {/* Świątynia */}
        <TouchableOpacity style={[styles.building, styles.hut]} onPress={() => setActiveNpc('elder')}>
          <View style={styles.bubbleWrapper}>
            <View style={styles.plaque}>
              <Image source={require('@/assets/images/zwoj.png')} style={styles.plaqueImage} resizeMode="contain" />
              <Text style={styles.plaqueText}>ŚWIĄTYNIA</Text>
            </View>
            <View style={styles.bubblePointer} />
          </View>
        </TouchableOpacity>

        {/* Koszary */}
        <TouchableOpacity style={[styles.building, styles.barracks]} onPress={() => setActiveNpc('warlord')}>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.plaque, { borderColor: '#e74c3c' }]}>
              <Image source={require('@/assets/images/barracks.png')} style={styles.plaqueImage} resizeMode="contain" />
              <Text style={styles.plaqueText}>KOSZARY</Text>
            </View>
            <View style={[styles.bubblePointer, { borderTopColor: '#e74c3c' }]} />
          </View>
        </TouchableOpacity>

        {/* Warsztat */}
        <TouchableOpacity style={[styles.building, styles.workshop]} onPress={() => setActiveNpc('builder')}>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.plaque, { borderColor: '#3498db' }]}>
              <Image source={require('@/assets/images/workshop.png')} style={styles.plaqueImage} resizeMode="contain" />
              <Text style={styles.plaqueText}>WARSZTAT</Text>
            </View>
            <View style={[styles.bubblePointer, { borderTopColor: '#3498db' }]} />
          </View>
        </TouchableOpacity>

        {/* Guild (Bottom Right) */}
        <TouchableOpacity style={[styles.building, styles.guild]} onPress={() => setActiveNpc('guild')}>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.plaque, { borderColor: '#9b59b6' }]}>
              <Image source={require('@/assets/images/guild.png')} style={styles.plaqueImage} resizeMode="contain" />
              <Text style={styles.plaqueText}>GILDIA</Text>
            </View>
            <View style={[styles.bubblePointer, { borderTopColor: '#9b59b6' }]} />
          </View>
        </TouchableOpacity>
      </View>

      {renderNpcModal()}
      <BottomNavBar />
    </ImageBackground>
  );
}

