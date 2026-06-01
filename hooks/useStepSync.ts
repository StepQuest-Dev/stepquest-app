import { Pedometer } from 'expo-sensors';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';

/**
 * Hook do obsługi synchronizacji kroków z urządzenia z serwerem.
 * Pobiera kroki od początku dnia i wysyła je do bazy danych.
 */
export const useStepSync = () => {
  const [steps, setSteps] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pobiera liczbę kroków z czujnika urządzenia od godziny 00:00 dnia dzisiejszego.
   */
  const getStepsFromDevice = useCallback(async (): Promise<number> => {
    if (Platform.OS === 'web') {
      return 0;
    }

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('[useStepSync] Pedometer nie jest dostępny na tym urządzeniu.');
        return 0;
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(startOfDay, now);
      return result.steps || 0;
    } catch (err) {
      console.error('[useStepSync] Błąd podczas pobierania kroków z urządzenia:', err);
      return 0;
    }
  }, []);

  /**
   * Wysyła podaną liczbę kroków na serwer.
   */
  const syncWithServer = useCallback(async (count: number) => {
    const validCount = Math.floor(count);
    if (validCount < 0) return;

    setIsSyncing(true);
    try {
      // Backend oczekuje obiektu { count: number }
      await api.post('/steps', { count: validCount });
      setSteps(validCount);
      setError(null);
      console.log(`[useStepSync] Zsynchronizowano ${validCount} kroków z serwerem.`);
    } catch (err: any) {
      console.error('[useStepSync] Błąd synchronizacji z serwerem:', err);
      setError(err.response?.data?.message || err.message || 'Błąd połączenia');
      throw err; // Rzucamy dalej, aby UI mogło zareagować
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Wykonuje pełny proces: pobiera kroki z urządzenia i od razu wysyła je na serwer.
   */
  const fullSync = useCallback(async () => {
    const deviceSteps = await getStepsFromDevice();
    await syncWithServer(deviceSteps);
    return deviceSteps;
  }, [getStepsFromDevice, syncWithServer]);

  // Przy montowaniu pobieramy ostatni stan z serwera
  useEffect(() => {
    let isMounted = true;

    const fetchLatestFromServer = async () => {
      try {
        const res = await api.get('/steps/latest');
        if (isMounted && res.data) {
          // Obsługa różnych formatów zwracanych przez backend
          const serverSteps = res.data.count ?? res.data.totalSteps ?? res.data.steps ?? 0;
          setSteps(serverSteps);
        }
      } catch (e) {
        console.warn('[useStepSync] Nie udało się pobrać początkowych kroków z serwera.');
      }
    };

    fetchLatestFromServer();
    return () => { isMounted = false; };
  }, []);

  return {
    steps,
    isSyncing,
    error,
    fullSync,
    getStepsFromDevice,
    syncWithServer,
    setSteps,
  };
};
