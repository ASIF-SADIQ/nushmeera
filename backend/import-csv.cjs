/**
 * import-csv.cjs  (CommonJS version)
 * Reads already-fetched imported_products.json and imports in batches of 20.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:5000';
const PRODUCTS_JSON = path.join(__dirname, 'data', 'imported_products.json');
const BATCH_SIZE = 20;

function postJSON(endpoint, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${token}`
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const adminToken = process.env.ADMIN_TOKEN || '';
  if (!adminToken) {
    console.error('❌ No ADMIN_TOKEN env var set.');
    process.exit(1);
  }

  if (!fs.existsSync(PRODUCTS_JSON)) {
    console.error('❌ imported_products.json not found. Run the full import-csv.cjs first.');
    process.exit(1);
  }

  const allProducts = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
  console.log(`\n📦 Importing ${allProducts.length} products in batches of ${BATCH_SIZE}...\n`);

  let totalImported = 0;
  let batchNum = 0;

  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = allProducts.slice(i, i + BATCH_SIZE);
    process.stdout.write(`Batch ${batchNum}: products ${i + 1}-${Math.min(i + BATCH_SIZE, allProducts.length)}... `);

    const result = await postJSON('/api/admin/products/import', { productsList: batch }, adminToken);

    if (result.status === 200 || result.status === 201) {
      const count = result.body.count || batch.length;
      totalImported += count;
      console.log(`✅ ${count} imported`);
    } else {
      console.log(`❌ Failed (${result.status}): ${JSON.stringify(result.body).substring(0, 100)}`);
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n🎉 Done! Total imported: ${totalImported} products`);
  console.log(`   Visit: http://localhost:5173`);
}

main().catch(console.error);
