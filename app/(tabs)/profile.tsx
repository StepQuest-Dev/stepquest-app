import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Profile'; // Import wyodrębnionych stylów

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

  // LICZNIK KLIKNIĘĆ AWATARA (EASTER EGG)
  const [avatarClicks, setAvatarClicks] = useState(0);

  const handleAvatarPress = () => {
    const nextClicks = avatarClicks + 1;
    setAvatarClicks(nextClicks);

    if (nextClicks >= 5) {
      setAvatarClicks(0); // Reset licznika
      if (Platform.OS === 'web') {
        alert('🪄 Tryb deweloperski aktywowany!');
      } else {
        Alert.alert('🛠️ Panel Programisty', 'Uzyskano dostęp do narzędzi administracyjnych.');
      }
      router.push('/(tabs)/developerPanel');
    }
  };

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
      <View style={styles.topBar}>
        {/* POPRAWKA BŁĘDU GO_BACK: Używamy sztywnego router.push zamiast .back() */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/dashboard')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>PROFIL BOHATERA</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.headerCard}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrapper}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          <View style={styles.avatarOverlay}>
            <Text style={{ fontSize: 14 }}>🤠</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.username} numberOfLines={1}>{profile.username.toUpperCase()}</Text>
          <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>

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