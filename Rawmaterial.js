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
        'Aren Sugar': 12500,               
        'Condensed Milk Carnation': 12500, 
        'Robusta Coffee Beans 1000gr': 26462.5, 
        'Susu UHT Diamond 1000ml': 70000
    },
    'Salted Caramel Latte': {
        'Syrup Salted Caramel': 18250,
        'Granulated Sugar 50000gr': 9000,  
        'Robusta Coffee Beans 1000gr': 27922.5, 
        'Melcreamer 25000gr': 9000,
        'Susu UHT Diamond 1000ml': 67250,
        'Garam Gurih Miwon 500gr': 300
    },
    'Matcha Latte': {
        'Matcha Powder Voya 1000 Gr': 1800,
        'Melcreamer 25000gr': 2250,
        'Susu UHT Diamond 1000ml': 6350,
        'Granulated Sugar 50000gr': 1200   
    },
    'JAGO Americano': {
        'Arabica Coffee Beans 1000gr': 5696 
    },
    'Citrus Cold Brew': {
        'Arabica Coffee Beans 1000gr': 4448, 
        'Granulated Sugar 50000gr': 3200,   
        'Lemon Extract 1000ml': 450,
        'Lemon Puree 5000ml': 450
    },
    'Kopi Susu Oatside': {
        'Oatside Barista Blend 1000ml': 7250,
        'Melcreamer 25000gr': 1800,
        'Aren Sugar': 1530,
        'Robusta Coffee Beans 1000gr': 2708.3 
    },
    'JAGO Chocolate': {
        'Choco Powder': 1250,
        'Susu UHT Diamond 1000ml': 14500,
        'Aren Sugar': 2250
    },
    'Mont Blanc Shake': {
        'Liquid Creamer': 6500,
        'Arabica Coffee Beans 1000gr': 2016, 
        'Brown Sugar 5000 Gr': 800,
        'Granulated Sugar 50000gr': 1200,    
        'Orange Valencia NFC': 3200
    },
    'Vanilla Latte': {
        'Susu UHT Diamond 1000ml': 9100,
        'Syrup Vanilla': 2250,
        'Robusta Coffee Beans 1000gr': 2427.25 
    }
};

// Variabel Penyimpan Stok Gudang
let stokGudangUser = {};

// Hitung Kebutuhan Bahan Baku berdasarkan Rencana Produksi
function hitungKebutuhanBahanBaku() {
    let kebutuhanGram = {};
    Object.keys(masterBahanBaku).forEach(b => kebutuhanGram[b] = 0);

    if (typeof masterProdukRules !== 'undefined') {
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
    }

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

// Parser & Auto Import Excel / CSV Stocklist Gudang
function handleImportStocklist(file) {
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: 'array' });
            let firstSheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[firstSheetName];
            
            let rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            let tempAggregat = {};
            Object.keys(masterBahanBaku).forEach(b => tempAggregat[b] = 0);

            // Pindai setiap baris mulai baris ke-1 (setelah header)
            for (let i = 0; i < rawJson.length; i++) {
                let row = rawJson[i];
                if (!row || row.length < 3) continue;

                // Cari kolom Product Name dan Stock Qty
                let prodName = '';
                let stockQty = 0;

                for (let j = 0; j < row.length; j++) {
                    let cell = row[j] ? row[j].toString().trim() : '';
                    if (cell.toLowerCase().includes('beans') || cell.toLowerCase().includes('sugar') || cell.toLowerCase().includes('powder') || cell.toLowerCase().includes('milk') || cell.toLowerCase().includes('syrup') || cell.toLowerCase().includes('uht') || cell.toLowerCase().includes('creamer') || cell.toLowerCase().includes('lemon') || cell.toLowerCase().includes('matcha') || cell.toLowerCase().includes('valencia')) {
                        prodName = cell;
                    }
                    if (typeof row[j] === 'number' && row[j] > 0) {
                        stockQty = row[j];
                    }
                }

                if (!prodName || stockQty === 0) continue;

                let cleanProdName = prodName.toLowerCase().replace(/\s+/g, ' ');

                for (let bahanMaster in masterBahanBaku) {
                    let isMatch = false;

                    if (bahanMaster === 'Arabica Coffee Beans 1000gr' && cleanProdName.includes('arabica coffee beans')) isMatch = true;
                    else if (bahanMaster === 'Robusta Coffee Beans 1000gr' && cleanProdName.includes('robusta coffee beans')) isMatch = true;
                    else if (bahanMaster === 'Aren Sugar' && cleanProdName.includes('aren sugar')) isMatch = true;
                    else if (bahanMaster === 'Brown Sugar 5000 Gr' && cleanProdName.includes('brown sugar')) isMatch = true;
                    else if (bahanMaster === 'Choco Powder' && cleanProdName.includes('choco powder')) isMatch = true;
                    else if (bahanMaster === 'Condensed Milk Carnation' && cleanProdName.includes('condensed milk')) isMatch = true;
                    else if (bahanMaster === 'Garam Gurih Miwon 500gr' && cleanProdName.includes('garam gurih')) isMatch = true;
                    else if (bahanMaster === 'Granulated Sugar 50000gr' && cleanProdName.includes('granulated sugar')) isMatch = true;
                    else if (bahanMaster === 'Lemon Extract 1000ml' && cleanProdName.includes('lemon extract')) isMatch = true;
                    else if (bahanMaster === 'Lemon Puree 5000ml' && cleanProdName.includes('lemon puree')) isMatch = true;
                    else if (bahanMaster === 'Liquid Creamer' && cleanProdName.includes('liquid creamer')) isMatch = true;
                    else if (bahanMaster === 'Matcha Powder Voya 1000 Gr' && cleanProdName.includes('matcha powder')) isMatch = true;
                    else if (bahanMaster === 'Melcreamer 25000gr' && cleanProdName.includes('melcreamer')) isMatch = true;
                    else if (bahanMaster === 'Oatside Barista Blend 1000ml' && cleanProdName.includes('oatside')) isMatch = true;
                    else if (bahanMaster === 'Orange Valencia NFC' && cleanProdName.includes('orange valencia')) isMatch = true;
                    else if (bahanMaster === 'Susu UHT Diamond 1000ml' && cleanProdName.includes('susu uht')) isMatch = true;
                    else if (bahanMaster === 'Syrup Salted Caramel' && cleanProdName.includes('syrup salted caramel')) isMatch = true;
                    else if (bahanMaster === 'Syrup Vanilla' && cleanProdName.includes('syrup vanilla')) isMatch = true;

                    if (isMatch) {
                        if (bahanMaster === 'Syrup Salted Caramel') {
                            tempAggregat[bahanMaster] += (stockQty / 5000);
                        } else if (bahanMaster === 'Syrup Vanilla') {
                            tempAggregat[bahanMaster] += (stockQty / 6960);
                        } else if (bahanMaster === 'Susu UHT Diamond 1000ml') {
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

        } catch (err) {
            alert("Gagal membaca file Excel: " + err.message);
        }
    };

    reader.readAsArrayBuffer(file);
}
