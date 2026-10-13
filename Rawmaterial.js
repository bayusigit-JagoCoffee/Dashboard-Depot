/**
 * Module Khusus Manajemen Stok Bahan Baku & Auto-Import Stocklist Gudang
 */

// Master Konversi Satuan Kemasan ke Gram/ML
const masterBahanBaku = {
    'Arabica Coffee Beans 1000gr': { konversiGr: 6000, satuan: 'Box' },
    'Aren Sugar': { konversiGr: 5300, satuan: 'Jrg' },
    'Brown Sugar 5000 Gr': { konversiGr: 5000, satuan: 'Jrg' },
    'Choco Powder': { konversiGr: 12000, satuan: 'Box' },
    'Condensed Milk Carnation': { konversiGr: 16000, satuan: 'Box' },
    'Garam Gurih Miwon 500gr': { konversiGr: 500, satuan: 'Pack' },
    'Granulated Sugar 50000gr': { konversiGr: 50000, satuan: 'Sack' },
    'Lemon Extract 1000ml': { konversiGr: 1000, satuan: 'Botol' },
    'Lemon Puree 5000ml': { konversiGr: 5000, satuan: 'Jrg' },
    'Liquid Creamer': { konversiGr: 1000, satuan: 'Pcs' },
    'Matcha Powder Voya 1000 Gr': { konversiGr: 1000, satuan: 'Pack' },
    'Melcreamer 25000gr': { konversiGr: 25000, satuan: 'Sack' },
    'Oatside Barista Blend 1000ml': { konversiGr: 1000, satuan: 'Pcs' },
    'Orange Valencia NFC': { konversiGr: 5000, satuan: 'Jrg' },
    'Robusta Coffee Beans 1000gr': { konversiGr: 5000, satuan: 'Box' },
    'Susu UHT Diamond 1000ml': { konversiGr: 12000, satuan: 'Box' },
    'Syrup Salted Caramel': { konversiGr: 5000, satuan: 'Jrg' },
    'Syrup Vanilla': { konversiGr: 6960, satuan: 'Box' }
};

// Breakdown Resep Produk ke Bahan Mentah (dalam gram/ml per 1 Batch Produksi)
const resepBahanBakuPerBatch = {
    'Kopi Susu JAGO': {
        'Melcreamer 25000gr': 12500,
        'Aren Sugar': 12500,               // Dari Base Kopsu
        'Condensed Milk Carnation': 12500, // Dari Base Kopsu
        'Robusta Coffee Beans 1000gr': 26462.5, // Dari Base Robusta (72500 * 365 / 1000)
        'Susu UHT Diamond 1000ml': 70000
    },
    'Salted Caramel Latte': {
        'Syrup Salted Caramel': 18250,
        'Granulated Sugar 50000gr': 9000,  // Dari Simpel Syrup
        'Robusta Coffee Beans 1000gr': 27922.5, // Dari Base Robusta (76500 * 365 / 1000)
        'Melcreamer 25000gr': 9000,
        'Susu UHT Diamond 1000ml': 67250,
        'Garam Gurih Miwon 500gr': 300
    },
    'Matcha Latte': {
        'Matcha Powder Voya 1000 Gr': 1800,
        'Melcreamer 25000gr': 2250,
        'Susu UHT Diamond 1000ml': 6350,
        'Granulated Sugar 50000gr': 1200   // Dari Simpel Syrup
    },
    'JAGO Americano': {
        'Arabica Coffee Beans 1000gr': 5696 // Dari Base Arabica (17800 * 320 / 1000)
    },
    'Citrus Cold Brew': {
        'Arabica Coffee Beans 1000gr': 4448, // Dari Base Arabica (13900 * 320 / 1000)
        'Granulated Sugar 50000gr': 3200,   // Dari Simpel Syrup
        'Lemon Extract 1000ml': 450,
        'Lemon Puree 5000ml': 450
    },
    'Kopi Susu Oatside': {
        'Oatside Barista Blend 1000ml': 7250,
        'Melcreamer 25000gr': 1800,
        'Aren Sugar': 1530,
        'Robusta Coffee Beans 1000gr': 2708.3 // Dari Base Robusta (7420 * 365 / 1000)
    },
    'JAGO Chocolate': {
        'Choco Powder': 1250,
        'Susu UHT Diamond 1000ml': 14500,
        'Aren Sugar': 2250
    },
    'Mont Blanc Shake': {
        'Liquid Creamer': 6500,
        'Arabica Coffee Beans 1000gr': 2016, // Dari Base Arabica (6300 * 320 / 1000)
        'Brown Sugar 5000 Gr': 800,
        'Granulated Sugar 50000gr': 1200,    // Dari Simpel Syrup
        'Orange Valencia NFC': 3200
    },
    'Vanilla Latte': {
        'Susu UHT Diamond 1000ml': 9100,
        'Syrup Vanilla': 2250,
        'Robusta Coffee Beans 1000gr': 2427.25 // Dari Base Robusta (6650 * 365 / 1000)
    }
};

// Variabel Penyimpan Stok Gudang
let stokGudangUser = {};

