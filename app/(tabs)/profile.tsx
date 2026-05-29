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
          avatarUrl: userData.avatarUrl || 'https://ui-avatars.com/api/?name=' + (userData.username || 'User') + '&background=2980b9&color=fff&size=200',
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

  // Funkcja obsługująca wylogowanie
  const handleLogout = async () => {
    try {
      // 1. Czyszczenie tokenu w zależności od platformy
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userToken');
        }
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }

      // 2. Przekierowanie do ekranu logowania (wewnątrz grupy auth)
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ Błąd podczas wylogowywania:', error);
      Alert.alert('Błąd', 'Nie udało się pomyślnie wylogować.');
    }
  };

  // Potwierdzenie chęci wylogowania (Alert dla Mobile, confirm dla Web)
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
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 10 }}>Ładowanie profilu bohatera...</Text>
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
        <Text style={styles.characterClass}>{item.class}</Text>
      </View>
      <View style={styles.characterLevelBadge}>
        <Text style={styles.characterLevelText}>Lvl {item.level}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Sekcja główna profilu (Góra) */}
      <View style={styles.headerCard}>
  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
  
  <View style={styles.headerInfo}>
    <Text style={styles.username}>{profile.username}</Text>
    <Text style={styles.email}>{profile.email}</Text>
    <View style={styles.levelBadge}>
      <Text style={styles.levelText}>POZIOM {profile.level}</Text>
    </View>
  </View>

  {/* Teraz przycisk jest wewnątrz Flexboxa, a nie "pływa" nad nim */}
  <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
    <FontAwesome5 name="sign-out-alt" size={14} color="#e74c3c" />
    <Text style={styles.logoutText}>Wyloguj</Text>
  </TouchableOpacity>
</View>

      {/* Sekcja postaci (Dół) */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Twoje Postacie</Text>
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
    backgroundColor: '#f4f6f8',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  headerCard: {
    flexDirection: 'row', // Ikona będzie obok avatara i info
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center', // To wyśrodkuje wszystko w pionie
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    marginLeft: 'auto', // Klucz: wypycha przycisk na samą prawą stronę, ale wewnątrz Flexa
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#2980b9',
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  email: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#27ae60',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  characterClass: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  characterLevelBadge: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  characterLevelText: {
    color: '#2980b9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
    fontStyle: 'italic',
  },


});