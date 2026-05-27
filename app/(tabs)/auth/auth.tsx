import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router'; // Import routera do nawigacji

// UWAGA: Zmień na lokalne IP swojego komputera (np. http://192.168.1.50:3000)
// localhost nie zadziała na fizycznym urządzeniu!
const BACKEND_URL = 'http://TWOJE_IP_KOMPUTERA:3000'; 

export default function AuthScreen() {
  const router = useRouter();
  
  // Stan określający tryb widoku
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Stany dla pól formularza
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [dob, setDob] = useState<string>(''); // Data urodzenia 
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Główna funkcja wysyłająca dane do backendu NestJS
  const handleSubmit = async () => {
    if (isLogin) {
      // Walidacja logowania
      if (!email || !password) {
        Alert.alert('Błąd', 'Wypełnij e-mail i hasło.');
        return;
      }
      
      try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Niepoprawny e-mail lub hasło.');
        }

        // Sukces logowania
        Alert.alert('Sukces', 'Zalogowano pomyślnie!');
        console.log('Dane z backendu (Token):', data);
        
        // TODO: Zapisz token w SecureStore i przekieruj użytkownika do głównego ekranu aplikacji (np. router.replace('/dashboard'))
        
      } catch (error: any) {
        Alert.alert('Błąd logowania', error.message);
      }
      
    } else {
      // Walidacja rejestracji
      if (!email || !password || !username || !dob) {
        Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola.');
        return;
      }
      if (!agreedToTerms) {
        Alert.alert('Błąd', 'Musisz zaakceptować zgody formalne, aby założyć konto.'); //
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            username: username,
            dateOfBirth: dob, 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Rejestracja nie powiodła się.');
        }

        // Sukces rejestracji - wyświetlamy pop-up
        Alert.alert('Rejestracja', 'Konto zostało pomyślnie utworzone!', [
          { text: 'OK', onPress: () => setIsLogin(true) } // Powrót do logowania
        ]);

      } catch (error: any) {
        Alert.alert('Błąd rejestracji', error.message);
      }
    }
  };

  // Nawigacja do ekranu odzyskiwania hasła
  const handleForgotPassword = () => {
    router.push('../ForgotPassword'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isLogin ? 'Witaj z powrotem!' : 'Dołącz do StepQuest'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Adres e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nazwa użytkownika"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Data urodzenia (DD-MM-YYYY)"
            value={dob}
            onChangeText={setDob}
          />
          
          <View style={styles.termsContainer}>
            <Switch
              value={agreedToTerms}
              onValueChange={setAgreedToTerms}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={agreedToTerms ? '#27ae60' : '#f4f3f4'}
            />
            <Text style={styles.termsText}>
              Akceptuję <Text style={styles.linkText}>Zgody formalne</Text>
            </Text>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title={isLogin ? 'Zaloguj się' : 'Zarejestruj się'} 
          onPress={handleSubmit} 
          color="#27ae60" 
        />
      </View>

      {isLogin && (
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.linkText}>Zapomniałem hasła</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.switchModeButton} onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchModeText}>
          {isLogin ? 'Nie masz konta? Utwórz konto' : 'Masz już konto? Zaloguj się'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#2980b9',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  switchModeButton: {
    marginTop: 20,
    padding: 10,
  },
  switchModeText: {
    textAlign: 'center',
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
  },
});