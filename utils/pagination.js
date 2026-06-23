/**
 * Utility Pagination & Rendering UI Control
 */
export function paginateDocuments(documents, page, limit = 20) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return {
        data: documents.slice(startIndex, endIndex),
        totalItems: documents.length,
        totalPages: Math.ceil(documents.length / limit)
    };
}

export function renderPaginationUI(elementId, totalPages, currentPage, onPageChange) {
    const container = document.getElementById(elementId);
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = `<nav><ul class="pagination pagination-sm justify-content-end mb-0">`;
    
    // Tombol Previous
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Sebelumnya</a>
    </li>`;

    // Render Halaman Terdekat (Maksimal 5 navigasi angka)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }

    // Tombol Next
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Berikutnya</a>
    </li>`;

    html += `</ul></nav>`;
    container.innerHTML = html;

    // Pasang Event Klik ke Elemen Angka Navigasi
    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = parseInt(e.target.getAttribute('data-page'));
            if (targetPage && targetPage !== currentPage) {
                onPageChange(targetPage);
            }
        });
    });
}