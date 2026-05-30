import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import StyledTextInput from '../../components/StyledTextInput';

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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#12181f'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 160,  
    height: 160, 
  },
  header: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 35, 
    color: '#ebd59b', 
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1
  },
  input: { 
    backgroundColor: '#212933', 
    padding: 15, 
    borderRadius: 4, 
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#a38450', 
    color: '#ebd59b', 
    fontSize: 16
  },
  button: { 
    backgroundColor: '#2a3642', 
    padding: 15, 
    borderRadius: 4, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d8b26e', 
    marginTop: 10
  },
  buttonDisabled: { 
    backgroundColor: '#1a2026',
    borderColor: '#555' 
  },
  buttonText: { 
    color: '#ebd59b', 
    fontWeight: 'bold', 
    fontSize: 18,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  linkText: { 
    textAlign: 'center', 
    color: '#a38450', 
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    textDecorationLine: 'underline'
  }
});