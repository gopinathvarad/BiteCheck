import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 
  'http://localhost:8000';
const API_VERSION = Constants.expoConfig?.extra?.apiVersion || 
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_VERSION) || 
  'v1';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Session expired or invalid, sign out user
      await supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

export default apiClient;

