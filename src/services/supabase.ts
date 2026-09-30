import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or user localStorage configuration
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const LOCAL_STORAGE_KEY_URL = 'chargeos_supabase_url';
const LOCAL_STORAGE_KEY_ANON = 'chargeos_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL) || ENV_SUPABASE_URL;
  const anonKey = localStorage.getItem(LOCAL_STORAGE_KEY_ANON) || ENV_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(url && url.startsWith('http') && anonKey && anonKey.length > 10);
  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (url) localStorage.setItem(LOCAL_STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(LOCAL_STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(LOCAL_STORAGE_KEY_ANON, anonKey.trim());
  else localStorage.removeItem(LOCAL_STORAGE_KEY_ANON);

  cachedClient = null; // Invalidate cached instance
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, anonKey);
    // Ping auth or table
    const { error } = await testClient.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, we still know the credentials communicated with postgres
      if (error.message.includes('relation "profiles" does not exist')) {
        return { success: true, message: 'Connected to Supabase, but schema tables need to be created using schema.sql.' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err) {
    return { success: false, message: (err as Error).message || 'Connection failed' };
  }
}
