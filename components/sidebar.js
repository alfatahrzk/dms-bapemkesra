export function renderSidebar(elementId, activeMenu = 'dashboard') {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = `
        <div id="sidebar" class="d-flex flex-column">
            <div class="p-4 border-bottom d-flex align-items-center gap-2.5" style="height: 64px; border-color: var(--border-color) !important;">
                <img src="../assets/images/surabaya-logo.png" alt="Logo Surabaya" style="height: 30px; width: auto; flex-shrink: 0; object-fit: contain;">
                
                <span class="fw-bold tracking-tight text-dark sb-header-text" style="font-size: 14px; margin-left: 0.3rem;">BAPEMKESRA</span>
            </div>
            
            <div class="list-group list-group-flush flex-grow-1 px-3 py-4">
                <a href="./dashboard.html" class="list-group-item list-group-item-action border-0 mb-1.5 ${activeMenu === 'dashboard' ? 'active' : ''}">
                    <i class="bi bi-speedometer2 me-2.5"></i> <span class="sb-text">Dashboard</span>
                </a>
                
                <div class="text-muted small fw-semibold px-2 pt-3 pb-2 text-uppercase sb-text" style="font-size: 10px; letter-spacing: 0.05em;">Dokumen Internal</div>
                
                <a href="./documents.html?category=UMUM" class="list-group-item list-group-item-action border-0 mb-1.5 ${activeMenu === 'UMUM' ? 'active' : ''}">
                    <i class="bi bi-file-earmark-text me-2.5"></i> <span class="sb-text">Surat Masuk Umum</span>
                </a>
                <a href="./documents.html?category=UNDANGAN" class="list-group-item list-group-item-action border-0 ${activeMenu === 'UNDANGAN' ? 'active' : ''}">
                    <i class="bi bi-envelope me-2.5"></i> <span class="sb-text">Surat Masuk Undangan</span>
                </a>
            </div>
            
            <div class="p-3 border-top text-center sb-text" style="border-color: var(--border-color) !important;">
                <small class="text-muted" style="font-size: 11px; font-weight: 500;">DMS Engine &copy; 2026</small>
            </div>
        </div>
        
        <div class="sidebar-backdrop" id="sidebar-backdrop-element"></div>
    `;

    // Pasang listener penutup otomatis jika pengguna menekan backdrop buram di smartphone
    setTimeout(() => {
        const backdrop = document.getElementById('sidebar-backdrop-element');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                document.body.classList.remove('sidebar-mobile-open');
            });
        }
    }, 50);
}