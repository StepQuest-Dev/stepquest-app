import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { styles } from '../../styles/tabs/developerPanel';
import CustomAlert from '../../components/CustomAlerts';

export default function DeveloperPanel() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Konsola admina gotowa do pracy.']);
  
  // Stany dla CustomAlert - dodano onConfirm: undefined, aby zgadzało się z typami
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    title: '', 
    message: '', 
    isSuccess: false,
    onConfirm: undefined as (() => void) | undefined 
  });

  const addLocalLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev]);
  };

  const handleAddMockSteps = async (amount: number) => {
    setSyncing(true);
    addLocalLog(`Inicjalizacja wysyłki makiety: +${amount} kroków...`);

    try {
      const res = await api.get('/steps/latest').catch(() => ({ data: { steps: 0 } }));
      const currentSteps = res.data.steps || res.data.count || 0;
      const updatedSteps = currentSteps + amount;
      
      await api.post('/steps', { count: updatedSteps });
      
      addLocalLog(`✅ Sukces! Baza zsynchronizowana na: ${updatedSteps}`);
      setAlertConfig({ 
          title: '👟 SUKCES', 
          message: `Dodano ${amount} kroków.`, 
          isSuccess: true, 
          onConfirm: undefined 
      });
      setAlertVisible(true);
    } catch (err: any) {
      addLocalLog(`❌ Błąd: ${err.message}`);
      setAlertConfig({ 
          title: '⚠️ BŁĄD SIECI', 
          message: err.message, 
          isSuccess: false, 
          onConfirm: undefined 
      });
      setAlertVisible(true);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncCharacter = async () => {
    setSyncing(true);
    const targetUrl = '/character'; // SPRAWDŹ TEN ADRES W BACKENDZIE!
    addLocalLog(`Wysyłam zapytanie do: ${targetUrl}`);

    try {
      // Spróbuj GET, jeśli nie zadziała, sprawdź w backendzie czy nie trzeba POST
      await api.get(targetUrl); 
      
      addLocalLog("✅ Profil postaci pobrany pomyślnie.");
      setAlertConfig({
        title: '👤 SYNCHRONIZACJA',
        message: 'Dane postaci zostały odświeżone.',
        isSuccess: true,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } catch (err: any) {
      const errorMsg = err.response ? `Kod: ${err.response.status}` : err.message;
      addLocalLog(`❌ Błąd sync postaci: ${errorMsg}`);
      setAlertConfig({
        title: '⚠️ BŁĄD SYNC (404?)',
        message: `Endpoint ${targetUrl} zwrócił błąd: ${errorMsg}. Sprawdź kontroler w backendzie.`,
        isSuccess: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertVisible(false)}
        showCancel={false}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/profile')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>NARZĘDZIA DEWELOPERSKIE</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌐 STATUS POŁĄCZENIA</Text>
        <Text style={styles.infoText}>Target BaseURL: <Text style={styles.highlight}>{api.defaults.baseURL}</Text></Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👟 EMULATOR AKTYWNOŚCI</Text>
          {syncing && <ActivityIndicator size="small" color="#ebd59b" />}
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.mockButton} onPress={() => handleAddMockSteps(1000)} disabled={syncing}>
            <Text style={styles.buttonText}>+1 000 KROKÓW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mockButton, styles.mockButtonEpic]} onPress={() => handleAddMockSteps(5000)} disabled={syncing}>
            <Text style={styles.buttonText}>+5 000 KROKÓW</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 PROFIL POSTACI</Text>
        <TouchableOpacity style={[styles.mockButton, { backgroundColor: '#2a3642' }]} onPress={handleSyncCharacter} disabled={syncing}>
          <Text style={styles.buttonText}>ODŚWIEŻ DANE POSTACI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleContainer}>
        <Text style={styles.consoleTitle}>📋 MONITOR OPERACJI</Text>
        <ScrollView style={styles.consoleScroll} contentContainerStyle={{ paddingBottom: 10 }}>
          {logs.map((log, i) => (
            <Text key={i} style={styles.consoleText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}