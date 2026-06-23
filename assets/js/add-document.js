import { supabase } from '../../services/supabase.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './login.html';
        return;
    }

    renderNavbar('navbar-container');
    renderSidebar('sidebar-container', 'dashboard');

    const form = document.getElementById('add-document-form');
    if (form) {
        form.addEventListener('submit', handleInsertDocument);
    }
});

async function handleInsertDocument(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const alertContainer = document.getElementById('alert-container');

    btnSubmit.disabled = true;
    btnText.textContent = "Menyimpan Berkas...";
    btnSpinner.classList.remove('d-none');
    alertContainer.innerHTML = '';

    // Otomatisasi tanggal sistem saat ini (Format: YYYY-MM-DD)
    const today = new Date();
    const autoCreatedDate = today.toISOString().split('T')[0]; 

    const payload = {
        category: document.getElementById('category').value,
        month: document.getElementById('month').value,
        created_date: autoCreatedDate, // Otomatis direkam oleh sistem
        source: document.getElementById('source').value.trim(),
        letter_number: document.getElementById('letter_number').value.trim(),
        letter_date: document.getElementById('letter_date').value, // Mengambil value dari datepicker
        letter_type: document.getElementById('letter_type').value.trim(),
        letter_nature: document.getElementById('letter_nature').value,
        gdrive_link: document.getElementById('gdrive_link').value.trim(),
        description: document.getElementById('description').value.trim() || null
    };

    try {
        const { error } = await supabase
            .from('documents')
            .insert([payload]);

        if (error) throw error;

        alertContainer.innerHTML = `
            <div class="alert alert-success small mb-3" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> Dokumen Berhasil Ditambahkan! Mengalihkan halaman...
            </div>
        `;

        setTimeout(() => {
            window.location.href = `./documents.html?category=${payload.category}`;
        }, 1500);

    } catch (error) {
        console.error("Gagal Menyimpan:", error);
        
        btnSubmit.disabled = false;
        btnText.textContent = "Simpan Dokumen";
        btnSpinner.classList.add('d-none');

        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show small mb-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Gagal menyimpan data: ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}