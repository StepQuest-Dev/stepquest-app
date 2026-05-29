import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import StyledTextInput from '../../components/StyledTextInput';

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
      {/* Kontener wyśrodkowujący logo StepQuest */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/logo.png')} // Korzysta z działającego aliasu @/
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
      
      <StyledTextInput
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#12181f' // Ciemne tło RPG
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
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#ebd59b', // Złoty kolor tekstu
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1
  },
  input: { 
    backgroundColor: '#212933', // Granatowo-szare tło pól tekstowych
    padding: 15, 
    borderRadius: 4, // Ostre, pikselowe krawędzie
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#a38450', // Ciemnozłota ramka
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
    borderColor: '#d8b26e', // Jasnozłota ramka przycisku
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