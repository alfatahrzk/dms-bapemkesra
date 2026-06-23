import { supabase } from '../services/supabase.js';

export function renderNavbar(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = `
        <header class="sticky-header w-100">
            <div class="d-flex align-items-center justify-content-between w-100">
                <div class="d-flex align-items-center gap-3">
                    <button id="sidebar-toggle" class="btn btn-light btn-sm px-2.5 py-1.5" aria-label="Toggle Navigation">
                        <i class="bi bi-list fs-5"></i>
                    </button>
                    
                    <div class="d-none d-md-flex flex-column text-start" style="line-height: 1.3;">
                        <span class="fw-semibold text-dark" style="font-size: 13px; letter-spacing: -0.01em;">Bagian Pemerintahan dan Kesejahteraan Rakyat</span>
                        <span class="text-muted" style="font-size: 11px; font-weight: 500;">Sekretariat Kota Surabaya</span>
                    </div>
                </div>
                
                <div class="d-flex align-items-center gap-3">
                    <div class="text-end d-none d-sm-block">
                        <div class="fw-semibold text-dark small" style="line-height:1;">Administrator</div>
                        <small class="text-muted" style="font-size:11px;">Active Session</small>
                    </div>
                    <button id="btn-logout" class="btn btn-outline-danger btn-sm font-semibold px-3 py-1.5" style="font-size:13px;">
                        <i class="bi bi-box-arrow-right me-1"></i> Keluar
                    </button>
                </div>
            </div>
        </header>
    `;

    // Pasang Event Handler untuk Mengontrol State Responsif Tubuh Layout
    document.getElementById('sidebar-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth >= 992) {
            document.body.classList.toggle('sidebar-collapsed');
        } else {
            document.body.classList.toggle('sidebar-mobile-open');
        }
    });

    document.getElementById('btn-logout').addEventListener('click', async () => {
        if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
            await supabase.auth.signOut();
            window.location.href = './login.html';
        }
    });
}