// Hitung Kebutuhan Bahan Baku berdasarkan Rencana Produksi
function hitungKebutuhanBahanBaku() {
    let kebutuhanGram = {};
    Object.keys(masterBahanBaku).forEach(b => kebutuhanGram[b] = 0);

    masterProdukRules.forEach((p, index) => {
        let batchElem = document.getElementById(`rekBatch_${index}`);
        if (batchElem) {
            let batchText = batchElem.innerText.replace(' Batch', '').trim();
            let numBatch = parseFloat(batchText) || 0;

            if (numBatch > 0 && resepBahanBakuPerBatch[p.name]) {
                let resep = resepBahanBakuPerBatch[p.name];
                for (let bahan in resep) {
                    if (kebutuhanGram[bahan] !== undefined) {
                        kebutuhanGram[bahan] += resep[bahan] * numBatch;
                    }
                }
            }
        }
    });

    renderTabelBahanBaku(kebutuhanGram);
}

// Render Tabel Stok Gudang & Restock Alert
function renderTabelBahanBaku(kebutuhanGram) {
    let tbody = document.querySelector("#tblRawMaterials tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let no = 1;
    for (let bahan in masterBahanBaku) {
        let meta = masterBahanBaku[bahan];
        let reqGr = kebutuhanGram[bahan] || 0;
        
        let reqKemasan = (reqGr / meta.konversiGr).toFixed(2);
        let stokCurrent = parseFloat(stokGudangUser[bahan]) || 0;
        let selisihKemasan = stokCurrent - reqKemasan;
        
        let statusBadge = '';
        if (stokCurrent < reqKemasan) {
            let kurang = (reqKemasan - stokCurrent).toFixed(2);
            statusBadge = `<span style="background-color:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">🔴 Kritis (Kurang ${kurang} ${meta.satuan})</span>`;
        } else if (selisihKemasan <= 1) {
            statusBadge = `<span style="background-color:#f1c40f; color:#333; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">🟡 Menipis</span>`;
        } else {
            statusBadge = `<span style="background-color:#2ecc71; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">🟢 Aman</span>`;
        }

        let rowHtml = `
            <tr>
                <td><b>${no++}</b></td>
                <td class="text-left">${bahan}</td>
                <td><b>${meta.satuan}</b></td>
                <td>${reqGr.toLocaleString('id-ID')} gr/ml</td>
                <td><b style="color:#2980b9;">${reqKemasan} ${meta.satuan}</b></td>
                <td>
                    <input type="number" id="stokGudang_${no}" value="${stokCurrent.toFixed(2)}" min="0" step="0.1" style="width:80px; text-align:center; font-weight:bold;" oninput="updateStokGudangValue('${bahan}', this.value)" /> ${meta.satuan}
                </td>
                <td>${statusBadge}</td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    }
}

function updateStokGudangValue(bahan, val) {
    stokGudangUser[bahan] = parseFloat(val) || 0;
    hitungKebutuhanBahanBaku();
}

// Fungsi Parser & Import File Excel / CSV Stocklist Gudang
function handleImportStocklist(file) {
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let firstSheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to json array of arrays
        let rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let tempAggregat = {};
        Object.keys(masterBahanBaku).forEach(b => tempAggregat[b] = 0);

        // Abaikan baris 1-8 (index 0-7), baca mulai baris ke-9
        for (let i = 8; i < rawJson.length; i++) {
            let row = rawJson[i];
            if (!row || row.length < 10) continue;

            let prodName = row[2] ? row[2].toString().trim() : ''; // Kolom C
            let stockQty = parseFloat(row[9]) || 0;                // Kolom J

            if (!prodName || stockQty === 0) continue;

            // Pencocokan ke Master Bahan Baku
            for (let bahanMaster in masterBahanBaku) {
                let cleanMasterName = bahanMaster.replace(/1000gr|5000gr|25000gr|1000ml|5000ml|500gr|Gr/gi, '').trim().toLowerCase();
                let cleanProdName = prodName.toLowerCase();

                // Cek pencocokan spesifik
                let isMatch = false;
                if (bahanMaster === 'Syrup Salted Caramel' && cleanProdName.includes('syrup salted caramel')) isMatch = true;
                else if (bahanMaster === 'Syrup Vanilla' && cleanProdName.includes('syrup vanilla')) isMatch = true;
                else if (bahanMaster === 'Susu UHT Diamond 1000ml' && cleanProdName.includes('susu uht diamond')) isMatch = true;
                else if (bahanMaster === 'Aren Sugar' && (cleanProdName === 'aren sugar' || cleanProdName === 'aren sugar a2')) isMatch = true;
                else if (!bahanMaster.includes('Syrup') && cleanProdName.includes(cleanMasterName)) isMatch = true;

                if (isMatch) {
                    if (bahanMaster === 'Syrup Salted Caramel') {
                        // Stock Qty di Excel dlm ML -> konversi ke Jerigen (5000 ML)
                        tempAggregat[bahanMaster] += (stockQty / 5000);
                    } else if (bahanMaster === 'Syrup Vanilla') {
                        // Stock Qty di Excel dlm ML -> konversi ke Box (6960 ML)
                        tempAggregat[bahanMaster] += (stockQty / 6960);
                    } else if (bahanMaster === 'Susu UHT Diamond 1000ml') {
                        // Stock Qty di Excel dlm Pcs -> konversi ke Box (12 Pcs)
                        tempAggregat[bahanMaster] += (stockQty / 12);
                    } else {
                        tempAggregat[bahanMaster] += stockQty;
                    }
                    break;
                }
            }
        }

        stokGudangUser = tempAggregat;
        hitungKebutuhanBahanBaku();
        alert("Berhasil mengimpor dan mengonversi Stocklist Gudang!");
    };

    reader.readAsArrayBuffer(file);
}
