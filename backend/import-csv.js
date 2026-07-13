/**
 * import-csv.js
 * Reads D:\Downloads\products.csv, fetches image URLs from Shopify's
 * products.json API (public endpoint), then bulk-imports into Nushmeera.
 *
 * Usage:
 *   cd backend
 *   ADMIN_TOKEN=<token> node import-csv.js
 *   OR just: node import-csv.js   (will prompt for token)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const CSV_PATH = 'D:\\Downloads\\products.csv';
const API_BASE = 'http://localhost:5000';
const SHOPIFY_STORE = 'sohnipret.com';

// ── Helpers ────────────────────────────────────────────────────────────────

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  const rows = [];
  let i = 1;
  while (i < lines.length) {
    let line = lines[i];
    // Handle multiline quoted fields
    while ((line.match(/"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
      i++;
      line += '\n' + lines[i];
    }
    if (line.trim()) {
      const values = splitCSVLine(line);
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (values[idx] || '').replace(/^"|"$/g, '').trim(); });
      rows.push(obj);
    }
    i++;
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function getShopifyImages(handle) {
  try {
    const url = `https://${SHOPIFY_STORE}/products/${handle}.js`;
    const data = await fetchJSON(url);
    if (data && data.images && data.images.length > 0) {
      return data.images.map(imgUrl => {
        // Shopify returns protocol-relative URLs like //cdn.shopify.com/...
        if (imgUrl.startsWith('//')) return 'https:' + imgUrl;
        return imgUrl;
      });
    }
  } catch (e) {}
  return [];
}

function mapCategory(tags, productType) {
  const t = (tags + ' ' + productType).toLowerCase();
  if (t.includes('3pc') || t.includes('3 pc') || t.includes('3piece')) return '3 Piece Suits';
  if (t.includes('2pc') || t.includes('2 pc') || t.includes('2piece')) return '2 Piece Sets';
  if (t.includes('coord') || t.includes('co-ord')) return 'Co-ord Sets';
  if (t.includes('lawn')) return '3 Piece Suits';
  return '3 Piece Suits'; // default
}

function mapSizes(variantsCount) {
  const n = parseInt(variantsCount) || 1;
  if (n >= 6) return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].slice(0, n);
  if (n === 4) return ['S', 'M', 'L', 'XL'];
  if (n === 3) return ['S', 'M', 'L'];
  if (n === 2) return ['M', 'L'];
  return ['One Size'];
}

async function postJSON(endpoint, body, token) {
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
    const req = require('http').request(options, res => {
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

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Get admin token
  let adminToken = process.env.ADMIN_TOKEN || '';
  if (!adminToken) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    adminToken = await new Promise(resolve => rl.question('Enter admin token: ', ans => { rl.close(); resolve(ans.trim()); }));
  }

  console.log('\n📂 Reading CSV...');
  const rows = parseCSV(CSV_PATH);
  const activeRows = rows.filter(r => r.status === 'active');
  console.log(`✅ Found ${activeRows.length} active products (${rows.length} total)\n`);

  const productsList = [];

  for (let i = 0; i < activeRows.length; i++) {
    const row = activeRows[i];
    const pct = Math.round(((i + 1) / activeRows.length) * 100);
    process.stdout.write(`\r[${i + 1}/${activeRows.length}] ${pct}% — Fetching images for: ${row.title.substring(0, 40).padEnd(40)}`);

    // Fetch images from Shopify
    let images = await getShopifyImages(row.handle);

    // Fallback: use Shopify CDN pattern
    if (images.length === 0) {
      images = [`https://${SHOPIFY_STORE}/products/${row.handle}`];
    }

    const price = Math.round(parseFloat(row.price_PKR) || 0);
    const originalPrice = Math.round(parseFloat(row.compare_at_PKR) || price);

    const product = {
      title: row.title,
      description: row.description || `${row.title} - Premium Pakistani clothing`,
      category: mapCategory(row.tags, row.product_type),
      price,
      originalPrice,
      sizes: mapSizes(row.variants_count),
      images,          // ← Multiple images properly listed
      stock: 20,
      featured: i < 10 // First 10 are featured
    };

    productsList.push(product);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n📦 Importing ${productsList.length} products into Nushmeera...\n`);

  // Save the mapped products to a JSON file for reference
  const outPath = path.join(__dirname, 'data', 'imported_products.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(productsList, null, 2));
  console.log(`💾 Saved mapped products to: ${outPath}`);

  // Import via admin API
  const result = await postJSON('/api/admin/products/import', { productsList }, adminToken);

  if (result.status === 200 || result.status === 201) {
    console.log(`\n✅ SUCCESS! Imported ${result.body.count || productsList.length} products.`);
    console.log(`   Products are now live at: http://localhost:5173`);
  } else {
    console.error(`\n❌ Import failed (${result.status}):`, result.body);
    console.log('\n💡 Tip: Make sure the admin token is correct. Get it from localStorage in the admin panel.');
  }
}

main().catch(console.error);
