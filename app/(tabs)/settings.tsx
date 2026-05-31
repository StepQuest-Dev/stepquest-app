import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../components/CustomAlerts';
import api from '../../services/api';
import { styles } from '../../styles/tabs/Settings';

const AVAILABLE_AVATARS = [
  { id: 'default', source: require('@/assets/images/user-icon.png'), url: null },
  { id: 'warrior', source: require('@/assets/images/warrior-icon.png'), url: 'warrior-icon.png' },
  { id: 'monk', source: require('@/assets/images/mnich-icon.png'), url: 'mnich-icon.png' },
  { id: 'mage', source: require('@/assets/images/mag-icon.png'), url: 'mag-icon.png' },
  { id: 'scout', source: require('@/assets/images/loczek-icon.png'), url: 'loczek-icon.png' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('default');

  const [alertVisible, setAlertVisible] = useState(false);
  // Rozszerzony obiekt alertu o showCancel
  const [alertConfig, setAlertConfig] = useState({ 
    title: '', 
    message: '', 
    isSuccess: true, 
    showCancel: false,
    onConfirm: undefined as (() => void) | undefined 
  });

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' }, headerShown: false });
    
    const fetchUserData = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          setCurrentUsername(res.data.username || '');
          setNewUsername(res.data.username || '');
          
          const savedAvatarUrl = res.data.avatarUrl;
          const matchedAvatar = AVAILABLE_AVATARS.find(a => a.url === savedAvatarUrl);
          if (matchedAvatar) {
            setSelectedAvatarId(matchedAvatar.id);
          }
        }
      } catch (error) {
        console.error('Błąd pobierania danych użytkownika:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleUpdateProfile = async (type: 'username' | 'avatar') => {
    setSaving(true);
    try {
      let payload = {};
      
      if (type === 'username') {
        if (!newUsername.trim()) throw new Error('Nick nie może być pusty!');
        payload = { username: newUsername.trim() };
      } else if (type === 'avatar') {
        const avatarToSave = AVAILABLE_AVATARS.find(a => a.id === selectedAvatarId)?.url || null;
        payload = { avatarUrl: avatarToSave };
      }

      await api.patch('/auth/me', payload);

      if (type === 'username') setCurrentUsername(newUsername.trim());

      setAlertConfig({
        title: '✅ SUKCES',
        message: type === 'username' ? 'Twój nowy nick został zapisany.' : 'Awatar profilowy został zaktualizowany.',
        isSuccess: true,
        showCancel: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } catch (error: any) {
      setAlertConfig({
        title: '❌ BŁĄD',
        message: error.response?.data?.message || error.message || 'Nie udało się zapisać zmian.',
        isSuccess: false,
        showCancel: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  // --- LOGIKA USUWANIA KONTA ---
  const handleDeleteAccountRequest = () => {
    setAlertConfig({
      title: '⚠️ UWAGA',
      message: 'Czy na pewno chcesz BEZPOWROTNIE usunąć swoje konto? Stracisz całe zebrane złoto, postać i statystyki. Tego nie można cofnąć!',
      isSuccess: false,
      showCancel: true,
      onConfirm: executeAccountDeletion
    });
    setAlertVisible(true);
  };

  const executeAccountDeletion = async () => {
    setAlertVisible(false);
    setLoading(true);
    try {
      // Wywołanie usunięcia z bazy danych
      await api.delete('/auth/me');

      // Czyszczenie tokenów z pamięci urządzenia
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }

      // Wyrzucenie użytkownika do ekranu logowania
      router.replace('/(auth)/login');
    } catch (error: any) {
      setAlertConfig({
        title: 'BŁĄD',
        message: error.response?.data?.message || 'Nie udało się usunąć konta.',
        isSuccess: false,
        showCancel: false,
        onConfirm: undefined
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ebd59b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert 
        visible={alertVisible} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        isSuccess={alertConfig.isSuccess} 
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertVisible(false)} 
        showCancel={alertConfig.showCancel} 
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>USTAWIENIA</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>NICKNAME</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Twój obecny nick: <Text style={{ color: '#ebd59b' }}>{currentUsername}</Text></Text>
          <TextInput
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Wpisz nowy nick..."
            placeholderTextColor="#8a94a6"
            maxLength={15}
          />
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={() => handleUpdateProfile('username')}
            disabled={saving || newUsername.trim() === currentUsername}
          >
            <Text style={styles.saveBtnText}>ZAPISZ NICK</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>AWATAR PROFILU</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Wybierz wizerunek reprezentujący Twoje konto:</Text>
          
          <View style={styles.avatarGrid}>
            {AVAILABLE_AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <TouchableOpacity 
                  key={avatar.id} 
                  style={[styles.avatarWrapper, isSelected && styles.avatarSelected]}
                  onPress={() => setSelectedAvatarId(avatar.id)}
                  activeOpacity={0.7}
                >
                  <Image source={avatar.source} style={styles.avatarImage} resizeMode="cover" />
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <FontAwesome5 name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={() => handleUpdateProfile('avatar')} disabled={saving}>
            <Text style={styles.saveBtnText}>ZAPISZ AWATAR</Text>
          </TouchableOpacity>
        </View>

        {/* SEKCJA 3: STREFA ZAGROŻENIA */}
        <Text style={[styles.sectionTitle, { color: '#e74c3c' }]}>STREFA ZAGROŻENIA</Text>
        <View style={[styles.card, { borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
          <Text style={styles.label}>
            Usunięcie konta jest ostateczne. Stracisz dostęp do swojej postaci, historii lochów oraz zebranych kroków.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccountRequest}>
            <Text style={styles.dangerBtnText}>USUŃ KONTO</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}