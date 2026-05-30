import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Upewnij się, że masz to zainstalowane
import StyledTextInput from '../../components/StyledTextInput';
import api from '../../services/api';
import { styles } from '../../styles/auth/login';
import GameDiagnostics from '../../components/GameDiagnostics';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NOWY STAN: Widoczność hasła
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // --- DIAGNOSTYKA ---
  const [currentStatus, setCurrentStatus] = useState('Inicjalizacja autoryzacji...');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkErrorDetails, setNetworkErrorDetails] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setCurrentStatus(msg);
  };

  const handleLogin = async () => {
    // ... (kod bez zmian do momentu try/catch)
    setLoading(true);
    try {
      addLog(`Nawiązywanie połączenia z: ${api.defaults.baseURL}/auth/login`);
      const response = await api.post('/auth/login', { email, password });
      
      const { access_token } = response.data;
      if (access_token) {
        if (Platform.OS === 'web') localStorage.setItem('userToken', access_token);
        else await SecureStore.setItemAsync('userToken', access_token);
      }
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      addLog('❌ BŁĄD LOGOWANIA');
      setNetworkErrorDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || networkErrorDetails) {
    return <GameDiagnostics currentStatus={currentStatus} debugLogs={debugLogs} networkErrorDetails={networkErrorDetails} />;
  }

  return (
    <View style={styles.container}>
      {/* ... logo i header ... */}
      
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
      </TouchableOpacity>
    </View>
  );
}