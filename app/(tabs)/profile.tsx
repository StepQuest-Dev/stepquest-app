import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../components/CustomAlerts';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Profile';

// --- INTERFEJSY ---
interface Character { id: string; name: string; level: number; exp: number; gold: number; hp: number; maxHp: number; attack: number; defense: number; }
interface BattleHistory { id: string; status: 'WON' | 'LOST'; createdAt: string; enemy: { name: string; level: number; }; }
interface CombatStats { won: number; lost: number; total: number; }
interface UserProfile { username: string; email: string; avatarUrl: string | null; }

export default function PlayerProfile() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [history, setHistory] = useState<BattleHistory[]>([]);
  const [combatStats, setCombatStats] = useState<CombatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [avatarClicks, setAvatarClicks] = useState(0);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: true, onConfirm: undefined as (() => void) | undefined });

  const handleAvatarPress = () => {
    const nextClicks = avatarClicks + 1;
    setAvatarClicks(nextClicks);
    if (nextClicks >= 5) {
      setAvatarClicks(0);
      setAlertConfig({
        title: '🛠️ PANEL PROGRAMISTY',
        message: 'Uzyskano dostęp do narzędzi administracyjnych.',
        isSuccess: true,
        onConfirm: () => { setAlertVisible(false); router.push('/(tabs)/developerPanel'); }
      });
      setAlertVisible(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async () => {
        try {
          const [userRes, charRes, histRes] = await Promise.all([
            api.get('/auth/me').catch(() => null),
            api.get('/character').catch(() => null),
            api.get('/combat/history').catch(() => null)
          ]);

          if (userRes?.data) {
            setProfile({
              username: userRes.data.username || 'Nieznany Wojownik',
              email: userRes.data.email || 'brak@email.com',
              avatarUrl: userRes.data.avatarUrl || null,
            });
          }
          if (charRes?.data && (Array.isArray(charRes.data) ? charRes.data.length > 0 : Object.keys(charRes.data).length > 0)) {
            const charData = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
            setCharacter(charData);
          } else {
            setCharacter(null);
          }
          if (histRes?.data) {
            setCombatStats(histRes.data.stats);
            setHistory(histRes.data.battles || []);
          }
        } catch (error) {
          console.error('❌ Błąd pobierania profilu:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
      setAlertVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Błąd wylogowania');
    }
  };

  const confirmLogout = () => {
    setAlertConfig({
      title: 'Wylogowanie',
      message: 'Czy na pewno chcesz opuścić grę?',
      isSuccess: false,
      onConfirm: handleLogout
    });
    setAlertVisible(true);
  };

  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ebd59b" />
        <Text style={styles.loadingText}>Ładowanie księgi bohatera...</Text>
      </View>
    );
  }

  const renderBattle = ({ item }: { item: BattleHistory }) => {
    const isWin = item.status === 'WON';
    const date = new Date(item.createdAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return (
      <View style={[styles.characterCard, { borderColor: isWin ? '#a38450' : '#8b0000', marginBottom: 10 }]}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{item.enemy.name} (Lv. {item.enemy.level})</Text>
          <Text style={{ color: '#8a94a6', fontSize: 12 }}>{date}</Text>
        </View>
        <View style={[styles.characterLevelBadge, { backgroundColor: isWin ? '#2a3642' : '#4a1515' }]}>
          <Text style={[styles.characterLevelText, { color: isWin ? '#ebd59b' : '#ff4c4c' }]}>{isWin ? 'ZWYCIĘSTWO' : 'PORAŻKA'}</Text>
        </View>
      </View>
    );
  };

  const displayedHistory = isHistoryExpanded ? history : history.slice(0, 5);
  const avatarSource = profile?.avatarUrl ? { uri: profile.avatarUrl } : require('@/assets/images/user-icon.png');

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} isSuccess={alertConfig.isSuccess} onConfirm={alertConfig.onConfirm} onClose={() => setAlertVisible(false)} showCancel={true} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/dashboard')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>PROFIL</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <FontAwesome5 name="sign-out-alt" size={16} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderBattle}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Brak historii walk. Czas wyruszyć do lochów!</Text>}
        ListHeaderComponent={
          <>
            {profile && (
              <View style={styles.headerCard}>
                <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrapper}>
                  <Image source={avatarSource} style={styles.avatar} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                  <Text style={styles.username} numberOfLines={1}>{profile.username.toUpperCase()}</Text>
                  <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>⛺ TWOJA POSTAĆ</Text>
            {character ? (
              <>
                {/* Karta istniejącej postaci */}
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => router.push('/(tabs)/CharacterScreen')}
                >
                  <View style={[styles.headerCard, { backgroundColor: '#1d2631', flexDirection: 'column', alignItems: 'stretch', marginBottom: 10 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                      <Text style={[styles.username, { color: '#ebd59b' }]}>{character.name.toUpperCase()}</Text>
                      <Text style={[styles.levelText, { color: '#ebd59b', fontWeight: 'bold' }]}>Lv. {character.level}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ color: '#e74c3c', fontFamily: 'determination' }}>❤️ HP: {character.hp} / {character.maxHp}</Text>
                      <Text style={{ color: '#f1c40f', fontFamily: 'determination' }}>💰 Złoto: {character.gold}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#8a94a6', fontFamily: 'determination' }}>⚔️ Atak: {character.attack}</Text>
                      <Text style={{ color: '#8a94a6', fontFamily: 'determination' }}>🛡️ Obrona: {character.defense}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Opcjonalny przycisk stworzenia KOLEJNEJ postaci (jeśli backend na to pozwala) */}
                <TouchableOpacity 
                  style={{ backgroundColor: '#2a3642', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ebd59b', alignItems: 'center', marginBottom: 20 }}
                  onPress={() => router.push('/(tabs)/CreateCharacter')}
                >
                  <Text style={{ color: '#ebd59b', fontWeight: 'bold', fontSize: 16, fontFamily: 'determination' }}>➕ STWÓRZ NOWĄ POSTAĆ</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Przycisk tworzenia postaci, jeśli gracz nie posiada żadnej
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Text style={styles.emptyText}>Nie posiadasz jeszcze wojownika.</Text>
                <TouchableOpacity 
                  style={{ backgroundColor: '#2a3642', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ebd59b', marginTop: 10, width: '100%', alignItems: 'center' }}
                  onPress={() => router.push('/(tabs)/CreateCharacter')}
                >
                  <Text style={{ color: '#ebd59b', fontWeight: 'bold', fontSize: 18, fontFamily: 'determination' }}>⚔️ STWÓRZ POSTAĆ ⚔️</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>📜 HISTORIA WALK</Text>
            {combatStats && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, backgroundColor: '#2a3642', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#a38450' }}>
                <Text style={{ color: '#ebd59b', fontFamily: 'determination' }}>Wszystkie: {combatStats.total}</Text>
                <Text style={{ color: '#2ecc71', fontFamily: 'determination' }}>Wygrane: {combatStats.won}</Text>
                <Text style={{ color: '#e74c3c', fontFamily: 'determination' }}>Przegrane: {combatStats.lost}</Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          history.length > 5 ? (
            <TouchableOpacity 
              style={{ backgroundColor: '#1d2631', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#a38450', alignItems: 'center', marginTop: 10, marginBottom: 20 }} 
              onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
              <Text style={{ color: '#ebd59b', fontWeight: 'bold', fontSize: 16 }}>
                {isHistoryExpanded ? 'Zwiń historię ⬆️' : 'Pokaż więcej ⬇️'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}