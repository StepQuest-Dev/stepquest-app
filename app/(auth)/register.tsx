import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Log sprawdzający czy kliknięcie w ogóle działa w przeglądarce
    console.log('🚀 Kliknięto zarejestruj! Dane:', { email, username, password });

    if (!email || !username || !password) {
      const msg = 'Uzupełnij wszystkie pola!';
      console.warn(msg);
      typeof window !== 'undefined' ? alert(msg) : Alert.alert('Błąd', msg);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { email, username, password });
      console.log('✅ Serwer odpowiedział sukcesem:', response.data);

      const successMsg = 'Konto zostało pomyślnie utworzone!';
      if (typeof window !== 'undefined') {
        alert(successMsg);
        router.back();
      } else {
        Alert.alert('Sukces', successMsg, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }

    } catch (error: any) {
      // Wyciągamy dokładny błąd z serwera lub sieci
      console.error('❌ Błąd Axiosa podczas rejestracji:', error);
      if (error.response) {
        console.error('Dane błędu z serwera:', error.response.data);
      }

      const message = error.response?.data?.message || 'Błąd rejestracji';
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
      <Text style={styles.header}>Dołącz do StepQuest</Text>

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
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Uniwersalny przycisk działający na Web i Mobile */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 20 }}>
        <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f4f6f8' 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#2c3e50' 
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#ddd',
    color:"#888"
      },
  button: { 
    backgroundColor: '#2980b9', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonDisabled: { 
    backgroundColor: '#7f8c8d' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  linkText: { 
    textAlign: 'center', 
    color: '#27ae60', 
    fontWeight: 'bold' 
  }
  
});