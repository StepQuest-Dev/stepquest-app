import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Uzupełnij e-mail i hasło!';
      typeof window !== 'undefined' ? alert(msg) : Alert.alert('Błąd', msg);
      return;
    }

    setLoading(true);

    try {
      // Wysłanie danych do serwera
      const response = await api.post('/auth/login', { email, password });
      
      const { access_token } = response.data;

      // Zapisujemy token w zależności od platformy (Web vs Mobile)
      if (access_token) {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('userToken', access_token);
          }
        } else {
          await SecureStore.setItemAsync('userToken', access_token);
        }
      }

      // Komunikat o sukcesie (bezpieczny dla obu platform)
      if (typeof window !== 'undefined') {
        alert('Sukces! Zalogowano pomyślnie.');
      } else {
        Alert.alert('Sukces', 'Zalogowano pomyślnie!');
      }

      // Przejście do Dashboardu
      router.replace('/(tabs)/dashboard');

    } catch (error: any) {
      console.error('❌ Błąd logowania:', error);
      const message = error.response?.data?.message || 'Błąd logowania';
      const formattedMessage = Array.isArray(message) ? message.join('\n') : message;
      
      typeof window !== 'undefined' 
        ? alert(`Błąd: ${formattedMessage}`) 
        : Alert.alert('Błąd', formattedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>StepQuest</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 20 }}>
        <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f6f8' },
  header: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { backgroundColor: '#95a5a6' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', color: '#2980b9', fontWeight: 'bold' }
});