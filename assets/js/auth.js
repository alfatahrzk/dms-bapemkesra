import { supabase } from '../../services/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Jalankan proteksi halaman login: Jika sudah login, paksa ke dashboard
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = './dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Fungsi Handler Event Login
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    const btnLogin = document.getElementById('btn-login');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const alertContainer = document.getElementById('alert-container');

    // 1. Trigger Loading State (UI/UX Requirement)
    btnLogin.disabled = true;
    btnText.textContent = "Memverifikasi...";
    btnSpinner.classList.remove('d-none');
    alertContainer.innerHTML = ''; // bersihkan error sebelumnya

    try {
        // 2. Kirim data auth ke Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // 3. Jika sukses, pindahkan ke halaman dashboard
        window.location.href = './dashboard.html';

    } catch (error) {
        // 4. Empty/Error State Notification jika gagal
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show small" role="alert">
                ${translateError(error.message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // 5. Matikan Loading State kembali ke normal
        btnLogin.disabled = false;
        btnText.textContent = "Masuk ke Aplikasi";
        btnSpinner.classList.add('d-none');
    }
}

/**
 * Helper menerjemahkan error bawaan Supabase agar ramah saat presentasi dosen
 */
function translateError(msg) {
    if (msg.includes("Invalid login credentials")) {
        return "Email atau password yang Anda masukkan salah.";
    }
    return msg;
}