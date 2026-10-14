/**
 * Module Khusus Stok Bahan Baku & Auto-Import Stocklist Gudang
 */

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

let stokGudangUser = {};

function renderTabelBahanBakuDirect() {
    let tbody = document.querySelector("#tblRawMaterials tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let no = 1;
    for (let bahan in masterBahanBaku) {
        let meta = masterBahanBaku[bahan];
        let reqGr = 0;
        let reqKemasan = "0.00";
        let stokCurrent = parseFloat(stokGudangUser[bahan]) || 0;
        
        let statusBadge = '';
        if (stokCurrent > 0) {
            statusBadge = `<span style="background-color:#2ecc71; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">🟢 Aman</span>`;
        } else {
            statusBadge = `<span style="background-color:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">🔴 Kritis (Kosong)</span>`;
        }

        let rowHtml = `
            <tr>
                <td><b>${no++}</b></td>
                <td class="text-left">${bahan}</td>
                <td><b>${meta.satuan}</b></td>
                <td>0 gr/ml</td>
                <td><b style="color:#2980b9;">0.00 ${meta.satuan}</b></td>
                <td>
                    <input type="number" value="${stokCurrent.toFixed(2)}" min="0" step="0.1" style="width:80px; text-align:center; font-weight:bold;" oninput="stokGudangUser['${bahan}']=parseFloat(this.value)||0; renderTabelBahanBakuDirect();" /> ${meta.satuan}
                </td>
                <td>${statusBadge}</td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    }
}

function hitungKebutuhanBahanBaku() {
    renderTabelBahanBakuDirect();
}

function handleImportStocklist(inputElem) {
    let file = inputElem ? inputElem.files[0] : null;
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert("Library Excel belum siap. Silakan refresh halaman.");
        return;
    }

    let reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: 'array' });
            let worksheet = workbook.Sheets[workbook.SheetNames[0]];
            let rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            let tempAggregat = {};
            Object.keys(masterBahanBaku).forEach(b => tempAggregat[b] = 0);

            for (let i = 8; i < rawJson.length; i++) {
                let row = rawJson[i];
                if (!row || row.length < 3) continue;

                let prodName = row[2] ? row[2].toString().trim() : '';
                let stockQty = parseFloat(row[9]) || 0;

                if (!prodName || stockQty === 0) continue;

                let cleanProdName = prodName.toLowerCase().replace(/\s+/g, ' ');

                for (let bahanMaster in masterBahanBaku) {
                    let isMatch = false;

                    if (bahanMaster === 'Arabica Coffee Beans 1000gr' && cleanProdName.includes('arabica coffee beans')) isMatch = true;
                    else if (bahanMaster === 'Robusta Coffee Beans 1000gr' && cleanProdName.includes('robusta coffee beans')) isMatch = true;
                    else if (bahanMaster === 'Aren Sugar' && (cleanProdName === 'aren sugar' || cleanProdName === 'aren sugar a2')) isMatch = true;
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
                        if (bahanMaster === 'Syrup Salted Caramel') tempAggregat[bahanMaster] += (stockQty / 5000);
                        else if (bahanMaster === 'Syrup Vanilla') tempAggregat[bahanMaster] += (stockQty / 6960);
                        else if (bahanMaster === 'Susu UHT Diamond 1000ml') tempAggregat[bahanMaster] += (stockQty / 12);
                        else tempAggregat[bahanMaster] += stockQty;
                        break;
                    }
                }
            }

            stokGudangUser = tempAggregat;
            renderTabelBahanBakuDirect();
            if(inputElem) inputElem.value = '';
            alert("Berhasil mengimpor Stocklist Gudang!");

        } catch (err) {
            alert("Gagal membaca file Excel: " + err.message);
        }
    };
}
