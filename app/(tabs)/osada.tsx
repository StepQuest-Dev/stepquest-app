import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Brak uprawnień do GPS.');
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await api.post('/places/discover', { lat: latitude, lon: longitude });

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <Image source={require('@/assets/images/osada.png')} style={styles.icon} resizeMode="contain" />
           <Text style={styles.title}>TWOJA OSADA</Text>
           <Text style={styles.subtitle}>Centrum Twojego imperium i bezpieczna przystań.</Text>
        </View>

        {/* --- STATYSTYKI OSADY --- */}
        <View style={styles.resourcesBar}>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🪵</Text>
            <Text style={styles.resourceValue}>120</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🪨</Text>
            <Text style={styles.resourceValue}>85</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>👥</Text>
            <Text style={styles.resourceValue}>12/50</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🛡️</Text>
            <Text style={styles.resourceValue}>LOW</Text>
          </View>
        </View>

        {/* --- SEKCJA: ŚWIĄTYNIA WIEDZY --- */}
        <View style={styles.areaSection}>
          <Text style={styles.areaTitle}>📜 ŚWIĄTYNIA WIEDZY</Text>
          <View style={styles.npcCard}>
            <View style={styles.npcAvatarBg}>
              <Text style={styles.npcEmoji}>🧙‍♂️</Text>
            </View>
            <View style={styles.npcInfo}>
              <Text style={styles.npcName}>STARY MĘDRZEC</Text>
              <Text style={styles.npcDialog}>
                "Mapy starego świata skrywają skarby, o których inni zapomnieli..."
              </Text>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleDiscover}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionButtonText}>SZUKAJ WIEDZY</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- SEKCJA: KOSZARY --- */}
        <View style={styles.areaSection}>
          <Text style={styles.areaTitle}>⚔️ KOSZARY WOJENNE</Text>
          <View style={styles.npcCard}>
            <View style={[styles.npcAvatarBg, { borderColor: '#e74c3c' }]}>
              <Text style={styles.npcEmoji}>🛡️</Text>
            </View>
            <View style={styles.npcInfo}>
              <Text style={styles.npcName}>KAPITAN STRAŻY</Text>
              <Text style={styles.npcDialog}>
                "Moi ludzie trenują dzień i noc. Wkrótce będziemy gotowi, by uderzyć na sąsiednie osady!"
              </Text>
              <TouchableOpacity style={[styles.actionButton, styles.disabledButton]} disabled={true}>
                <Text style={styles.actionButtonText}>NAJAZD (WKRÓTCE)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- SEKCJA: WARSZTAT --- */}
        <View style={styles.areaSection}>
          <Text style={styles.areaTitle}>🔨 WARSZTAT BUDOWNICZEGO</Text>
          <View style={styles.npcCard}>
            <View style={[styles.npcAvatarBg, { borderColor: '#3498db' }]}>
              <Text style={styles.npcEmoji}>👷</Text>
            </View>
            <View style={styles.npcInfo}>
              <Text style={styles.npcName}>MISTRZ BUDOWNICZY</Text>
              <Text style={styles.npcDialog}>
                "Potrzebujemy więcej drewna i kamienia, jeśli chcesz wzmocnić mury tej osady."
              </Text>
              <TouchableOpacity style={[styles.actionButton, styles.disabledButton]} disabled={true}>
                <Text style={styles.actionButtonText}>ROZBUDUJ (WKRÓTCE)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#161b22',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    tintColor: '#ebd59b',
  },
  title: {
    color: '#ebd59b',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#8a94a6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  resourcesBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1c2128',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  resourceItem: {
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  resourceValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  areaSection: {
    marginBottom: 25,
  },
  areaTitle: {
    color: '#8a94a6',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1,
  },
  npcCard: {
    backgroundColor: '#1d2631',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  npcAvatarBg: {
    width: 70,
    height: 70,
    backgroundColor: '#2a3642',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#a38450',
    marginRight: 15,
  },
  npcEmoji: {
    fontSize: 35,
  },
  npcInfo: {
    flex: 1,
  },
  npcName: {
    color: '#ebd59b',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  npcDialog: {
    color: '#c9d1d9',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#238636',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 35,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#21262d',
    borderColor: '#30363d',
    borderWidth: 1,
  },
});
