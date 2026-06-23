/**
 * Supabase Service Client
 * Menginisialisasi koneksi ke Supabase menggunakan ES6 Modules.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../assets/js/config.js';

// Mengimport Supabase Client langsung dari CDN resmi berbasis ESM
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("YOUR_SUPABASE")) {
    console.warn("Peringatan: Kredensial Supabase belum dikonfigurasi dengan benar di assets/js/config.js");
}

// Inisialisasi client tunggal (Singleton) untuk digunakan di seluruh aplikasi
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);