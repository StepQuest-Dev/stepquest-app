import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Pamiętaj: localhost dla Web/Emulacji, Twoje IP jeśli testujesz na fizycznym telefonie
const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bezpieczny interceptor żądań
api.interceptors.request.use(
  async (config) => {
    let token = null;

    try {
      // Jeśli odpalamy w przeglądarce (Web)
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('userToken');
        }
      } else {
        // Jeśli odpalamy na telefonie (Android/iOS)
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