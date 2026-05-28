import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api'; // Importujemy naszego Axiosa

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Axios domyślnie rzuca błędem dla statusów innych niż 2xx, 
      // a response.data od razu parsuje JSONa!
      const response = await api.post('/auth/login', { email, password });
      
      const { access_token } = response.data;

      if (access_token) {
        await SecureStore.setItemAsync('userToken', access_token);
        router.replace('../dashboard');
      } else {
        Alert.alert('Sukces', 'Zalogowano pomyślnie!');
        router.replace('../dashboard');
      }

    } catch (error: any) {
      // Axios pakuje odpowiedź z backendu w error.response
      const message = error.response?.data?.message || 'Błąd logowania';
      Alert.alert('Błąd', Array.isArray(message) ? message.join('\n') : message);
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

      <View style={styles.buttonContainer}>
        <Button title="Zaloguj się" onPress={handleLogin} color="#27ae60" />
      </View>

      <TouchableOpacity onPress={() => router.push('../register')}>
        <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f6f8' },
  header: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  buttonContainer: { marginBottom: 20 },
  linkText: { textAlign: 'center', color: '#2980b9', fontWeight: 'bold' }
});