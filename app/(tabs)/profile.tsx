import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, FlatList, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
}

interface UserProfile {
  username: string;
  email: string;
  level: number;
  avatarUrl: string;
  characters: Character[];
}

export default function PlayerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;

        setProfile({
          username: userData.username || 'Nieznany Wojownik',
          email: userData.email || 'brak@email.com',
          level: userData.level || 1,
          avatarUrl: userData.avatarUrl || 'https://ui-avatars.com/api/?name=' + (userData.username || 'User') + '&background=212933&color=ebd59b&size=200',
          characters: userData.characters?.length > 0 ? userData.characters : [
            { id: '1', name: 'Zwinny Łotrzyk', class: 'Zabójca', level: 5 },
            { id: '2', name: 'Potężny Mag', class: 'Czarodziej', level: 12 }
          ]
        });

      } catch (error) {
        console.error('❌ Błąd pobierania profilu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userToken');
        }
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ Błąd podczas wylogowywania:', error);
      Alert.alert('Błąd', 'Nie udało się pomyślnie wylogować.');
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Czy na pewno chcesz się wylogować?')) {
        handleLogout();
      }
    } else {
      Alert.alert(
        'Wylogowanie',
        'Czy na pewno chcesz opuścić grę?',
        [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Wyloguj', style: 'destructive', onPress: handleLogout }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ebd59b" />
        <Text style={styles.loadingText}>Ładowanie profilu bohatera...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Nie udało się załadować profilu.</Text>
      </View>
    );
  }

  const renderCharacter = ({ item }: { item: Character }) => (
    <View style={styles.characterCard}>
      <View style={styles.characterInfo}>
        <Text style={styles.characterName}>{item.name}</Text>
        <Text style={styles.characterClass}>{item.class.toUpperCase()}</Text>
      </View>
      <View style={styles.characterLevelBadge}>
        <Text style={styles.characterLevelText}>LV. {item.level}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* NAGŁÓWEK Z PRZYCISKIEM POWROTU */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>PROFIL BOHATERA</Text>
        <View style={{ width: 40 }} /> {/* Spacer dla wyśrodkowania tekstu */}
      </View>

      {/* GŁÓWNA KARTA PROFILU (Z DUŻYMI STATYSTYKAMI) */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          <View style={styles.avatarOverlay}>
            <Text style={{ fontSize: 14 }}>🤠</Text>
          </View>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.username} numberOfLines={1}>{profile.username.toUpperCase()}</Text>
          <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
          
          {/* Pasek EXP identyczny z Dashboardem */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv. {profile.level}</Text>
            <Text style={styles.expLabel}>EX</Text>
            <View style={styles.expBarBg}>
              <View style={[styles.expBarFill, { width: '45%' }]} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <FontAwesome5 name="sign-out-alt" size={14} color="#e74c3c" />
          <Text style={styles.logoutText}>Wyjdź</Text>
        </TouchableOpacity>
      </View>

      {/* SEKCJA DANYCH / POSTACI (Z KOLEKCJI STYLÓW MAINCONTENT) */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>⛺ TWOJE POSTACIE</Text>
        <FlatList
          data={profile.characters}
          keyExtractor={(item) => item.id}
          renderItem={renderCharacter}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nie stworzyłeś jeszcze żadnej postaci.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12181f',
  },
  loadingText: {
    marginTop: 15,
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#12181f',
    padding: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#2a3642',
    borderWidth: 2,
    borderColor: '#d8b26e',
    borderRadius: 4,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1d2631',
    borderWidth: 1,
    borderColor: '#ebd59b',
    borderRadius: 3,
    padding: 2,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 12,
    color: '#8a94a6',
    marginTop: 1,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },
  expLabel: {
    color: '#8a94a6',
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 4,
  },
  expBarBg: {
    width: 70,
    height: 8,
    backgroundColor: '#12181f',
    borderWidth: 1,
    borderColor: '#454f5b',
    borderRadius: 1,
    overflow: 'hidden',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#717d8c',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a1a1e',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 4,
    marginLeft: 'auto',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#171f2a',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 15,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ebd59b',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#1d2631',
    borderWidth: 1,
    borderColor: '#454f5b',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ebd59b',
  },
  characterClass: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  characterLevelBadge: {
    backgroundColor: '#2a3642',
    borderWidth: 1,
    borderColor: '#d8b26e',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  characterLevelText: {
    color: '#ebd59b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8a94a6',
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 13,
  },
});