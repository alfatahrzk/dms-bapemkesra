/**
 * Utility Filter Kombinasi
 * Menyaring data berdasarkan Kategori, Jenis, Sifat, Bulan, dan Rentang Tanggal
 */
export function filterDocuments(documents, filters) {
    return documents.filter(doc => {
        if (filters.letter_type && doc.letter_type !== filters.letter_type) return false;
        if (filters.letter_nature && doc.letter_nature !== filters.letter_nature) return false;
        if (filters.month && doc.month !== filters.month) return false;
        
        // Rentang Tanggal (Validasi teks tanggal aman)
        if (filters.startDate && filters.endDate) {
            const docDate = new Date(doc.letter_date || doc.created_date);
            if (!isNaN(docDate.getTime())) {
                const start = new Date(filters.startDate);
                const end = new Date(filters.endDate);
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                if (docDate < start || docDate > end) return false;
            }
        }
        return true;
    });
}