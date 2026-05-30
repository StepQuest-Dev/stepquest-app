import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Text, View } from '@/components/Themed';

// POPRAWKA 1: Import uprawnień dla systemu Android
import { 
  requestActivityPermissions, 
  getActivityPermissionStatus 
} from 'expo-android-pedometer';

export default function StepCounter() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState<number>(0); // Zmieniamy stan początkowy na 0
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let isMounted = true;

    async function startPedometer() {
      if (Platform.OS === 'web') {
        setAvailable(false);
        setError('Pedometer nie jest obsługiwany w przeglądarce.');
        return;
      }

      try {
        // POPRAWKA 2: Prośba o uprawnienia ruchowe na Androidzie
        if (Platform.OS === 'android') {
          const currentStatus = await getActivityPermissionStatus();
          
          if (currentStatus.status !== 'granted') {
            console.log('🤠 StepQuest: Prośba o uprawnienia Activity Recognition...');
            const requestStatus = await requestActivityPermissions();
            
            if (requestStatus.status !== 'granted') {
              if (isMounted) {
                setAvailable(false);
                setError('Brak uprawnień do aktywności fizycznej w systemie Android.');
              }
              return;
            }
          }
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMounted) return;

        setAvailable(isAvailable);
        if (!isAvailable) {
          setError('Pedometer nie jest dostępny na tym urządzeniu.');
          return;
        }

        setError(null);

        // POPRAWKA 3: getStepCountAsync uruchamiamy WYLKO na iOS
        if (Platform.OS === 'ios') {
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);

          const stepCountResult = await Pedometer.getStepCountAsync(startOfDay, now);
          if (isMounted) {
            setSteps(stepCountResult.steps);
          }
        }

        setIsTracking(true);

        // POPRAWKA 4: Bezpieczny nasłuch kroków w czasie rzeczywistym
        subscription = Pedometer.watchStepCount((result) => {
          if (isMounted) {
            if (Platform.OS === 'ios') {
              setSteps(result.steps);
            } else {
              // Na Androidzie result.steps zwraca kroki zrobione od momentu uruchomienia watchStepCount
              setSteps((prevSteps) => prevSteps + (result.steps ?? 0));
            }
          }
        });
      } catch (e) {
        if (!isMounted) return;
        setAvailable(false);
        setError(
          e instanceof Error
            ? e.message
            : 'Wystąpił błąd podczas odczytu kroków.'
        );
      }
    }

    startPedometer();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleRefresh = async () => {
    // POPRAWKA 5: Wyłączamy historyczne odświeżanie na Androidzie, bo rzuci wyjątek
    if (Platform.OS === 'web' || Platform.OS === 'android') {
      return; 
    }

    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const result = await Pedometer.getStepCountAsync(startOfDay, now);
      setSteps(result.steps);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Błąd odświeżania krokomierza.'
      );
    }
  };

  const statusText = available === null 
    ? 'Sprawdzanie dostępności...' 
    : available 
      ? 'Pedometer aktywny' 
      : 'Pedometer niedostępny';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status czujnika:</Text>
      <Text style={styles.value}>{statusText}</Text>

      <Text style={styles.label}>Kroki dzisiaj:</Text>
      <Text style={styles.steps}>{steps !== null ? steps.toLocaleString() : '0'}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Ukrywamy przycisk odświeżania na Androidzie, bo tam kroki naliczają się wyłącznie na żywo */}
      {Platform.OS === 'ios' && (
        <Button title="Odśwież kroków" onPress={handleRefresh} disabled={!available} />
      )}

      <Text style={styles.note}>
        Na Androidzie kroki są zliczane automatycznie w czasie rzeczywistym od momentu uruchomienia gry.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  steps: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12,
  },
  error: {
    color: '#ff6666',
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});