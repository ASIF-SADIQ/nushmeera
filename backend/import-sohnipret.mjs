/**
 * import-sohnipret.mjs
 * Reads sohnipret_products.csv, groups rows by product title,
 * and imports them directly into MongoDB.
 *
 * Usage:
 *   node import-sohnipret.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const CSV_FILE = path.join(__dirname, 'sohnipret_products.csv');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

// ── Product Schema ──────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  originalPrice: Number,
  category: String,
  fabric: String,
  stock: Number,
  images: [String],
  sizes: [String],
  details: [String],
  description: String,
  vendor: String,
  handle: String,
  productUrl: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

// ── Category mapping from tags ───────────────────────────────────────────────
function inferCategory(tags, title, productType) {
  const text = (tags + ' ' + title + ' ' + productType).toLowerCase();
  if (text.includes('3pc') || text.includes('3 pc') || text.includes('3-piece')) return '3 Piece Suits';
  if (text.includes('2pc') || text.includes('2 pc') || text.includes('2-piece')) return '2 Piece Suits';
  if (text.includes('embroidered')) return 'Embroidered';
  if (text.includes('printed')) return 'Printed';
  if (text.includes('lawn')) return 'Lawn';
  return 'Shop All';
}

// ── Fabric inference ─────────────────────────────────────────────────────────
function inferFabric(description, tags) {
  const text = (description + ' ' + tags).toLowerCase();
  if (text.includes('chiffon')) return 'Chiffon';
  if (text.includes('organza')) return 'Organza';
  if (text.includes('silk')) return 'Silk';
  if (text.includes('cotton')) return 'Cotton';
  if (text.includes('net')) return 'Net';
  if (text.includes('linen')) return 'Linen';
  if (text.includes('lawn')) return 'Lawn';
  return 'Lawn';
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ sohnipret_products.csv not found in backend/');
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = parseCSV(content);
  console.log(`📄 Read ${rows.length} rows from CSV\n`);

  // Group rows by product handle (unique product identifier)
  const productMap = new Map();

  for (const row of rows) {
    const handle = row.handle || row.title;
    if (!handle) continue;

    if (!productMap.has(handle)) {
      // Parse images
      const allImages = (row.all_image_urls || row.main_image || '')
        .split(',')
        .map(u => u.trim())
        .filter(u => u.startsWith('http'));

      if (allImages.length === 0 && row.main_image) {
        allImages.push(row.main_image.trim());
      }

      const price = parseFloat(row.price) || 2999;
      const comparePrice = parseFloat(row.compare_at_price) || Math.round(price * 1.3);

      // Build details from description
      const desc = row.description || '';
      const details = desc
        .split(/\n|\.(?=\s)/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 5);

      productMap.set(handle, {
        title: row.title || 'Unnamed Product',
        price: price,
        originalPrice: comparePrice,
        category: inferCategory(row.tags || '', row.title || '', row.product_type || ''),
        fabric: inferFabric(row.description || '', row.tags || ''),
        stock: parseInt(row.inventory_qty) || 10,
        images: allImages,
        sizes: [],
        details: details.length > 0 ? details : ['Premium quality fabric', 'Includes shirt and pants', 'Dry clean recommended'],
        description: desc.substring(0, 500),
        vendor: row.vendor || 'SohniPret',
        handle: handle,
        productUrl: row.product_url || '',
      });
    }

    // Add size if not already present
    const product = productMap.get(handle);
    const size = (row.variant_title || '').trim();
    if (size && !product.sizes.includes(size)) {
      product.sizes.push(size);
    }
  }

  const products = Array.from(productMap.values());
  console.log(`🧺 Grouped into ${products.length} unique products\n`);

  // Ensure sizes are in correct order
  const sizeOrder = ['XS', 'Small', 'Medium', 'Large', 'Extra Large', 'XL', 'XXL', 'Free Size'];
  products.forEach(p => {
    if (p.sizes.length === 0) p.sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
    p.sizes.sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  });

  // Insert into MongoDB in batches of 20
  const BATCH = 20;
  let totalImported = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    process.stdout.write(`Batch ${batchNum}: importing ${batch.length} products... `);

    try {
      await Product.insertMany(batch, { ordered: false });
      totalImported += batch.length;
      console.log(`✅ done`);
    } catch (err) {
      if (err.code === 11000) {
        console.log(`⚠️  some duplicates skipped`);
        totalImported += batch.length;
      } else {
        console.log(`❌ error: ${err.message}`);
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n🎉 Done! Imported ${totalImported} products into MongoDB.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
