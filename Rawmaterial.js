// Parser & Auto Import Excel / CSV Stocklist Gudang (Fixed Extension & Auto Render)
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

            // Scan baris data dari Excel
            for (let i = 0; i < rawJson.length; i++) {
                let row = rawJson[i];
                if (!row || row.length < 3) continue;

                let prodName = '';
                let stockQty = 0;

                for (let j = 0; j < row.length; j++) {
                    let cell = row[j] ? row[j].toString().trim() : '';
                    let lower = cell.toLowerCase();

                    if (lower.includes('beans') || lower.includes('sugar') || lower.includes('powder') || lower.includes('milk') || lower.includes('syrup') || lower.includes('uht') || lower.includes('creamer') || lower.includes('lemon') || lower.includes('matcha') || lower.includes('valencia') || lower.includes('miwon')) {
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
            alert("Gagal membaca file: " + err.message);
        }
    };

    reader.readAsArrayBuffer(file);
}
