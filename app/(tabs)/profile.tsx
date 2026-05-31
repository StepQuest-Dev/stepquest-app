import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Profile';

// --- INTERFEJSY ---
interface Character {
  id: string;
  name: string;
  level: number;
  exp: number;
  gold: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

interface BattleHistory {
  id: string;
  status: 'WON' | 'LOST';
  createdAt: string;
  enemy: {
    name: string;
    level: number;
  };
}

interface CombatStats {
  won: number;
  lost: number;
  total: number;
}

interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string | null; // <-- Zmiana na null, żeby łatwiej obsłużyć lokalny plik
}

export default function PlayerProfile() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [history, setHistory] = useState<BattleHistory[]>([]);
  const [combatStats, setCombatStats] = useState<CombatStats | null>(null);
  const [loading, setLoading] = useState(true);

  // STAN DO ZARZĄDZANIA WIDOCZNOŚCIĄ HISTORII WALK
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // LICZNIK KLIKNIĘĆ AWATARA (EASTER EGG)
  const [avatarClicks, setAvatarClicks] = useState(0);

  const handleAvatarPress = () => {
    const nextClicks = avatarClicks + 1;
    setAvatarClicks(nextClicks);

    if (nextClicks >= 5) {
      setAvatarClicks(0);
      if (Platform.OS === 'web') alert('🪄 Tryb deweloperski aktywowany!');
      else Alert.alert('🛠️ Panel Programisty', 'Uzyskano dostęp do narzędzi administracyjnych.');
      router.push('/(tabs)/developerPanel');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log('Pobieranie danych z backendu...');
        
        const [userRes, charRes, histRes] = await Promise.all([
          api.get('/auth/me').catch(() => null),
          api.get('/character').catch(() => null),
          api.get('/combat/history').catch(() => null)
        ]);

        if (userRes?.data) {
          setProfile({
            username: userRes.data.username || 'Nieznany Wojownik',
            email: userRes.data.email || 'brak@email.com',
            avatarUrl: userRes.data.avatarUrl || null, // <-- Usunięty ui-avatars
          });
        }

        if (charRes?.data) {
          const charData = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
          setCharacter(charData);
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
  }, []);

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pomyślnie wylogować.');
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Czy na pewno chcesz się wylogować?')) handleLogout();
    } else {
      Alert.alert('Wylogowanie', 'Czy na pewno chcesz opuścić grę?', [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', style: 'destructive', onPress: handleLogout }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ebd59b" />
        <Text style={styles.loadingText}>Ładowanie księgi bohatera...</Text>
      </View>
    );
  }

  const renderBattle = ({ item }: { item: BattleHistory }) => {
    const isWin = item.status === 'WON';
    const date = new Date(item.createdAt).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.characterCard, { borderColor: isWin ? '#a38450' : '#8b0000', marginBottom: 10 }]}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{item.enemy.name} (Lv. {item.enemy.level})</Text>
          <Text style={{ color: '#8a94a6', fontSize: 12 }}>{date}</Text>
        </View>
        <View style={[styles.characterLevelBadge, { backgroundColor: isWin ? '#2a3642' : '#4a1515' }]}>
          <Text style={[styles.characterLevelText, { color: isWin ? '#ebd59b' : '#ff4c4c' }]}>
            {isWin ? 'ZWYCIĘSTWO' : 'PORAŻKA'}
          </Text>
        </View>
      </View>
    );
  };

  const displayedHistory = isHistoryExpanded ? history : history.slice(0, 5);

  // Zabezpieczenie awatara gracza
  const avatarSource = profile?.avatarUrl 
    ? { uri: profile.avatarUrl } 
    : require('@/assets/images/user-icon.png');

  return (
    <SafeAreaView style={styles.container}>
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
                  {/* Użycie nowej zmiennej avatarSource */}
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
              <View style={[styles.headerCard, { backgroundColor: '#1d2631', flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                  <Text style={[styles.username, { color: '#ebd59b' }]}>{character.name.toUpperCase()}</Text>
                  <Text style={[styles.levelText, { color: '#ebd59b', fontWeight: 'bold' }]}>Lv. {character.level}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>❤️ HP: {character.hp} / {character.maxHp}</Text>
                  <Text style={{ color: '#f1c40f', fontWeight: 'bold' }}>💰 Złoto: {character.gold}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#8a94a6', fontWeight: 'bold' }}>⚔️ Atak: {character.attack}</Text>
                  <Text style={{ color: '#8a94a6', fontWeight: 'bold' }}>🛡️ Obrona: {character.defense}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Nie odnaleziono postaci w systemie.</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>📜 HISTORIA WALK</Text>
            {combatStats && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, backgroundColor: '#2a3642', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#a38450' }}>
                <Text style={{ color: '#ebd59b', fontWeight: 'bold' }}>Wszystkie: {combatStats.total}</Text>
                <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>Wygrane: {combatStats.won}</Text>
                <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>Przegrane: {combatStats.lost}</Text>
              </View>
            )}
          </>
        }
        
        ListFooterComponent={
          history.length > 5 ? (
            <TouchableOpacity 
              style={{
                backgroundColor: '#1d2631',
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#a38450',
                alignItems: 'center',
                marginTop: 10,
                marginBottom: 20
              }} 
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