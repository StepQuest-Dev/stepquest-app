import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../styles/tabs/Dungeon';
import BottomNavBar from '../../components/BottomNavBar';
import api from '../../services/api';
import CustomAlert from '../../components/CustomAlerts'; // Import customowego alertu

export default function DungeonScreen() {
  const router = useRouter();
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stany dla CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: false });

  useEffect(() => {
    let isMounted = true;

    const fetchEnemies = async () => {
      try {
        console.log('Pobieram potwory z /api/v1/enemies ...');
        const response = await api.get('/enemies'); 
        
        console.log('✅ Udało się! Pobrano potwory:', response.data);

        if (isMounted) {
          const enemiesList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setMonsters(enemiesList);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ BŁĄD pobierania przeciwników:', error.response?.data || error.message);
        
        if (isMounted) {
          setAlertConfig({ title: 'BŁĄD', message: 'Nie udało się połączyć z bazą bestii.', isSuccess: false });
          setAlertVisible(true);
          setLoading(false);
        }
      }
    };

    fetchEnemies();

    return () => { isMounted = false; };
  }, []);

  const renderMonster = ({ item }: any) => {
    const imageSource = item.imageUrl 
      ? { uri: item.imageUrl } 
      : require('@/assets/images/user-icon.png');

    return (
      <View style={styles.monsterCard}>
        <Image source={imageSource} style={styles.monsterImage} resizeMode="cover" />
        
        <View style={styles.monsterInfo}>
          <Text style={styles.monsterName}>{item.name}</Text>
          <Text style={styles.monsterStats}>Lv. {item.level} | ❤️ {item.hp} HP</Text>
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
      {/* UNIWERSALNY ALERT */}
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image source={require('@/assets/images/dungeon_icon.png')} style={styles.icon} resizeMode="contain" />
          <Text style={styles.title}>LABIRYNT ŚMIERCI💀</Text>
          <Text style={styles.subtitle}>Wybierz przeciwnika i wkrocz do walki!</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={monsters}
            keyExtractor={(item) => (item.id || item._id).toString()}
            renderItem={renderMonster}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={{ color: '#8a94a6', textAlign: 'center', marginTop: 20 }}>
                Lochy są obecnie puste... Wszystkie potwory zostały pokonane.
              </Text>
            }
          />
        )}
      </View>

      <BottomNavBar /> 
    </View>
  );
}