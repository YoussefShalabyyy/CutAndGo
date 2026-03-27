import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supplied by user
const supabaseUrl = 'https://niqzgzbrxuqsivendkpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXpnemJyeHVxc2l2ZW5ka3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDEwNTAsImV4cCI6MjA5MDAxNzA1MH0.GPxYzKud-CU6Rrz4vRM3M0Opn1E2XaxXHHBBOsbdziI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
