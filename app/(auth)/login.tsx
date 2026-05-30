import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import StyledTextInput from '../../components/StyledTextInput';
import api from '../../services/api';
import { styles } from '../../styles/auth/login';

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
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      if (access_token) {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('userToken', access_token);
          }
        } else {
          await SecureStore.setItemAsync('userToken', access_token);
        }
      }

      if (typeof window !== 'undefined') {
        alert('Sukces! Zalogowano pomyślnie.');
      } else {
        Alert.alert('Sukces', 'Zalogowano pomyślnie!');
      }

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
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.header}>STEPQUEST</Text>

      {/* Pola tekstowe korzystające z inteligentnego dobierania kolorów placeholderów */}
      <StyledTextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <StyledTextInput
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
          <ActivityIndicator color="#ebd59b" />
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
