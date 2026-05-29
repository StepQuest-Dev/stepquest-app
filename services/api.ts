import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Jesli chcesz na localhoscie
//const API_URL = 'http://localhost:3000/api/v1';

//Zalecenia mistrza fronenda aby dzialalo
// 1. instalujesz ngroka npx install ngrok
// 2. nowa konsola komenda ta -> npx cloudflared tunnel --url http://localhost:3000  
// 3. kopiujesz kurwa ten urla z cloudflare'a i wklejasz na API_URL poniżej
// 4. nowa konsola komenda ta -> npx expo start -c --tunnel / jeśli nie działa to npx expo start --tunnel
// 5. Do linka poniżej https://dluga-nazwa-linka/api/vi
const API_URL = 'https://ins-bags-anywhere-famous.trycloudflare.com/api/v1';

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