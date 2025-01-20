import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      async getItem(key) {
        try {
          return await SecureStore.getItemAsync(key);
        } catch (e) {
          return null;
        }
      },
      async setItem(key, value) {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (e) {
          return null;
        }
      },
      async removeItem(key) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          return null;
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 