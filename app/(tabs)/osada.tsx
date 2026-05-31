import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import api from '../../services/api';
import BottomNavBar from '../../components/BottomNavBar';
import CustomAlert from '../../components/CustomAlerts';

export default function OsadaScreen() {
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: true });

  const handleDiscover = async () => {
    setLoading(true);
    try {
      // 1. Pobierz lokalizację
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Brak uprawnień do GPS.');
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Wyślij do backendu
      const res = await api.post('/places/discover', { lat: latitude, lon: longitude });

      // 3. Sukces!
      setAlertConfig({
        title: '✨ ODKRYCIE!',
        message: `Mędrzec wskazuje na mapie: \n\n"${res.data.name}"\n\nTo miejsce pojawiło się na Twojej mapie świata!`,
        isSuccess: true,
      });
      setAlertVisible(true);

    } catch (error: any) {
      setAlertConfig({
        title: 'Błąd',
        message: error.response?.data?.message || error.message || 'Nie udało się odkryć niczego nowego.',
        isSuccess: false,
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.content}>
        <View style={styles.header}>
           <Image source={require('@/assets/images/osada.png')} style={styles.icon} resizeMode="contain" />
           <Text style={styles.title}>OSADA</Text>
           <Text style={styles.subtitle}>Bezpieczna przystań w mrocznym świecie.</Text>
        </View>

        <View style={styles.npcCard}>
          <Text style={styles.npcEmoji}>🧙‍♂️</Text>
          <View style={styles.npcInfo}>
            <Text style={styles.npcName}>STARY MĘDRZEC</Text>
            <Text style={styles.npcDialog}>
              "Wędrowcze, świat skrywa wiele tajemnic. Pozwól, że spojrzę w moje księgi i wskażę ci drogę do miejsc zapomnianych przez czas..."
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.discoverButton} 
          onPress={handleDiscover}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.discoverButtonText}>ZAPYTAJ O DROGĘ</Text>
          )}
        </TouchableOpacity>
      </View>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12181f',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    tintColor: '#ebd59b',
  },
  title: {
    color: '#ebd59b',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#8a94a6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  npcCard: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  npcEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  npcInfo: {
    flex: 1,
  },
  npcName: {
    color: '#ebd59b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  npcDialog: {
    color: '#fff',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  discoverButton: {
    backgroundColor: '#a38450',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ebd59b',
    width: '100%',
    alignItems: 'center',
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
