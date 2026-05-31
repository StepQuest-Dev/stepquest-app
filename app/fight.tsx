import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import { styles } from '../styles/tabs/Fight'; // Zakładam taką ścieżkę do nowego pliku ze stylami

export default function FightScreen() {
  const router = useRouter();
  const { enemyId } = useLocalSearchParams(); // Odbieramy ID z ekranu lochów

  const [combatState, setCombatState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Inicjalizacja walki
  useEffect(() => {
    const startCombat = async () => {
      try {
        // Tymczasowe, testowe UUID postaci Gracza (aby uniknąć błędu 400 z walidacji)
        // DOCELOWO: zapytaj backend, czy pobiera to z tokena JWT, czy musisz to zapisać w AsyncStorage podczas logowania
        const payload = {
          enemyId: enemyId,
          characterId: '99999999-9999-9999-9999-999999999999' 
        };

        const res = await api.post('/combat/start', payload);
        setCombatState(res.data);
      } catch (error) {
        Alert.alert('Błąd', 'Nie udało się nawiązać połączenia z serwerem walki.');
        router.replace('/(tabs)/dungeon'); // Bezpieczny powrót
      } finally {
        setLoading(false);
      }
    };
    startCombat();
  }, [enemyId]);

  // 2. Wykonywanie akcji (ATTACK, FLEE, USE_ITEM)
  const performAction = async (actionType: string) => {
    try {
      setLoading(true);
      const res = await api.post('/combat/action', {
        sessionId: combatState.sessionId,
        action: actionType
      });
      
      setCombatState(res.data);

      // Prosta logika kończąca walkę:
      if (res.data.enemyHp <= 0) {
         Alert.alert('🏆 Zwycięstwo!', `Pokonałeś: ${res.data.enemyName}`, [
           { text: 'Chwała Ci', onPress: () => router.replace('/(tabs)/dungeon') }
         ]);
      } else if (res.data.playerHp <= 0) {
         Alert.alert('💀 Porażka...', 'Zostałeś zdeptany przez wroga.', [
           { text: 'Uciekaj', onPress: () => router.replace('/(tabs)/dungeon') }
         ]);
      }
    } catch (error) {
      Alert.alert('Błąd', 'Twój atak chybił z powodu błędu serwera!');
    } finally {
      setLoading(false);
    }
  };

  // Zabezpieczenie przed brakiem danych w trakcie ładowania
  if (loading && !combatState) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.text}>Dobywasz miecza...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ WALKA ⚔️</Text>
      <Text style={styles.turn}>Tura: {combatState?.turn}</Text>

      <View style={styles.statsContainer}>
        {/* Gracz */}
        <View style={styles.statBox}>
          <Text style={styles.statName}>Ty</Text>
          <Text style={styles.hpText}>❤️ {combatState?.playerHp} HP</Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        {/* Przeciwnik */}
        <View style={styles.statBox}>
          <Text style={styles.statName}>{combatState?.enemyName}</Text>
          <Text style={styles.hpText}>❤️ {combatState?.enemyHp} HP</Text>
        </View>
      </View>

      <Text style={styles.actionTitle}>WYBIERZ AKCJĘ:</Text>
      <View style={styles.actionsContainer}>
        {/* Dynamiczne mapowanie akcji z JSON-a od backendu */}
        {combatState?.availableActions?.map((action: string) => (
          <TouchableOpacity
            key={action}
            style={action === 'FLEE' ? styles.fleeButton : styles.actionButton}
            onPress={() => performAction(action)}
            disabled={loading}
          >
            <Text style={styles.actionText}>
              {action === 'ATTACK' ? '⚔️ ATAKUJ' : action === 'FLEE' ? '🏃 UCIEKAJ' : action}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && combatState && <ActivityIndicator size="small" color="#ebd59b" style={{ marginTop: 20 }} />}
    </View>
  );
}