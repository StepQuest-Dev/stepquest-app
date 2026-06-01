import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Na telefonie 'localhost' to sam telefon, dlatego musimy użyć adresu IP komputera (EXPO_PUBLIC_LOCAL_IP).
// W przeglądarce 'localhost' działa poprawnie.
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api/v1'
  : `http://${process.env.EXPO_PUBLIC_LOCAL_IP}:3000/api/v1`;

console.log('--- API CONFIGURATION ---');
console.log('Target API_URL:', API_URL);
console.log('Platform:', Platform.OS);
console.log('-------------------------');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
