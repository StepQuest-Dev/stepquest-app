import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import { styles } from '../styles/tabs/Fight';

export default function FightScreen() {
  const router = useRouter();
  const { enemyId } = useLocalSearchParams();

  const [combatState, setCombatState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dodatkowe stany na dane wizualne postaci
  const [playerData, setPlayerData] = useState({ name: 'Ty', avatarUrl: null as string | null });
  const [enemyAvatar, setEnemyAvatar] = useState<string | null>(null);

  useEffect(() => {
    const startCombat = async () => {
      try {
        console.log(`⚔️ Inicjalizacja walki z potworem o ID: ${enemyId}`);

        // 1. Uderzamy do API po walkę ORAZ dodatkowe dane wizualne (postaci i wrogów) w jednym momencie
        const payload = { enemyId: enemyId };
        
        const [combatRes, charRes, userRes, enemiesRes] = await Promise.all([
          api.post('/combat/start', payload),
          api.get('/character').catch(() => null),
          api.get('/auth/me').catch(() => null),
          api.get('/enemies').catch(() => null)
        ]);
        
        // Wyciąganie imienia i awatara gracza
        let pName = 'Ty';
        let pAvatar = null;
        
        if (charRes?.data) {
          const char = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
          if (char?.name) pName = char.name;
        }
        if (!pAvatar && userRes?.data?.avatarUrl) {
          pAvatar = userRes.data.avatarUrl;
        }
        
        setPlayerData({ name: pName, avatarUrl: pAvatar });

        // Wyciąganie awatara przeciwnika (szukamy go po ID na liście potworów)
        if (enemiesRes?.data) {
          const enemiesList = Array.isArray(enemiesRes.data) ? enemiesRes.data : (enemiesRes.data.data || []);
          const currentEnemy = enemiesList.find((e: any) => e.id === enemyId || e._id === enemyId);
          if (currentEnemy?.imageUrl) {
            setEnemyAvatar(currentEnemy.imageUrl);
          }
        }

        console.log('✅ Walka wystartowała:', combatRes.data);
        setCombatState(combatRes.data);

      } catch (error: any) {
        console.error('❌ BŁĄD STARTU WALKI!');
        let errorMsg = 'Nieznany błąd serwera.';

        if (error.response) {
          if (Array.isArray(error.response.data.message)) {
            const constraints = error.response.data.message[0].constraints;
            errorMsg = constraints ? Object.values(constraints).join(', ') : 'Błąd walidacji serwera';
          } else {
            errorMsg = error.response.data.message || 'Błąd serwera walki';
          }
        } else {
          errorMsg = error.message;
        }

        Alert.alert('Błąd Walki', errorMsg, [
          { text: 'Powrót', onPress: () => router.replace('/(tabs)/dungeon') }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    startCombat();
  }, [enemyId]);

  const performAction = async (actionType: string) => {
    try {
      setLoading(true);
      const res = await api.post('/combat/action', {
        sessionId: combatState.sessionId,
        action: actionType
      });
      
      console.log('⚔️ Wynik akcji z serwera:', res.data);

      // 1. OBSŁUGA ZAKOŃCZENIA WALKI
      if (res.data.result === 'Victory!') {
         Alert.alert(
           '🏆 Zwycięstwo!', 
           `Pokonujesz wroga!\n\nZdobywasz:\n⭐ ${res.data.rewards?.exp || 0} EXP\n💰 ${res.data.rewards?.gold || 0} Złota`, 
           [{ text: 'Chwała Ci', onPress: () => router.replace('/(tabs)/dungeon') }]
         );
         return; 
      } 
      
      if (res.data.playerHp <= 0 || res.data.result === 'Defeat' || res.data.result === 'Defeat!') {
         Alert.alert('💀 Porażka...', 'Zostałeś zdeptany przez wroga.', [
           { text: 'Uciekaj', onPress: () => router.replace('/(tabs)/dungeon') }
         ]);
         return;
      }

      if (res.data.result === 'Escaped' || res.data.status === 'FLED' || res.data.result === 'Fled!') {
         Alert.alert('🏃 Ucieczka', 'Udało Ci się bezpiecznie wycofać z walki!', [
           { text: 'Uff...', onPress: () => router.replace('/(tabs)/dungeon') }
         ]);
         return;
      }

      // 2. OBSŁUGA ZDARZEŃ W TRAKCIE TURY
      const turnLog = res.data.turnLog || [];
      const fleeFailed = turnLog.some((log: any) => log.action === 'FLEE_FAILED');

      if (fleeFailed) {
        Alert.alert('Zablokowany!', 'Nie udało Ci się uciec! Przeciwnik korzysta z okazji i atakuje.');
      }

      if (res.data.status !== undefined && !res.data.result) {
        setCombatState(res.data);
      }

    } catch (error: any) {
      console.error('Błąd akcji:', error.response?.data || error.message);
      Alert.alert('Błąd', 'Twój ruch chybił z powodu błędu serwera!');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !combatState) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.text}>Dobywasz miecza...</Text>
      </View>
    );
  }

  // Definiowanie źródeł obrazków z bezpiecznym fallbackiem
  const playerImageSource = playerData.avatarUrl 
    ? { uri: playerData.avatarUrl } 
    : require('@/assets/images/user-icon.png');
    
  const enemyImageSource = enemyAvatar 
    ? { uri: enemyAvatar } 
    : require('@/assets/images/user-icon.png');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ WALKA ⚔️</Text>
      <Text style={styles.turn}>Tura: {combatState?.turn || '?'}</Text>

      <View style={styles.statsContainer}>
        {/* GRACZ */}
        <View style={styles.statBox}>
          <Image source={playerImageSource} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.statName} numberOfLines={1}>{playerData.name}</Text>
          <View style={styles.hpContainer}>
            <Text style={styles.hpText}>❤️ {combatState?.playerHp ?? '?'} HP</Text>
          </View>
        </View>

        <Text style={styles.vs}>VS</Text>

        {/* PRZECIWNIK */}
        <View style={styles.statBox}>
          <Image source={enemyImageSource} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.statName} numberOfLines={1}>{combatState?.enemyName || 'Wróg'}</Text>
          <View style={styles.hpContainer}>
            <Text style={styles.hpText}>❤️ {combatState?.enemyHp ?? '?'} HP</Text>
          </View>
        </View>
      </View>

      <Text style={styles.actionTitle}>WYBIERZ AKCJĘ:</Text>
      <View style={styles.actionsContainer}>
        {combatState?.availableActions?.map((action: string) => (
          <TouchableOpacity
            key={action}
            style={action === 'FLEE' ? styles.fleeButton : styles.actionButton}
            onPress={() => performAction(action)}
            disabled={loading}
          >
            <Text style={styles.actionText}>
              {action === 'ATTACK' ? '⚔️ ATAKUJ' : action === 'FLEE' ? '🏃 UCIEKAJ' : action === 'USE_ITEM' ? '🧪 UŻYJ' : action}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && combatState && <ActivityIndicator size="small" color="#ebd59b" style={{ marginTop: 20 }} />}
    </View>
  );
}