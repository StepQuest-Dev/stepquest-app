import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../components/CustomAlerts';
import api from '../../services/api';
import { charStyles as styles } from '../../styles/tabs/CharacterScreens';

export default function CharacterScreen() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isSuccess: false, onConfirm: undefined as (() => void) | undefined, showCancel: false });

  useFocusEffect(
    useCallback(() => {
      const fetchChar = async () => {
        try {
          const res = await api.get('/character');
          if (res.data) setCharacter(Array.isArray(res.data) ? res.data[0] : res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchChar();
    }, [])
  );

  const handleDelete = async () => {
    try {
      setLoading(true);
      // Uderzamy w endpoint /character (lub /character/ID). 
      await api.delete(character.id ? `/character/${character.id}` : '/character');
      setAlertVisible(false);
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      setLoading(false);
      
      // Wyciągamy dokładny powód błędu z backendu
      const errorMsg = err.response?.data?.message || err.message || 'Nieznany błąd serwera';
      console.error('❌ Błąd usuwania postaci:', err.response?.data || err);
      
      setAlertConfig({ 
        title: 'Błąd usuwania', 
        message: `Serwer odrzucił żądanie:\n\n${errorMsg}`, 
        isSuccess: false, 
        onConfirm: undefined, 
        showCancel: false 
      });
      setAlertVisible(true);
    }
  };

  const confirmDelete = () => {
    setAlertConfig({
      title: 'USUWANIE POSTACI',
      message: 'Czy na pewno chcesz porzucić tego wojownika? Ta akcja jest nieodwracalna!',
      isSuccess: false,
      showCancel: true,
      onConfirm: handleDelete
    });
    setAlertVisible(true);
  };

  if (loading && !character) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ebd59b" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} isSuccess={alertConfig.isSuccess} onConfirm={alertConfig.onConfirm} onClose={() => setAlertVisible(false)} showCancel={alertConfig.showCancel} />
      
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profile')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>SZCZEGÓŁY POSTACI</Text>
      </View>

      {character && (
        <View style={styles.detailsCard}>
          <Image source={require('@/assets/images/user-icon.png')} style={styles.bigAvatar} />
          <Text style={styles.charName}>{character.name.toUpperCase()}</Text>
          <Text style={styles.charLevel}>Poziom {character.level} • Złoto: {character.gold}</Text>

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
             <Text style={{ color: '#e74c3c', fontFamily: 'determination', fontSize: 18 }}>❤️ HP: {character.maxHp}</Text>
             <Text style={{ color: '#ebd59b', fontFamily: 'determination', fontSize: 18 }}>⚔️ Atak: {character.attack}</Text>
             <Text style={{ color: '#3498db', fontFamily: 'determination', fontSize: 18 }}>🛡️ Obr: {character.defense}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={loading}>
        <Text style={styles.deleteBtnText}>PORZUĆ POSTAĆ (USUŃ)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}