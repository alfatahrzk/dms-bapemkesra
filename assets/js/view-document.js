import { supabase } from '../../services/supabase.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';

let documentId = null;
let fallbackCategory = "UMUM";

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = './login.html'; return; }

    renderNavbar('navbar-container');
    renderSidebar('sidebar-container', 'dashboard');

    const urlParams = new URLSearchParams(window.location.search);
    documentId = urlParams.get('id');

    if (!documentId) {
        alert("ID Berkas tidak valid!");
        window.location.href = './dashboard.html';
        return;
    }

    await loadDocumentDetails();
    setupNavigationListeners();
});

async function loadDocumentDetails() {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Dokumen tidak ditemukan.");

        fallbackCategory = data.category;

        // 1. Injeksi Data ke Metadata Label UI
        document.getElementById('lbl-category').textContent = data.category === 'UMUM' ? 'Surat Masuk Umum' : 'Surat Masuk Undangan';
        document.getElementById('lbl-month').textContent = data.month || '-';
        document.getElementById('lbl-created-date').textContent = data.created_date || '-';
        document.getElementById('lbl-source').textContent = data.source || '-';
        document.getElementById('lbl-letter-number').textContent = data.letter_number || '-';
        document.getElementById('lbl-letter-date').textContent = data.letter_date || '-';
        document.getElementById('lbl-letter-type').textContent = data.letter_type || '-';
        document.getElementById('lbl-letter-nature').textContent = data.letter_nature || '-';
        
        if (data.description) {
            document.getElementById('lbl-description').textContent = data.description;
        }

        // 2. Set Tautan Navigasi Shortcut Atas
        document.getElementById('link-edit-shortcut').href = `./edit-document.html?id=${data.id}`;
        document.getElementById('link-external-gdrive').href = data.gdrive_link || '#';

        // 3. Pemrosesan Transformasi Link Embed Google Drive Preview
        const iframe = document.getElementById('preview-frame');
        const embedUrl = convertToEmbedUrl(data.gdrive_link);
        
        if (embedUrl) {
            iframe.src = embedUrl;
            // Hilangkan loader iframe ketika halaman Google Docs selesai ter-load
            iframe.onload = () => {
                document.getElementById('iframe-loader').classList.add('d-none');
            };
        } else {
            document.getElementById('iframe-loader').innerHTML = `<i class="bi bi-exclamation-octagon text-danger fs-5 d-block"></i>Tautan Drive tidak valid.`;
        }

        // Matikan global loading skeleton, buka layout utama
        document.getElementById('global-loading').classList.add('d-none');
        document.getElementById('view-main-layout').classList.remove('d-none');

    } catch (error) {
        console.error("Gagal load detail berkas:", error);
        alert(error.message);
        window.location.href = './dashboard.html';
    }
}

/**
 * Helper Regex merubah link Drive biasa menjadi link view Iframe ter-embed
 */
function convertToEmbedUrl(url) {
    if (!url) return '';
    let fileId = '';
    
    // Pola regex 1: Format tautan /file/d/FILE_ID/view
    const patternD = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    // Pola regex 2: Format tautan ID parameter query lama ?id=FILE_ID
    const patternId = /[?&]id=([a-zA-Z0-9_-]+)/;

    if (patternD.test(url)) {
        fileId = url.match(patternD)[1];
    } else if (patternId.test(url)) {
        fileId = url.match(patternId)[1];
    }

    // Ubah susunannya menjadi struktur peninjauan berkas awan resmi milik Google
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
}

function setupNavigationListeners() {
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = `./documents.html?category=${fallbackCategory}`;
    });
}