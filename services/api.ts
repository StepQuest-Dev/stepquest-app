import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Logika ustalania adresu API:
 * 1. Jeśli ustawione jest EXPO_PUBLIC_API_URL w .env - używamy go (najlepsze dla tuneli typu ngrok/cloudflare).
 * 2. Jeśli jesteśmy w przeglądarce (Web) - używamy localhost.
 * 3. Jeśli jesteśmy na telefonie - używamy lokalnego adresu IP komputera.
 */
const getBaseURL = () => {
  // 1. Priorytet: Pełny adres z .env (idealny dla tuneli)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Fallback dla Web
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1';
  }

  // 3. Fallback dla Mobile (używamy IP lokalnego)
  const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || '127.0.0.1';
  return `http://${localIP}:3000/api/v1`;
};

const API_URL = getBaseURL();

console.log('--- API CONFIGURATION ---');
console.log('Final API_URL:', API_URL);
console.log('Platform:', Platform.OS);
console.log('-------------------------');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Pomija ekran ostrzeżenia ngrok
  },
});

// Bezpieczny interceptor żądań
api.interceptors.request.use(
  async (config) => {
    let token = null;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('userToken');
        }
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }
    } catch (e) {
      console.warn('Nie udało się pobrać tokenu autoryzacji:', e);
    }
    
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor odpowiedzi - obsługa wygaśnięcia sesji (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesja wygasła (401). Wylogowywanie...');
      
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (e) {
        console.error('Błąd podczas usuwania tokenu:', e);
      }

      // Możemy tu rzucić błąd dalej lub obsłużyć przekierowanie 
      // (choć lepiej to robić w komponentach przez router)
    }
    return Promise.reject(error);
  }
);

export const logoutUser = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
  } catch (e) {
    console.error('Logout error:', e);
  }
};

export default api;
