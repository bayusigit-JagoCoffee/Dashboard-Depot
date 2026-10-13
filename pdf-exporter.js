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
    let activeTabTitle = activeTabBtn ? activeTabBtn.innerText : 'Rekapan';

    // 2. Buat kontainer cetak PDF terpisah agar tampilan web utama tidak berantakan
    let pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '20px';
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    pdfContainer.style.color = '#333';

    // Klon isi tab aktif
    let contentClone = activeTab.cloneNode(true);
    contentClone.style.display = 'block';

    // 3. Susun Header PDF secara profesional
    pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #2c3e50; font-size: 18px; font-weight: bold;">REKAPITULASI ANALISIS PENJUALAN & WASTE - JAGO</h2>
            <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">
                Kategori: <b>${activeTabTitle}</b> | Periode: <b>${awal}</b> s/d <b>${akhir}</b>
            </p>
        </div>
        <div class="pdf-body">
            ${contentClone.innerHTML}
        </div>
    `;

    // 4. Pengaturan ukuran A4 Landscape dan margin rapi
    let opt = {
        margin:       [0.4, 0.4, 0.4, 0.4], // top, left, bottom, right (inch)
        filename:     `Rekapan_Penjualan_${activeTabTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${awal}_sd_${akhir}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    // 5. Jalankan fungsi konversi PDF
    html2pdf().set(opt).from(pdfContainer).save();
}
