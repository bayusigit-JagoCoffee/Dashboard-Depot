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
    
    let activeTabBtn = document.querySelector('#sectionSales .tab-btn.active');
    let activeTabTitle = activeTabBtn ? activeTabBtn.innerText.trim() : 'Rekapan';

    // 2. Buat kontainer cetak PDF terpisah
    let pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '15px';
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.color = '#333';
    pdfContainer.style.width = '980px'; // Ukuran presisi A4 Landscape

    // Klon isi tab aktif
    let contentClone = activeTab.cloneNode(true);

    // 3. Konversi Canvas Chart.js menjadi Gambar PNG
    let originalCanvases = activeTab.querySelectorAll('canvas');
    let clonedCanvases = contentClone.querySelectorAll('canvas');

    originalCanvases.forEach((origCanvas, idx) => {
        if (clonedCanvases[idx]) {
            let dataUrl = origCanvas.toDataURL('image/png');
            let img = document.createElement('img');
            img.src = dataUrl;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxHeight = '240px';
            img.style.display = 'block';
            img.style.margin = '0 auto';

            let canvasParent = clonedCanvases[idx].parentNode;
            canvasParent.replaceChild(img, clonedCanvases[idx]);
        }
    });

    // 4. ATUR ATURAN PEMISAHAN HALAMAN (PAGE BREAK)
    // A. Pengaturan Judul (h3): Jangan berpisah dengan konten di bawahnya!
    let headings = contentClone.querySelectorAll('h3');
    headings.forEach((h, index) => {
        h.style.pageBreakAfter = 'avoid';
        h.style.breakAfter = 'avoid';
        h.style.marginTop = '10px';
        h.style.marginBottom = '10px';

        // Jika ada lebih dari satu sub-judul h3 dalam satu tab, pindahkan h3 berikutnya ke halaman baru
        if (index > 0) {
            h.style.pageBreakBefore = 'always';
            h.style.breakBefore = 'page';
            h.style.paddingTop = '15px';
        }
    });

    // B. Cegah Grafik dan Tabel Terpotong di Tengah
    let blocks = contentClone.querySelectorAll('.chart-box, img, .table-wrapper, .grid-2');
    blocks.forEach(block => {
        block.style.pageBreakInside = 'avoid';
        block.style.breakInside = 'avoid';
        block.style.marginBottom = '15px';
    });

    // 5. Susun Header PDF
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

    // 6. Rapikan Ukuran Tabel & Grid Khusus PDF
    let wrappers = pdfContainer.querySelectorAll('.table-wrapper');
    wrappers.forEach(w => {
        w.style.overflow = 'visible';
        w.style.border = '1px solid #bdc3c7';
        w.style.marginBottom = '15px';
    });

    let tables = pdfContainer.querySelectorAll('table');
    tables.forEach(t => {
        t.style.width = '100%';
        t.style.fontSize = '9.5px';
        t.style.borderCollapse = 'collapse';
    });

    let cells = pdfContainer.querySelectorAll('th, td');
    cells.forEach(cell => {
        cell.style.padding = '5px 5px';
        cell.style.border = '1px solid #cbd5e1';
    });

    let grids = pdfContainer.querySelectorAll('.grid-2');
    grids.forEach(g => {
        g.style.display = 'flex';
        g.style.gap = '15px';
        let cols = g.children;
        for(let col of cols) {
            col.style.flex = '1';
        }
    });

    // 7. Konfigurasi Ekspor PDF
    let opt = {
        margin:       [0.3, 0.3, 0.3, 0.3], // top, left, bottom, right (inch)
        filename:     `Rekapan_Penjualan_${activeTabTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${awal}_sd_${akhir}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };

    // 8. Simpan File PDF
    html2pdf().set(opt).from(pdfContainer).save();
}
