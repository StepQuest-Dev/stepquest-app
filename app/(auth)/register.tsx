import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import StyledTextInput from '../../components/StyledTextInput';
import api from '../../services/api';
import { styles } from '../../styles/auth/register';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Widoczność hasła
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = async () => {
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
      {/* Kontener wyśrodkowujący logo StepQuest */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.header}>DOŁĄCZ DO STEPQUEST</Text>

      {/* Dynamiczne pola tekstowe ze zintegrowanym placeholderem dostosowanym do systemu */}
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
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* --- HASŁO Z "OCZKIEM" (NAPRAWIONY WYGLĄD) --- */}
      {/* Kontener otrzymuje style inputu (kolor, ramka), ale bez wewnętrznych marginesów */}
      <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', padding: 0, paddingHorizontal: 0, paddingVertical: 0 }]}>
        <StyledTextInput
          // Sam tekst jest przezroczysty i nie ma swoich ramek, żeby wtopić się w kontener
          style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity 
          style={{ paddingHorizontal: 15 }} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesome5 
            name={isPasswordVisible ? "eye-slash" : "eye"} 
            size={20} 
            color="#ebd59b" 
          />
        </TouchableOpacity>
      </View>

      {/* Uniwersalny przycisk działający na Web i Mobile */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ebd59b" />
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