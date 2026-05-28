import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Pamiętaj o wpisaniu swojego lokalnego IP (zostawiamy tu bazowy prefiks api/v1)
const API_URL = 'http://localhost:3000/api/v1';

// Tworzymy instancję Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor żądań (Request Interceptor)
api.interceptors.request.use(
  async (config) => {
    // Przed każdym zapytaniem pobieramy token JWT z pamięci telefonu
    const token = await SecureStore.getItemAsync('userToken');
    
    // Jeśli token istnieje, doklejamy go do nagłówka autoryzacji
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