import { supabase } from '../../services/supabase.js';
import { renderNavbar } from '../../components/navbar.js';
import { renderSidebar } from '../../components/sidebar.js';
import { searchDocuments } from '../../utils/search.js';
import { filterDocuments } from '../../utils/filter.js';
import { paginateDocuments, renderPaginationUI } from '../../utils/pagination.js';

let masterDocuments = [];
let filteredDocuments = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20;
let currentCategory = "";

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = './login.html'; return; }

    const urlParams = new URLSearchParams(window.location.search);
    // Default diset ke 'UMUM' sesuai struktur data asli Anda
    currentCategory = urlParams.get('category') || 'UMUM';
    
    // Pemetaan teks dinamis agar judul halaman tetap rapi saat dipresentasikan
    const pageTitleText = currentCategory === 'UMUM' ? 'Surat Masuk Umum' : 'Surat Masuk Undangan';
    document.getElementById('page-title').textContent = pageTitleText;
    
    renderNavbar('navbar-container');
    // Sinkronisasi status aktif menu sidebar
    renderSidebar('sidebar-container', currentCategory);

    await fetchDocuments();
    setupEventListeners();
});

async function fetchDocuments() {
    try {
        // Mengembalikan query asli menggunakan filter kategori dan soft-delete
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('category', currentCategory)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        masterDocuments = data || [];
        populateFilterDropdowns(masterDocuments);
        applyFiltersAndRender(1);

        document.getElementById('table-loading').classList.add('d-none');
        document.getElementById('table-wrapper').classList.remove('d-none');
    } catch (error) {
        console.error("Fetch data error:", error);
        alert("Gagal memuat daftar dokumen.");
    }
}

function populateFilterDropdowns(docs) {
    const types = [...new Set(docs.map(d => d.letter_type).filter(Boolean))];
    const natures = [...new Set(docs.map(d => d.letter_nature).filter(Boolean))];
    const months = [...new Set(docs.map(d => d.month).filter(Boolean))];

    const fillSelect = (id, items) => {
        const select = document.getElementById(id);
        // Pertahankan opsi default agar tidak tertumpuk saat pindah kategori
        select.innerHTML = `<option value="">- Semua ${id === 'filter-type' ? 'Jenis' : id === 'filter-nature' ? 'Sifat' : 'Bulan'} -</option>`;
        items.forEach(item => {
            select.innerHTML += `<option value="${item}">${item}</option>`;
        });
    };

    fillSelect('filter-type', types);
    fillSelect('filter-nature', natures);
    fillSelect('filter-month', months);
}

function setupEventListeners() {
    const triggerElements = ['search-input', 'filter-type', 'filter-nature', 'filter-month', 'filter-start-date', 'filter-end-date'];
    triggerElements.forEach(id => {
        document.getElementById(id).addEventListener('input', () => applyFiltersAndRender(1));
    });

    document.getElementById('btn-reset-filter').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-nature').value = '';
        document.getElementById('filter-month').value = '';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        applyFiltersAndRender(1);
    });
}

function applyFiltersAndRender(page = 1) {
    currentPage = page;
    const keyword = document.getElementById('search-input').value;
    const filters = {
        letter_type: document.getElementById('filter-type').value,
        letter_nature: document.getElementById('filter-nature').value,
        month: document.getElementById('filter-month').value,
        startDate: document.getElementById('filter-start-date').value,
        endDate: document.getElementById('filter-end-date').value
    };

    let result = searchDocuments(masterDocuments, keyword);
    result = filterDocuments(result, filters);
    filteredDocuments = result;

    const pagination = paginateDocuments(filteredDocuments, currentPage, ITEMS_PER_PAGE);
    renderTable(pagination.data);
    
    const startNum = filteredDocuments.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endNum = Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length);
    document.getElementById('pagination-info').textContent = `Menampilkan ${startNum}-${endNum} dari ${filteredDocuments.length} data`;

    renderPaginationUI('pagination-container', pagination.totalPages, currentPage, (targetPage) => {
        applyFiltersAndRender(targetPage);
    });
}

function renderTable(docs) {
    const tbody = document.getElementById('docs-tbody');
    if (docs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted"><i class="bi bi-patch-question fs-3 d-block mb-2"></i>Tidak ada dokumen yang cocok dengan filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = docs.map(doc => `
        <tr>
            <td class="ps-4 text-secondary">${doc.created_date || '-'}</td>
            <td class="fw-semibold text-dark">${doc.source || '-'}</td>
            <td><code class="text-dark bg-light px-1.5 py-0.5 rounded">${doc.letter_number || '-'}</code></td>
            <td>${doc.letter_date || '-'}</td>
            <td><span class="badge bg-secondary opacity-75">${doc.letter_type || '-'}</span></td>
            <td><span class="badge bg-light text-dark border">${doc.letter_nature || '-'}</span></td>
            <td class="text-center pe-4">
                <div class="btn-group">
                    <a href="./view-document.html?id=${doc.id}" class="btn btn-outline-primary btn-xs px-2 py-1 small" style="font-size:0.75rem;"><i class="bi bi-eye"></i> View</a>
                    <a href="./edit-document.html?id=${doc.id}" class="btn btn-outline-warning btn-xs px-2 py-1 small" style="font-size:0.75rem;"><i class="bi bi-pencil"></i> Edit</a>
                    <button data-id="${doc.id}" class="btn btn-outline-danger btn-xs px-2 py-1 btn-delete small" style="font-size:0.75rem;"><i class="bi bi-trash"></i> Hapus</button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm("Apakah Anda yakin ingin mengarsipkan (soft delete) dokumen ini?")) {
                await softDeleteDocument(id);
            }
        });
    });
}

async function softDeleteDocument(id) {
    try {
        const { error } = await supabase
            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        masterDocuments = masterDocuments.filter(d => d.id !== id);
        applyFiltersAndRender(currentPage);
    } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal mengarsipkan dokumen.");
    }
}