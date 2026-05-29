import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Pedometer } from 'expo-sensors';
import api from '../../services/api';

// 1. Definiujemy DTO (Data Transfer Object)
// Struktura danych, która będzie wysyłana na backend
interface SyncStepsDto {
  steps: number;
  date: string; // np. "2026-05-29"
}

export default function DashboardScreen() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const subscribeToPedometer = async () => {
      // Pytamy o uprawnienia (wymagane na Androidzie i iOS)
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień', 'Aplikacja potrzebuje dostępu do aktywności fizycznej, aby liczyć kroki.');
        return;
      }

      // Sprawdzamy, czy telefon posiada fizyczny krokomierz
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        // Obliczamy ramy czasowe: od dzisiejszej północy do teraz
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        try {
          // Pobieramy historię kroków z dzisiejszego dnia
          const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCountResult) {
            setPastStepCount(pastStepCountResult.steps);
          }
        } catch (error) {
          console.error("Nie można pobrać historii kroków:", error);
        }

        // Nasłuchujemy kroków w czasie rzeczywistym (kiedy apka jest otwarta)
        subscription = Pedometer.watchStepCount(result => {
          setCurrentStepCount(result.steps);
        });
      }
    };

    subscribeToPedometer();

    // Czyszczenie subskrypcji po wyjściu z ekranu
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Łączna liczba kroków (dzisiejsza historia + to, co zrobiliśmy z włączoną apką)
  const totalSteps = pastStepCount + currentStepCount;

  // 2. Funkcja wysyłająca dane na backend
  const syncStepsWithBackend = async () => {
    setIsSyncing(true);

    // Tworzymy paczkę danych zgodnie z naszym DTO
    const payload: SyncStepsDto = {
      steps: totalSteps,
      date: new Date().toISOString().split('T')[0], // Format ISO (wycina tylko YYYY-MM-DD)
    };

    console.log('🚀 Wysyłam DTO na serwer:', payload);

    try {
      // Wysyłamy POST na Twój endpoint w NestJS (zmień ścieżkę, jeśli w NestJS nazywa się inaczej)
      const response = await api.post('/steps/sync', payload);
      
      console.log('✅ Odpowiedź serwera:', response.data);
      Alert.alert('Sukces!', `Zsynchronizowano ${totalSteps} kroków z serwerem!`);
      
    } catch (error: any) {
      console.error('❌ Błąd synchronizacji:', error);
      Alert.alert('Błąd', 'Nie udało się wysłać kroków na serwer.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Twój postęp</Text>
        
        {!isPedometerAvailable ? (
          <Text style={styles.errorText}>Krokomierz nie jest dostępny na tym urządzeniu.</Text>
        ) : (
          <>
            <Text style={styles.stepCountText}>{totalSteps}</Text>
            <Text style={styles.stepLabel}>ZROBIONYCH KROKÓW DZIŚ</Text>
          </>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]} 
        onPress={syncStepsWithBackend}
        disabled={isSyncing || !isPedometerAvailable}
      >
        {isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>SYNCHRONIZUJ Z BAZĄ</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 20,
  },
  stepCountText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#95a5a6',
    marginTop: 10,
    letterSpacing: 1,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
  },
  syncButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});