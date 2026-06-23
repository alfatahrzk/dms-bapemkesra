/**
 * Utility Pencarian Parsial
 * Mencari kecocokan kata kunci berdasarkan Nomor Surat atau Asal Surat
 */
export function searchDocuments(documents, keyword) {
    if (!keyword) return documents;
    const k = keyword.toLowerCase().trim();
    
    return documents.filter(doc => 
        (doc.letter_number && doc.letter_number.toLowerCase().includes(k)) ||
        (doc.source && doc.source.toLowerCase().includes(k))
    );
}