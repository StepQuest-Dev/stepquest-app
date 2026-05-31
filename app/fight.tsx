import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../components/CustomAlerts';
import api from '../services/api';
import { styles } from '../styles/tabs/Fight';

export default function FightScreen() {
  const router = useRouter();
  const { enemyId } = useLocalSearchParams();

  const [combatState, setCombatState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    isSuccess: true,
    onConfirm: undefined as (() => void) | undefined
  });

  const [playerData, setPlayerData] = useState({ name: 'Ty', avatarUrl: null as string | null });
  const [enemyAvatar, setEnemyAvatar] = useState<string | null>(null);

  // --- FUNKCJA DEV: WYMUSZONE ZAKOŃCZENIE ---
  const handleDevForceStop = () => {
    // Możesz tu opcjonalnie dodać api.post('/combat/surrender'...) jeśli backend wspiera
    console.warn("⚔️ [DEV] Wymuszone zakończenie walki przez dewelopera.");
    router.replace('/(tabs)/dungeon');
  };

  useEffect(() => {
    const startCombat = async () => {
      try {
        const payload = { enemyId: enemyId };
        const [combatRes, charRes, userRes, enemiesRes] = await Promise.all([
          api.post('/combat/start', payload),
          api.get('/character').catch(() => null),
          api.get('/auth/me').catch(() => null),
          api.get('/enemies').catch(() => null)
        ]);

        let pName = 'Ty';
        let pAvatar = null;
        if (charRes?.data) {
          const char = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
          if (char?.name) pName = char.name;
        }
        if (!pAvatar && userRes?.data?.avatarUrl) pAvatar = userRes.data.avatarUrl;

        setPlayerData({ name: pName, avatarUrl: pAvatar });

        if (enemiesRes?.data) {
          const enemiesList = Array.isArray(enemiesRes.data) ? enemiesRes.data : (enemiesRes.data.data || []);
          const currentEnemy = enemiesList.find((e: any) => e.id === enemyId || e._id === enemyId);
          if (currentEnemy?.imageUrl) setEnemyAvatar(currentEnemy.imageUrl);
        }

        setCombatState(combatRes.data);
      } catch (error: any) {
        setAlertConfig({
          title: 'Błąd Walki',
          message: error.response?.data?.message || error.message || 'Nieznany błąd.',
          isSuccess: false,
          onConfirm: () => { setAlertVisible(false); router.replace('/(tabs)/dungeon'); }
        });
        setAlertVisible(true);
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

      if (res.data.playerHp <= 0 || res.data.result === 'Defeat' || res.data.result === 'Defeat!') {
        setAlertConfig({
          title: '💀 Porażka...',
          message: 'Zostałeś zdeptany przez wroga.',
          isSuccess: false,
          onConfirm: () => { setAlertVisible(false); router.replace('/(tabs)/dungeon'); }
        });
        setAlertVisible(true);
        return;
      }

      if (res.data.result === 'Victory!') {
        setAlertConfig({
          title: '🏆 Zwycięstwo!',
          message: `Pokonujesz wroga!\n\nZdobywasz:\n⭐ ${res.data.rewards?.exp || 0} EXP\n💰 ${res.data.rewards?.gold || 0} Złota`,
          isSuccess: true,
          onConfirm: () => { setAlertVisible(false); router.replace('/(tabs)/dungeon'); }
        });
        setAlertVisible(true);
        return;
      }

      if (res.data.result === 'Escaped' || res.data.status === 'FLED' || res.data.result === 'Fled!') {
        setAlertConfig({
          title: '🏃 Ucieczka',
          message: 'Udało Ci się bezpiecznie wycofać z walki!',
          isSuccess: true,
          onConfirm: () => { setAlertVisible(false); router.replace('/(tabs)/dungeon'); }
        });
        setAlertVisible(true);
        return;
      }

      const turnLog = res.data.turnLog || [];
      const fleeFailed = turnLog.some((log: any) => log.action === 'FLEE_FAILED');

      if (fleeFailed) {
        setAlertConfig({
          title: 'Zablokowany!',
          message: 'Nie udało Ci się uciec! Przeciwnik atakuje.',
          isSuccess: false,
          onConfirm: undefined
        });
        setAlertVisible(true);
      }

      if (res.data.status !== undefined && !res.data.result) {
        setCombatState(res.data);
      }

    } catch (error: any) {
      setAlertConfig({
        title: 'Błąd',
        message: 'Twój ruch chybił z powodu błędu serwera!',
        isSuccess: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
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

  const playerImageSource = playerData.avatarUrl ? { uri: playerData.avatarUrl } : require('@/assets/images/user-icon.png');
  const enemyImageSource = enemyAvatar ? { uri: enemyAvatar } : require('@/assets/images/skelet-icon.png');

  return (
    <View style={styles.container}>
      {/* PRZYCISK DEV */}
      <TouchableOpacity
        onPress={handleDevForceStop}
        style={{ position: 'absolute', top: 40, right: 10, backgroundColor: 'rgba(231, 76, 60, 0.4)', padding: 6, borderRadius: 5, zIndex: 999 }}
      >
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>DEV: STOP</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertVisible(false)}
        showCancel={false}
      />

      <Text style={styles.title}>⚔️ WALKA ⚔️</Text>
      <Text style={styles.turn}>Tura: {combatState?.turn || '?'}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Image source={playerImageSource} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.statName} numberOfLines={1}>{playerData.name}</Text>
          <View style={styles.hpContainer}>
            <Text style={styles.hpText}>❤️ {combatState?.playerHp ?? '?'} HP</Text>
          </View>
        </View>

        <Text style={styles.vs}>VS</Text>

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
    </View>
  );
}