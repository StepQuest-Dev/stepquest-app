import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      // Zaledwie jedna linijka dzięki Axios!
      await api.post('/auth/register', { email, username, password });

      Alert.alert('Sukces', 'Konto zostało pomyślnie utworzone!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      const message = error.response?.data?.message || 'Błąd rejestracji';
      Alert.alert('Błąd', Array.isArray(message) ? message.join('\n') : message);
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

      <View style={styles.buttonContainer}>
        <Button title="Zarejestruj się" onPress={handleRegister} color="#2980b9" />
      </View>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f6f8' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  buttonContainer: { marginBottom: 20 },
  linkText: { textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }
});