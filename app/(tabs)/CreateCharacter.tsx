import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../components/CustomAlerts';
import api from '../../services/api';
import { charStyles as styles } from '../../styles/tabs/CharacterScreens';

// Mapa nazw klas na obrazki
const CLASS_ICONS: Record<string, any> = {
  'WOJOWNIK': require('@/assets/images/warrior-icon.png'),
  'CZARNOKSIĘŻNIK': require('@/assets/images/mag-icon.png'),
  'MNICH': require('@/assets/images/mnich-icon.png'),
  'TEMPLARIUSZ': require('@/assets/images/templar-icon.png'),
  'ZWIADOWCA': require('@/assets/images/loczek-icon.png'),
};

const DEFAULT_ICON = require('@/assets/images/user-icon.png');

function getClassIcon(className: string) {
  if (!className) return DEFAULT_ICON;
  const key = className.toUpperCase().trim();
  return CLASS_ICONS[key] ?? DEFAULT_ICON;
}

export default function CreateCharacter() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [charName, setCharName] = useState('');
  const [loading, setLoading] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: false });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('📡 Pobieram klasy postaci z backendu (/classes)...');
        const res = await api.get('/classes');
        console.log('✅ Sukces! Odpowiedź serwera:', res.data);
        const classesArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setClasses(classesArray);
      } catch (err: any) {
        console.error('❌ Błąd pobierania klas:');
        console.error('Status:', err.response?.status);
        console.error('Wiadomość:', err.response?.data?.message || err.message);
        setAlertConfig({
          title: 'BŁĄD SIECI',
          message: 'Nie udało się połączyć z bazą klas. Sprawdź serwer.',
          isSuccess: false
        });
        setAlertVisible(true);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleCreate = async () => {
    if (!charName.trim() || !selectedClassId) {
      setAlertConfig({ title: 'Uwaga', message: 'Podaj imię i wybierz klasę!', isSuccess: false });
      setAlertVisible(true);
      return;
    }
    try {
      setLoading(true);
      await api.post('/character', { name: charName, classId: selectedClassId });
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      setAlertConfig({ title: 'Błąd', message: err.response?.data?.message || 'Nie udało się stworzyć postaci.', isSuccess: false });
      setAlertVisible(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ebd59b" />
        <Text style={{ color: '#ebd59b', marginTop: 10, fontFamily: 'PixelifySans' }}>Wczytywanie starożytnych pism...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} isSuccess={alertConfig.isSuccess} onClose={() => setAlertVisible(false)} showCancel={false} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profile')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>NOWA POSTAĆ</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.inputTitle}>IMIĘ BOHATERA</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz imię..."
          placeholderTextColor="#8a94a6"
          value={charName}
          onChangeText={setCharName}
        />

        <Text style={styles.inputTitle}>WYBIERZ KLASĘ</Text>

        {classes.length === 0 ? (
          <View style={{ backgroundColor: '#1d2631', padding: 20, borderRadius: 8, borderColor: '#e74c3c', borderWidth: 1 }}>
            <Text style={{ color: '#e74c3c', textAlign: 'center', fontFamily: 'determination' }}>
              Brak klas w bazie danych! Upewnij się, że poprawnie wykonałeś seeding (npx ts-node prisma/seed.ts).
            </Text>
          </View>
        ) : (
          classes.map((cls) => {
            const isSelected = selectedClassId === cls.id;
            return (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, isSelected && styles.classCardSelected]}
                activeOpacity={0.7}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Image source={getClassIcon(cls.name)} style={styles.classIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.classTitle}>{cls.name.toUpperCase()}</Text>
                  <Text style={styles.classDesc} numberOfLines={2}>{cls.description}</Text>
                  <View style={styles.statsRow}>
                    <Text style={[styles.statText, { color: '#e74c3c' }]}>❤️ {cls.baseHp || cls.hp || 0}</Text>
                    <Text style={[styles.statText, { color: '#ebd59b' }]}>⚔️ {cls.baseAttack || cls.attack || 0}</Text>
                    <Text style={[styles.statText, { color: '#3498db' }]}>🛡️ {cls.baseDefense || cls.defense || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          style={[styles.submitBtn, classes.length === 0 && { opacity: 0.5 }]}
          onPress={handleCreate}
          disabled={loading || classes.length === 0}
        >
          {loading ? <ActivityIndicator color="#12181f" /> : <Text style={styles.submitBtnText}>WYRUSZ W DROGĘ</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}