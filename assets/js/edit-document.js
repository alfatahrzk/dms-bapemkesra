import { supabase } from '../../services/supabase.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';

let documentId = null;
let currentDocCategory = "UMUM";

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = './login.html'; return; }

    renderNavbar('navbar-container');
    renderSidebar('sidebar-container', 'dashboard');

    // Tangkap ID Dokumen dari Query Parameter String URL (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    documentId = urlParams.get('id');

    if (!documentId) {
        showGlobalError("ID Dokumen tidak ditemukan atau tidak valid.");
        return;
    }

    await loadDocumentDetails();
    setupNavigationListeners();
});

/**
 * Mengambil data lama dari database Supabase dan memasukkannya ke elemen form input
 */
async function loadDocumentDetails() {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .maybeSingle(); // Mengembalikan 1 objek data langsung

        if (error) throw error;
        if (!data) throw new Error("Data dokumen tidak ditemukan di sistem.");

        currentDocCategory = data.category;

        // Populate nilai kolom database ke form HTML DOM
        document.getElementById('category').value = data.category || 'UMUM';
        document.getElementById('month').value = data.month || 'Januari';
        document.getElementById('source').value = data.source || '';
        document.getElementById('letter_number').value = data.letter_number || '';
        document.getElementById('letter_type').value = data.letter_type || '';
        document.getElementById('letter_nature').value = data.letter_nature || 'Biasa';
        document.getElementById('gdrive_link').value = data.gdrive_link || '';
        document.getElementById('description').value = data.description || '';

        // Otomasi Validasi Parsing format Tanggal (letter_date) teks lama ke Datepicker HTML5
        if (data.letter_date) {
            const parsedDate = new Date(data.letter_date);
            // Cek apakah hasil konversi teks tanggal menghasilkan format valid YYYY-MM-DD
            if (!isNaN(parsedDate.getTime())) {
                document.getElementById('letter_date').value = parsedDate.toISOString().split('T')[0];
            }
        }

        // Matikan efek loading awal, tampilkan form utama
        document.getElementById('form-loading').classList.add('d-none');
        const form = document.getElementById('edit-document-form');
        form.classList.remove('d-none');
        form.addEventListener('submit', handleUpdateDocument);

    } catch (error) {
        console.error("Gagal memuat detail:", error);
        showGlobalError(error.message);
    }
}

/**
 * Handler Mengirimkan Perubahan Data Update ke Supabase
 */
async function handleUpdateDocument(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const alertContainer = document.getElementById('alert-container');

    btnSubmit.disabled = true;
    btnText.textContent = "Memperbarui...";
    btnSpinner.classList.remove('d-none');
    alertContainer.innerHTML = '';

    const payload = {
        category: document.getElementById('category').value,
        month: document.getElementById('month').value,
        source: document.getElementById('source').value.trim(),
        letter_number: document.getElementById('letter_number').value.trim(),
        letter_date: document.getElementById('letter_date').value,
        letter_type: document.getElementById('letter_type').value.trim(),
        letter_nature: document.getElementById('letter_nature').value,
        gdrive_link: document.getElementById('gdrive_link').value.trim(),
        description: document.getElementById('description').value.trim() || null,
        updated_at: new Date().toISOString() // Rekam jejak waktu perubahan berkas terbaru
    };

    try {
        const { error } = await supabase
            .from('documents')
            .update(payload)
            .eq('id', documentId);

        if (error) throw error;

        alertContainer.innerHTML = `
            <div class="alert alert-success small mb-3" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> Metadata Berkas Sukses Diperbarui! Mengalihkan...
            </div>
        `;

        setTimeout(() => {
            window.location.href = `./documents.html?category=${payload.category}`;
        }, 1500);

    } catch (error) {
        console.error("Gagal update:", error);
        btnSubmit.disabled = false;
        btnText.textContent = "Perbarui Dokumen";
        btnSpinner.classList.add('d-none');

        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show small mb-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Pembaruan gagal: ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

function setupNavigationListeners() {
    const goBack = () => {
        window.location.href = `./documents.html?category=${currentDocCategory}`;
    };
    document.getElementById('btn-back').addEventListener('click', goBack);
    document.getElementById('btn-cancel').addEventListener('click', goBack);
}

function showGlobalError(msg) {
    document.getElementById('form-loading').classList.add('d-none');
    document.getElementById('alert-container').innerHTML = `
        <div class="alert alert-danger small" role="alert">
            <i class="bi bi-x-octagon-fill me-2"></i> Error: ${msg}
        </div>
    `;
}