import React from 'react';
import { Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useStepSync } from '../hooks/useStepSync';

export default function StepCounter() {
  const { steps, isSyncing, error, fullSync } = useStepSync();

  const handleRefresh = async () => {
    try {
      await fullSync();
    } catch (e) {
      // Błąd jest już obsługiwany przez hook
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{isSyncing ? 'Synchronizacja...' : 'Aktywny'}</Text>

      <Text style={styles.label}>Kroki dzisiaj:</Text>
      {isSyncing ? (
        <ActivityIndicator color="#ebd59b" size="large" style={{ marginVertical: 10 }} />
      ) : (
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button 
        title={isSyncing ? "Synchronizuję..." : "Odśwież i Synchronizuj"} 
        onPress={handleRefresh} 
        disabled={isSyncing} 
      />

      <Text style={styles.note}>
        Kroki są pobierane z czujnika urządzenia od północy i przesyłane do chmury.
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
