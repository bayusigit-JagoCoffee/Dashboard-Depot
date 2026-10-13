// Parser & Auto Import Excel Stocklist Gudang (Fixed Render & Reset Input)
function handleImportStocklist(inputElem) {
    let file = inputElem.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert("Library Excel (SheetJS) belum siap. Silakan refresh halaman web.");
        return;
    }

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

            // Scan baris data dari Excel (Mulai dari baris ke-9)
            for (let i = 8; i < rawJson.length; i++) {
                let row = rawJson[i];
                if (!row || row.length < 3) continue;

                let prodName = row[2] ? row[2].toString().trim() : ''; // Kolom C
                let stockQty = parseFloat(row[9]) || 0;                // Kolom J

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
            
            // Langsung panggil render tabel
            renderTabelBahanBaku({});
            
            // Reset elemen input file agar bisa memilih file yang sama berulang kali
            inputElem.value = '';
            
            alert("Berhasil mengimpor dan mengonversi Stocklist Gudang!");

        } catch (err) {
            alert("Gagal membaca file Excel: " + err.message);
        }
    };

    reader.readAsArrayBuffer(file);
}
