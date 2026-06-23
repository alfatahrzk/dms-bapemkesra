import { supabase } from '../../services/supabase.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Route Protection Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './login.html';
        return;
    }

    // 2. Render Shared Layout Components
    renderNavbar('navbar-container');
    renderSidebar('sidebar-container', 'dashboard');

    // 3. Load Dashboard Data Metrics
    await initDashboardData();
});

async function initDashboardData() {
    try {
        // Ambil metrik ringkas & 5 data terbaru secara paralel
        const [statsResponse, recentResponse] = await Promise.all([
            supabase.from('documents').select('category, letter_type, letter_nature').is('deleted_at', null),
            supabase.from('documents').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(5)
        ]);

        if (statsResponse.error) throw statsResponse.error;
        if (recentResponse.error) throw recentResponse.error;

        // 4. Kalkulasi Metrik via Set (Client-Side)
        const allDocs = statsResponse.data;
        const totalDocs = allDocs.length;
        
        const categories = new Set(allDocs.map(d => d.category).filter(Boolean));
        const types = new Set(allDocs.map(d => d.letter_type).filter(Boolean));
        const natures = new Set(allDocs.map(d => d.letter_nature).filter(Boolean));

        // Injeksi ke UI Dom Metrik
        document.getElementById('stat-total-docs').textContent = totalDocs;
        document.getElementById('stat-total-categories').textContent = categories.size;
        document.getElementById('stat-total-types').textContent = types.size;
        document.getElementById('stat-total-natures').textContent = natures.size;

        // 5. Render Data Tabel Dokumen Terbaru
        renderRecentTable(recentResponse.data);

        // Switch Loading State Off
        document.getElementById('dashboard-loading').classList.add('d-none');
        document.getElementById('dashboard-main-content').classList.remove('d-none');

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
        alert("Terjadi kesalahan koneksi data ke Supabase.");
    }
}

function renderRecentTable(documents) {
    const tbody = document.getElementById('recent-docs-tbody');
    
    if (documents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-folder-x fs-4 d-block mb-1"></i> Belum ada data dokumen.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = documents.map(doc => `
        <tr>
            <td class="ps-4 text-secondary">${doc.created_date || '-'}</td>
            <td class="fw-semibold text-dark">${doc.source || '-'}</td>
            <td><code class="text-dark bg-light px-1.5 py-0.5 rounded">${doc.letter_number || '-'}</code></td>
            <td>${doc.letter_date || '-'}</td>
            <td><span class="badge bg-secondary opacity-75">${doc.letter_type || '-'}</span></td>
            <td><span class="badge bg-light text-dark border">${doc.letter_nature || '-'}</span></td>
            <td class="text-center pe-4">
                <a href="./view-document.html?id=${doc.id}" class="btn btn-link btn-sm p-1 text-primary" title="View & Download">
                    <i class="bi bi-eye"></i> View
                </a>
            </td>
        </tr>
    `).join('');
}