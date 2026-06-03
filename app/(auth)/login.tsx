import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import StyledTextInput from '../../components/StyledTextInput';
import api from '../../services/api';
import { styles } from '../../styles/auth/login';
import GameDiagnostics from '../../components/GameDiagnostics';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Widoczność hasła
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Diagnostyka
  const [currentStatus, setCurrentStatus] = useState('Inicjalizacja autoryzacji...');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkErrorDetails, setNetworkErrorDetails] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setCurrentStatus(msg);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Wprowadź email i hasło.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Błąd', msg);
      return;
    }

    setLoading(true);
    try {
      addLog(`Nawiązywanie połączenia z: ${api.defaults.baseURL}/auth/login`);
      const response = await api.post('/auth/login', { email, password });
      
      const { access_token, hasCharacter } = response.data;
      if (access_token) {
        if (Platform.OS === 'web') localStorage.setItem('userToken', access_token);
        else await SecureStore.setItemAsync('userToken', access_token);
      }
      
      if (hasCharacter) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(tabs)/CreateCharacter');
      }
    } catch (error: any) {
      addLog('❌ BŁĄD LOGOWANIA');
      let details = error.message;
      if (error.response) {
         details = Array.isArray(error.response.data.message) 
           ? error.response.data.message.join('\n') 
           : error.response.data.message || error.message;
      }
      setNetworkErrorDetails(details);
    } finally {
      setLoading(false);
    }
  };

  if (networkErrorDetails && !loading) {
     // Pozwól graczowi zobaczyć błąd i wrócić do formularza
     return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#e74c3c', fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
            Błąd logowania: {networkErrorDetails}
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => { setNetworkErrorDetails(null); setCurrentStatus('Gotowy.'); }}
          >
            <Text style={styles.buttonText}>SPRÓBUJ PONOWNIE</Text>
          </TouchableOpacity>
       </View>
     );
  }

  if (loading) {
    return <GameDiagnostics currentStatus={currentStatus} debugLogs={debugLogs} networkErrorDetails={null} />;
  }

  return (
    <View style={styles.container}>
      
      {/* SEKCJA LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* NAGŁÓWEK */}
      <Text style={styles.header}>STEPQUEST</Text>
      
      {/* E-MAIL */}
      <StyledTextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* HASŁO Z "OCZKIEM" */}
      <View style={styles.passwordContainer}>
        <StyledTextInput
          style={[styles.input, { marginBottom: 0, borderWidth: 0, flex: 1 }]}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesome5 
            name={isPasswordVisible ? "eye-slash" : "eye"} 
            size={20} 
            color="#ebd59b" 
          />
        </TouchableOpacity>
      </View>

      {/* PRZYCISK LOGOWANIA */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
      </TouchableOpacity>

      {/* LINK DO REJESTRACJI */}
      <TouchableOpacity 
        onPress={() => router.push('/(auth)/register')} 
        style={{ marginTop: 25 }}
      >
        <Text style={styles.linkText}>Nie masz jeszcze konta? Zarejestruj się</Text>
      </TouchableOpacity>

    </View>
  );
}