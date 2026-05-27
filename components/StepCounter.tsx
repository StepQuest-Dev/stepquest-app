import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function StepCounter() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
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
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isMounted) return;

        setAvailable(isAvailable);
        if (!isAvailable) {
          setError('Pedometer nie jest dostępny na tym urządzeniu.');
          return;
        }

        setError(null);
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const stepCountResult = await Pedometer.getStepCountAsync(startOfDay, now);
        if (!isMounted) return;
        setSteps(stepCountResult.steps);
        setIsTracking(true);

        subscription = Pedometer.watchStepCount((result) => {
          if (isMounted) {
            setSteps(result.steps ?? stepCountResult.steps);
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
    if (Platform.OS === 'web') {
      setError('Pedometer nie jest obsługiwany w przeglądarce.');
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

  const statusText = available === null ? 'Sprawdzanie dostępności...' : available ? 'Pedometer dostępny' : 'Pedometer niedostępny';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status czujnika:</Text>
      <Text style={styles.value}>{statusText}</Text>

      <Text style={styles.label}>Kroki dzisiaj:</Text>
      <Text style={styles.steps}>{steps !== null ? steps : '—'}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Odśwież kroków" onPress={handleRefresh} disabled={!available} />

      <Text style={styles.note}>
        Na Androidzie i iOS komponent używa czujnika kroków z Expo Pedometer.
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
