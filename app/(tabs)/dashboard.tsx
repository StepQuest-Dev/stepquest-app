import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Pobieramy dane użytkownika (token wysyła się sam!)
        const userResponse = await api.get('/auth/me');
        setUsername(userResponse.data.username || userResponse.data.email);

        // 2. Pobieramy najnowsze kroki użytkownika
        try {
          const stepsResponse = await api.get('/steps/latest');
          // Dopasuj '.count' lub '.steps' w zależności od tego, jak nazwałeś pole w NestJS
          setSteps(stepsResponse.data.steps || stepsResponse.data.count || 0); 
        } catch (stepError) {
          console.warn('Użytkownik nie ma jeszcze zapisanych kroków w bazie.');
        }

      } catch (error: any) {
        console.error('❌ Błąd pobierania danych z serwera:', error);
        // Jeśli serwer odrzuci token (np. wygasł), wylogowujemy gracza
        if (error.response?.status === 401) {
          alert('Sesja wygasła. Zaloguj się ponownie.');
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    // Uniwersalne czyszczenie tokenu (Web i Telefon)
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    
    // Zmień ścieżkę jeśli Twój login.tsx jest w innej lokalizacji
    router.replace('../login'); 
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 10 }}>Ładowanie profilu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.greeting}>Witaj, {username}! 👋</Text>
        <Text style={styles.subtitle}>Gotowy na kolejne wyzwania?</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Twoje dzisiejsze kroki</Text>
        <Text style={styles.statsValue}>{steps}</Text>
        <Text style={styles.statsUnit}>kroków</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f4f6f8',
    justifyContent: 'center'
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#2c3e50' 
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: '#2980b9',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#2980b9',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statsLabel: {
    color: '#e0f7fa',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsValue: {
    color: '#fff',
    fontSize: 54,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statsUnit: {
    color: '#e0f7fa',
    fontSize: 18,
  },
  logoutButton: { 
    backgroundColor: '#e74c3c', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});