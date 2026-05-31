import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../styles/tabs/Dungeon';
import BottomNav from '../../components/BottomNavBar';
import api from '../../services/api';

export default function DungeonScreen() {
  const router = useRouter();
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchEnemies = async () => {
      try {
        console.log('Uderzam do bazy (tabela Enemy) po listę potworów...');
        
        // TUTAJ WSTAWIAMY ENDPOINT OD BACKENDOWCA.
        // Zakładam '/enemies', ale jeśli to '/combat/enemies' lub '/api/v1/enemies', podmień to!
        const response = await api.get('api/v1/enemies'); 
        
        console.log('✅ Odpowiedź z serwera (Potwory):', response.data);

        if (isMounted) {
          // Zabezpieczenie: czasami backend wysyła dane w obiekcie { data: [...] } zamiast od razu w tablicy [...]
          const enemiesList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          
          setMonsters(enemiesList);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ BŁĄD pobierania przeciwników!');
        
        // Ten kod wyciągnie dokładną przyczynę błędu z backendu i wypisze w terminalu
        if (error.response) {
          console.error('Kod błędu:', error.response.status);
          console.error('Szczegóły błędu:', error.response.data);
        } else {
          console.error('Komunikat błędu:', error.message);
        }

        if (isMounted) {
          Alert.alert('Błąd', 'Nie udało się połączyć z lochami.');
          setLoading(false);
        }
      }
    };

    fetchEnemies();

    return () => { isMounted = false; };
  }, []);

  const renderMonster = ({ item }: any) => {
    // Jeśli z bazy przychodzi URL obrazka (np. item.imageUrl), używamy go. 
    // W przeciwnym razie wstawiamy domyślny awatar potwora.
    const imageSource = item.imageUrl 
      ? { uri: item.imageUrl } 
      : require('@/assets/images/user-icon.png');

    return (
      <View style={styles.monsterCard}>
        <Image source={imageSource} style={styles.monsterImage} resizeMode="cover" />
        
        <View style={styles.monsterInfo}>
          <Text style={styles.monsterName}>{item.name}</Text>
          {/* Zabezpieczenie na wypadek, gdyby z bazy wracały np. zmienne 'maxHp' zamiast 'hp' */}
          <Text style={styles.monsterStats}>Lv. {item.level || 1} | ❤️ {item.hp || item.maxHp || '?'} HP</Text>
        </View>

        <TouchableOpacity 
          style={styles.attackButton} 
          onPress={() => router.push({ pathname: '/fight', params: { enemyId: item.id } })}
        >
          <Text style={styles.attackButtonText}>ATAKUJ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#12181f' }}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image source={require('@/assets/images/dungeon_icon.png')} style={styles.icon} resizeMode="contain" />
          <Text style={styles.title}>💀 MROCZNE LOCHY 💀</Text>
          <Text style={styles.subtitle}>Wybierz przeciwnika i wkrocz do walki!</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={monsters}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMonster}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            // Komunikat, gdyby baza potworów była pusta
            ListEmptyComponent={
              <Text style={{ color: '#8a94a6', textAlign: 'center', marginTop: 20 }}>
                Lochy są obecnie puste... Wszystkie potwory zostały pokonane.
              </Text>
            }
          />
        )}
      </View>

      {/* Pasek nawigacji zostaje na dole */}
      <BottomNav />
    </View>
  );
}