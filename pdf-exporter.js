/**
 * Module Khusus Ekspor PDF Dashboard Analisis Penjualan & Waste
 */

function downloadPDFSales() {
    // 1. Dapatkan tab yang sedang aktif
    let activeTab = document.querySelector('#sectionSales .tab-content.active');
    if (!activeTab) {
        alert("Pilih tab analisis yang ingin di-download terlebih dahulu.");
        return;
    }

    let awal = document.getElementById('tglAwalSales').value || 'Awal';
    let akhir = document.getElementById('tglAkhirSales').value || 'Akhir';
    
    // Ambil nama tab aktif
    let activeTabBtn = document.querySelector('#sectionSales .tab-btn.active');
    let activeTabTitle = activeTabBtn ? activeTabBtn.innerText.trim() : 'Rekapan';

    // 2. Buat kontainer cetak PDF terpisah agar tampilan rapi & tidak terpotong
    let pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '15px';
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.color = '#333';
    pdfContainer.style.width = '1000px'; // Lebar tetap untuk pas A4 Landscape

    // Klon isi tab aktif
    let contentClone = activeTab.cloneNode(true);

    // 3. Susun Header PDF yang Rapi
    pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #2c3e50; padding-bottom: 8px;">
            <h2 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: bold; text-transform: uppercase;">
                REKAPITULASI ANALISIS PENJUALAN & WASTE - JAGO
            </h2>
            <p style="margin: 4px 0 0 0; color: #555; font-size: 11px;">
                Kategori: <b>${activeTabTitle}</b> | Periode: <b>${awal}</b> s/d <b>${akhir}</b>
            </p>
        </div>
        <div class="pdf-content-body">
            ${contentClone.innerHTML}
        </div>
    `;

    // 4. Perbaiki Style Elemen di Dalam Kloning PDF agar Tidak Terpotong
    // A. Hilangkan Scrollbar pada Wrapper Tabel
    let wrappers = pdfContainer.querySelectorAll('.table-wrapper');
    wrappers.forEach(w => {
        w.style.overflow = 'visible';
        w.style.border = '1px solid #bdc3c7';
        w.style.marginBottom = '15px';
    });

    // B. Rapikan Ukuran Tabel & Font
    let tables = pdfContainer.querySelectorAll('table');
    tables.forEach(t => {
        t.style.width = '100%';
        t.style.fontSize = '10px';
        t.style.borderCollapse = 'collapse';
    });

    let ths = pdfContainer.querySelectorAll('th, td');
    ths.forEach(cell => {
        cell.style.padding = '4px 5px';
        cell.style.border = '1px solid #cbd5e1';
    });

    // C. Sesuaikan Ukuran Grafik Canvas (Jika Ada)
    let charts = pdfContainer.querySelectorAll('.chart-box');
    charts.forEach(c => {
        c.style.height = '240px';
        c.style.width = '100%';
        c.style.marginBottom = '15px';
    });

    // D. Sesuaikan Grid Layout agar Menjadi 2 Kolom Seimbang saat Dicetak
    let grids = pdfContainer.querySelectorAll('.grid-2');
    grids.forEach(g => {
        g.style.display = 'flex';
        g.style.gap = '15px';
        let cols = g.children;
        for(let col of cols) {
            col.style.flex = '1';
        }
    });

    // 5. Pengaturan Cetak A4 Landscape dengan Margin Presisi
    let opt = {
        margin:       [0.3, 0.3, 0.3, 0.3], // top, left, bottom, right (inch)
        filename:     `Rekapan_Penjualan_${activeTabTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${awal}_sd_${akhir}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    // 6. Jalankan Proses Download PDF
    html2pdf().set(opt).from(pdfContainer).save();
}
