import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// UWAGA: Zmień na lokalne IP swojego komputera (np. http://192.168.1.50:3000)
const BACKEND_URL = 'http://✡TWOJE_IP_KOMPUTERA✡:3000'; 

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Stan określający obecny etap odzyskiwania hasła (1: E-mail, 2: Kod, 3: Nowe hasło)
  const [step, setStep] = useState<number>(1);

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Etap 1: Wysłanie prośby o kod weryfikacyjny [cite: 576]
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Błąd', 'Podaj adres e-mail przypisany do konta.');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Nie udało się wysłać kodu.');
      }

      Alert.alert('Sukces', 'Jeśli podany e-mail istnieje w naszej bazie, wysłaliśmy na niego 6-cyfrowy kod.');
      setStep(2); // Przejście do wpisywania kodu [cite: 577]

    } catch (error: any) {
      Alert.alert('Błąd', error.message);
    }
  };

  // Etap 2: Weryfikacja 6-cyfrowego kodu [cite: 576, 577]
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Błąd', 'Kod musi składać się z 6 cyfr.');
      return;
    }
    
    try {
      // Zakładamy, że Twój backend ma endpoint do weryfikacji poprawności kodu przed zmianą hasła
      const response = await fetch(`${BACKEND_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Nieprawidłowy lub przeterminowany kod.');
      }

      Alert.alert('Sukces', 'Kod zweryfikowany poprawnie.');
      setStep(3); // Przejście do zmiany hasła po podaniu poprawnego kodu [cite: 578]

    } catch (error: any) {
      Alert.alert('Błąd weryfikacji', error.message);
    }
  };

  // Etap 3: Ustawienie nowego hasła [cite: 579, 60]
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Błąd', 'Wypełnij oba pola hasła.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Błąd', 'Podane hasła nie są identyczne.');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          code: code, 
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Nie udało się zmienić hasła.');
      }

      // Po zaktualizowaniu hasła użytkownik przenoszony jest automatycznie do logowania [cite: 61]
      Alert.alert('Sukces', 'Twoje hasło zostało zaktualizowane. Możesz się teraz zalogować.', [
        { text: 'Przejdź do logowania', onPress: () => router.push('/') }
      ]);

    } catch (error: any) {
      Alert.alert('Błąd zmiany hasła', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Odzyskiwanie hasła</Text>

      {/* KROK 1: Podawanie adresu e-mail */}
      {step === 1 && (
        <View>
          <Text style={styles.description}>Podaj swój adres e-mail, aby otrzymać 6-cyfrowy kod weryfikacyjny.</Text>
          <TextInput
            style={styles.input}
            placeholder="Adres e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Button title="Wyślij kod" onPress={handleSendCode} color="#2980b9" />
        </View>
      )}

      {/* KROK 2: Wpisywanie kodu */}
      {step === 2 && (
        <View>
          <Text style={styles.description}>Wpisz 6-cyfrowy kod, który wysłaliśmy na Twój e-mail (kod wygasa za 3 minuty)[cite: 576].</Text>
          <TextInput
            style={styles.input}
            placeholder="Kod (6 cyfr)"
            keyboardType="numeric"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <Button title="Weryfikuj kod" onPress={handleVerifyCode} color="#2980b9" />
        </View>
      )}

      {/* KROK 3: Ustawianie nowego hasła */}
      {step === 3 && (
        <View>
          <Text style={styles.description}>Wprowadź swoje nowe hasło.</Text>
          <TextInput
            style={styles.input}
            placeholder="Nowe hasło"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Powtórz nowe hasło"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button title="Zmień hasło" onPress={handleChangePassword} color="#27ae60" />
        </View>
      )}

      {/* Przycisk powrotu do logowania (zawsze widoczny na dole) */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>Powrót do logowania</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    padding: 10,
  },
  backButtonText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});