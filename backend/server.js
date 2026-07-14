import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;

// Database Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nushmeera';
const DB_JSON_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

let isUsingMongoDB = false;

// Mongoose Schemas (used if MongoDB is active)
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  originalPrice: Number,
  category: String,
  fabric: String,
  stock: Number,
  claimed: Number,
  images: [String],
  sizes: [String],
  details: [String],
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 }
});

const reviewSchema = new mongoose.Schema({
  productId: String,
  reviewerName: String,
  rating: Number,
  title: String,
  comment: String,
  date: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

const orderSchema = new mongoose.Schema({
  orderId: String,
  cartItems: Array,
  customerDetails: {
    name: String,
    phone: String,
    address: String,
    city: String
  },
  status: { type: String, default: 'Pending' },
  totalAmount: Number,
  couponCode: { type: String, default: null },
  couponDiscount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  productIds: [String],
  bundlePrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', bundleSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'nushmeera_clothes_secret_key_2026';

const defaultHashedPassword = '$2b$10$c4DU94McGRfBlG/Xzo2Ij.u3uhBPhZzbEIYewdXAg5LvW/rZR.S6S'; // nu$hmeer@Cl0th1ng
const initialAdmins = [
  {
    _id: "admin_default",
    username: "nushmeeraclothing",
    password: defaultHashedPassword
  }
];


// Seeded with Vaneeza Embroidered 3pc as the lead product
const initialProducts = [
  {
    _id: "prod_vaneeza",
    title: "Vaneeza Embroidered 3pc",
    price: 5799.00,
    originalPrice: 9979.00,
    category: "3 Piece Suits",
    fabric: "Embroidered Lawn",
    stock: 8,
    claimed: 41,
    images: ["/images/vaneeza_pink.png"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    details: [
      "Fabric: Premium Embroidered Lawn",
      "Shirt: Intricate embroidered front with lace trims",
      "Trouser: Soft dyed lawn pants (2.2m)",
      "Dupatta: Lightweight embroidered lawn dupatta (2.4m)",
      "Care: Wash under 30°C. Medium iron."
    ],
    rating: 4.9,
    reviewsCount: 22
  },
  {
    _id: "prod_1",
    title: "Lilac Orchid 3pc",
    price: 3397.00,
    originalPrice: 5499.00,
    category: "3 Piece Suits",
    fabric: "Printed Lawn",
    stock: 6,
    claimed: 88,
    images: ["/images/lilac_orchid.png"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    details: [
      "Fabric: Premium Printed Lawn",
      "Shirt: Embroidered front & printed back (2.5m)",
      "Trouser: Dyed lawn trousers (2.2m)",
      "Dupatta: Digital print chiffon dupatta (2.4m)",
      "Care: Dry clean recommended. Do not use bleach."
    ],
    rating: 4.8,
    reviewsCount: 43
  },
  {
    _id: "prod_2",
    title: "Bellrine Co-ord Set",
    price: 2848.00,
    originalPrice: 6790.00,
    category: "Co-ord Sets",
    fabric: "Premium Linen",
    stock: 15,
    claimed: 75,
    images: ["/images/lilac_orchid.png"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    details: [
      "Fabric: Slub Linen",
      "Type: Matching Co-ord Set (Tunic & Pants)",
      "Design: Minimal solid tone with contrast details",
      "Care: Machine wash cold. Medium iron."
    ],
    rating: 4.9,
    reviewsCount: 31
  },
  {
    _id: "prod_3",
    title: "ZAITOON 2PCS",
    price: 2432.00,
    originalPrice: 6400.00,
    category: "2 Piece Sets",
    fabric: "Soft Cotton",
    stock: 12,
    claimed: 62,
    images: ["/images/midnight_dusk.png"],
    sizes: ["Small", "Medium", "Large"],
    details: [
      "Fabric: Soft Cotton Lawn",
      "Includes: Embroidered Shirt & Trouser",
      "Features beautiful floral neck panel embroidery",
      "Color: Off-White with traditional multi-color embroidery"
    ],
    rating: 4.8,
    reviewsCount: 22
  },
  {
    _id: "prod_4",
    title: "CHERRY RED 2PCS",
    price: 2856.00,
    originalPrice: 6800.00,
    category: "2 Piece Sets",
    fabric: "Premium Lawn",
    stock: 5,
    claimed: 58,
    images: ["/images/midnight_dusk.png"],
    sizes: ["Small", "Medium", "Large"],
    details: [
      "Fabric: Lawn",
      "Color: Bold Cherry Red",
      "Includes: A-Line shirt with embroidery details and white contrast trousers"
    ],
    rating: 4.7,
    reviewsCount: 18
  },
  {
    _id: "prod_5",
    title: "Bow Embroidered 3Pc",
    price: 3390.00,
    originalPrice: 5800.00,
    category: "3 Piece Suits",
    fabric: "Embroidered Lawn",
    stock: 6,
    claimed: 41,
    images: ["/images/lilac_orchid.png"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    details: [
      "Fabric: High-grade Lawn",
      "Shirt: Front embroidered with elegant bow motif detailing",
      "Trouser: Soft printed trousers",
      "Dupatta: Contrasting border dupatta"
    ],
    rating: 5.0,
    reviewsCount: 43
  },
  {
    _id: "prod_6",
    title: "Midnight Dusk 3pc",
    price: 4200.00,
    originalPrice: 6500.00,
    category: "3 Piece Suits",
    fabric: "Cotton Lawn",
    stock: 8,
    claimed: 75,
    images: ["/images/midnight_dusk.png"],
    sizes: ["Small", "Medium", "Large"],
    details: [
      "Fabric: Cotton Lawn",
      "Shirt: Embroidered neckline and sleeves",
      "Trouser: Classic cut dyed trousers",
      "Dupatta: Contrasting border dupatta",
      "Care: Wash dark colors separately."
    ],
    rating: 4.9,
    reviewsCount: 28
  }
];

const initialReviews = [
  {
    productId: "prod_vaneeza",
    reviewerName: "Amna T.",
    rating: 5,
    title: "In love with this pink!",
    comment: "The lawn is so breezy and the pink color matches the photo perfectly. Sizing is true.",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    productId: "prod_1",
    reviewerName: "Sana K.",
    rating: 5,
    title: "Beautiful fabric",
    comment: "The dress is exactly as shown. Stitching is neat and fabric is premium. Highly recommended!",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    productId: "prod_1",
    reviewerName: "Amna B.",
    rating: 4,
    title: "Lovely color",
    comment: "The color is slightly softer than the picture but still gorgeous. Perfect for summer.",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    productId: "prod_5",
    reviewerName: "Maria F.",
    rating: 5,
    title: "Excellent!",
    comment: "The bow embroidery is so delicate. Got so many compliments!",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Read from JSON file
function readLocalDB() {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) {
      const dbData = { products: initialProducts, reviews: initialReviews, orders: [], admins: initialAdmins, coupons: [], bundles: [] };
      fs.writeFileSync(DB_JSON_PATH, JSON.stringify(dbData, null, 2));
      return dbData;
    }
    const data = fs.readFileSync(DB_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.admins) { parsed.admins = initialAdmins; }
    if (!parsed.coupons) {
      parsed.coupons = [{
        _id: 'coupon_nush20',
        code: 'NUSH20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 5000,
        maxUses: 0,
        usedCount: 0,
        expiryDate: null,
        isActive: true,
        createdAt: new Date().toISOString()
      }];
    }
    if (!parsed.bundles) parsed.bundles = [];
    writeLocalDB(parsed);
    return parsed;
  } catch (error) {
    console.error("Error reading local db file", error);
    return { products: initialProducts, reviews: initialReviews, orders: [], admins: initialAdmins, coupons: [], bundles: [] };
  }
}

// Write to JSON file
function writeLocalDB(data) {
  try {
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to local db file", error);
  }
}

// Try connecting to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully!");
    isUsingMongoDB = true;
    
    // Seed initial data to MongoDB if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      await Review.insertMany(initialReviews);
      console.log("Seeded initial MongoDB collections.");
    }
    
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.insertMany(initialAdmins);
      console.log("Seeded default admin user in MongoDB.");
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.create({
        code: 'NUSH20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 5000,
        maxUses: 0,
        usedCount: 0,
        isActive: true
      });
      console.log("Seeded default coupon NUSH20.");
    }
  })
  .catch((err) => {
    console.warn("MongoDB connection failed. Falling back to local JSON database storage.", err.message);
    isUsingMongoDB = false;
    // Load initial JSON data to ensure database is created
    readLocalDB();
  });

// API Routes

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    if (isUsingMongoDB) {
      let query = {};
      if (category) query.category = category;
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }
      const products = await Product.find(query);
      return res.json(products);
    } else {
      const db = readLocalDB();
      let products = db.products;
      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        products = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      }
      return res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isUsingMongoDB) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    } else {
      const db = readLocalDB();
      const product = db.products.find(p => p._id === id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (isUsingMongoDB) {
      const productReviews = await Review.find({ productId }).sort({ date: -1 });
      return res.json(productReviews);
    } else {
      const db = readLocalDB();
      const productReviews = db.reviews.filter(r => r.productId === productId);
      return res.json(productReviews.reverse());
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST write review
app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, reviewerName, rating, title, comment } = req.body;
    
    if (!productId || !reviewerName || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const numericRating = Number(rating);

    if (isUsingMongoDB) {
      const newReview = new Review({
        productId,
        reviewerName,
        rating: numericRating,
        title,
        comment,
        date: new Date()
      });
      await newReview.save();

      // Update product rating and reviewsCount
      const reviews = await Review.find({ productId });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Number((totalRating / reviews.length).toFixed(1));

      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        reviewsCount: reviews.length
      });

      return res.status(201).json(newReview);
    } else {
      const db = readLocalDB();
      const newReview = {
        productId,
        reviewerName,
        rating: numericRating,
        title,
        comment,
        date: new Date().toISOString()
      };
      db.reviews.push(newReview);

      // Recalculate product rating/reviewsCount
      const prodIndex = db.products.findIndex(p => p._id === productId);
      if (prodIndex !== -1) {
        const prodReviews = db.reviews.filter(r => r.productId === productId);
        const totalRating = prodReviews.reduce((sum, r) => sum + r.rating, 0);
        db.products[prodIndex].rating = Number((totalRating / prodReviews.length).toFixed(1));
        db.products[prodIndex].reviewsCount = prodReviews.length;
      }

      writeLocalDB(db);
      return res.status(201).json(newReview);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST checkout/order simulation
app.post('/api/orders', async (req, res) => {
  try {
    const { cartItems, customerDetails, couponCode, couponDiscount } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const rawSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = rawSubtotal < 7000 ? 250 : 0;
    const discount = Number(couponDiscount) || 0;
    const totalAmount = Math.max(0, rawSubtotal + shipping - discount);

    // Decrement stock for each item ordered
    if (isUsingMongoDB) {
      for (const item of cartItems) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: -item.quantity }
        });
      }
      // Persist the order in MongoDB
      const newOrder = new Order({
        orderId,
        cartItems,
        customerDetails,
        totalAmount,
        couponCode: couponCode || null,
        couponDiscount: discount,
        status: 'Pending',
        date: new Date()
      });
      await newOrder.save();
    } else {
      const db = readLocalDB();
      for (const item of cartItems) {
        const prodIndex = db.products.findIndex(p => p._id === item._id);
        if (prodIndex !== -1) {
          db.products[prodIndex].stock = Math.max(0, db.products[prodIndex].stock - item.quantity);
        }
      }
      // Persist the order in Local JSON
      const newOrder = {
        _id: 'ord_' + Date.now(),
        orderId,
        cartItems,
        customerDetails,
        totalAmount,
        couponCode: couponCode || null,
        couponDiscount: discount,
        status: 'Pending',
        date: new Date().toISOString()
      };
      if (!db.orders) db.orders = [];
      db.orders.push(newOrder);
      writeLocalDB(db);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Validation Schema
const authLoginSchema = z.object({
  username: z.string()
    .min(1)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format'),
  password: z.string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, 'Missing uppercase')
    .regex(/[a-z]/, 'Missing lowercase')
    .regex(/[0-9]/, 'Missing number')
    .regex(/[^a-zA-Z0-9]/, 'Missing special character')
});

// POST admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const parseResult = authLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      // Generic 400 error to prevent leaking field details
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const { username, password } = parseResult.data;

    let adminUser = null;
    if (isUsingMongoDB) {
      adminUser = await Admin.findOne({ username });
    } else {
      const db = readLocalDB();
      adminUser = (db.admins || []).find(a => a.username === username);
    }

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = bcrypt.compareSync(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: adminUser._id || adminUser.username, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      username: adminUser.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Authentication Middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Bearer token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* ==========================================================================
   Admin API endpoints (Orders tracking and Products inventory CRUD)
   ========================================================================== */

// GET all orders
app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    if (isUsingMongoDB) {
      const orders = await Order.find().sort({ date: -1 });
      return res.json(orders);
    } else {
      const db = readLocalDB();
      const orders = db.orders || [];
      return res.json([...orders].reverse());
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update order status
app.put('/api/admin/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (isUsingMongoDB) {
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
      if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
      return res.json(updatedOrder);
    } else {
      const db = readLocalDB();
      const orderIndex = db.orders.findIndex(o => o._id === id || o.orderId === id);
      if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });
      db.orders[orderIndex].status = status;
      writeLocalDB(db);
      return res.json(db.orders[orderIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE cancel/delete order
app.delete('/api/admin/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isUsingMongoDB) {
      const deletedOrder = await Order.findByIdAndDelete(id);
      if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
      return res.json({ success: true, message: 'Order deleted successfully' });
    } else {
      const db = readLocalDB();
      const orderIndex = db.orders.findIndex(o => o._id === id || o.orderId === id);
      if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });
      db.orders.splice(orderIndex, 1);
      writeLocalDB(db);
      return res.json({ success: true, message: 'Order deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create product
app.post('/api/admin/products', adminAuth, async (req, res) => {
  try {
    const { title, price, originalPrice, category, fabric, stock, images, sizes, details } = req.body;
    const numericPrice = Number(price);
    const numericOriginalPrice = Number(originalPrice);
    const numericStock = Number(stock);
    
    if (isUsingMongoDB) {
      const newProduct = new Product({
        title,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        category,
        fabric,
        stock: numericStock,
        claimed: 0,
        images: Array.isArray(images) ? images : [images || '/images/vaneeza_pink.png'],
        sizes: Array.isArray(sizes) ? sizes : ["Small", "Medium", "Large"],
        details: Array.isArray(details) ? details : [details || 'Premium wear'],
        rating: 5.0,
        reviewsCount: 0
      });
      await newProduct.save();
      return res.status(201).json(newProduct);
    } else {
      const db = readLocalDB();
      const newProduct = {
        _id: 'prod_' + Date.now(),
        title,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        category,
        fabric,
        stock: numericStock,
        claimed: 0,
        images: Array.isArray(images) ? images : [images || '/images/vaneeza_pink.png'],
        sizes: Array.isArray(sizes) ? sizes : ["Small", "Medium", "Large"],
        details: Array.isArray(details) ? details : [details || 'Premium wear'],
        rating: 5.0,
        reviewsCount: 0
      };
      db.products.push(newProduct);
      writeLocalDB(db);
      return res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product
app.put('/api/admin/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, originalPrice, category, fabric, stock, images, sizes, details } = req.body;
    const numericPrice = Number(price);
    const numericOriginalPrice = Number(originalPrice);
    const numericStock = Number(stock);

    if (isUsingMongoDB) {
      const updatedProduct = await Product.findByIdAndUpdate(id, {
        title,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        category,
        fabric,
        stock: numericStock,
        images: Array.isArray(images) ? images : [images],
        sizes: Array.isArray(sizes) ? sizes : ["Small", "Medium", "Large"],
        details: Array.isArray(details) ? details : [details]
      }, { new: true });
      if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
      return res.json(updatedProduct);
    } else {
      const db = readLocalDB();
      const prodIndex = db.products.findIndex(p => p._id === id);
      if (prodIndex === -1) return res.status(404).json({ error: 'Product not found' });
      db.products[prodIndex] = {
        ...db.products[prodIndex],
        title,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        category,
        fabric,
        stock: numericStock,
        images: Array.isArray(images) ? images : [images],
        sizes: Array.isArray(sizes) ? sizes : ["Small", "Medium", "Large"],
        details: Array.isArray(details) ? details : [details]
      };
      writeLocalDB(db);
      return res.json(db.products[prodIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE delete product
app.delete('/api/admin/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isUsingMongoDB) {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      const db = readLocalDB();
      const prodIndex = db.products.findIndex(p => p._id === id);
      if (prodIndex === -1) return res.status(404).json({ error: 'Product not found' });
      db.products.splice(prodIndex, 1);
      writeLocalDB(db);
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk import products
app.post('/api/admin/products/import', adminAuth, async (req, res) => {
  try {
    const { productsList } = req.body;
    if (!Array.isArray(productsList) || productsList.length === 0) {
      return res.status(400).json({ error: 'Import list is empty or invalid' });
    }

    const formattedProducts = productsList.map((p, idx) => ({
      _id: p._id || 'prod_' + (Date.now() + idx),
      title: p.title || 'Untitled Product',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || 0,
      category: p.category || 'Shop All',
      fabric: p.fabric || 'Lawn',
      stock: Number(p.stock) || 10,
      claimed: Number(p.claimed) || 0,
      images: Array.isArray(p.images) ? p.images : [p.images || '/images/vaneeza_pink.png'],
      sizes: Array.isArray(p.sizes) ? p.sizes : ["Small", "Medium", "Large"],
      details: Array.isArray(p.details) ? p.details : [p.details || 'Premium wear'],
      rating: Number(p.rating) || 5.0,
      reviewsCount: Number(p.reviewsCount) || 0
    }));

    if (isUsingMongoDB) {
      await Product.insertMany(formattedProducts);
    } else {
      const db = readLocalDB();
      db.products.push(...formattedProducts);
      writeLocalDB(db);
    }

    return res.status(201).json({ success: true, count: formattedProducts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== COUPON ENDPOINTS =====================

// GET all coupons (admin)
app.get('/api/admin/coupons', adminAuth, async (req, res) => {
  try {
    if (isUsingMongoDB) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json(coupons);
    } else {
      const db = readLocalDB();
      return res.json(db.coupons || []);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create coupon
app.post('/api/admin/coupons', adminAuth, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiryDate, isActive } = req.body;
    if (!code || !discountValue) return res.status(400).json({ error: 'Code and discount value are required' });

    if (isUsingMongoDB) {
      const exists = await Coupon.findOne({ code: code.toUpperCase() });
      if (exists) return res.status(400).json({ error: 'Coupon code already exists' });
      const coupon = await Coupon.create({
        code: code.toUpperCase(), discountType, discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0, maxUses: Number(maxUses) || 0,
        expiryDate: expiryDate || null, isActive: isActive !== false
      });
      return res.status(201).json(coupon);
    } else {
      const db = readLocalDB();
      const exists = db.coupons.find(c => c.code === code.toUpperCase());
      if (exists) return res.status(400).json({ error: 'Coupon code already exists' });
      const newCoupon = {
        _id: 'coupon_' + Date.now(), code: code.toUpperCase(), discountType: discountType || 'percentage',
        discountValue: Number(discountValue), minOrderAmount: Number(minOrderAmount) || 0,
        maxUses: Number(maxUses) || 0, usedCount: 0, expiryDate: expiryDate || null,
        isActive: isActive !== false, createdAt: new Date().toISOString()
      };
      db.coupons.push(newCoupon);
      writeLocalDB(db);
      return res.status(201).json(newCoupon);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update coupon
app.put('/api/admin/coupons/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (update.code) update.code = update.code.toUpperCase();
    if (isUsingMongoDB) {
      const updated = await Coupon.findByIdAndUpdate(id, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Coupon not found' });
      return res.json(updated);
    } else {
      const db = readLocalDB();
      const idx = db.coupons.findIndex(c => c._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });
      db.coupons[idx] = { ...db.coupons[idx], ...update };
      writeLocalDB(db);
      return res.json(db.coupons[idx]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE coupon
app.delete('/api/admin/coupons/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isUsingMongoDB) {
      const deleted = await Coupon.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Coupon not found' });
      return res.json({ success: true });
    } else {
      const db = readLocalDB();
      const idx = db.coupons.findIndex(c => c._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });
      db.coupons.splice(idx, 1);
      writeLocalDB(db);
      return res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST validate coupon (public – used during checkout)
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });
    let coupon;
    if (isUsingMongoDB) {
      coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    } else {
      const db = readLocalDB();
      coupon = db.coupons.find(c => c.code === code.toUpperCase() && c.isActive);
    }
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ error: 'This coupon has expired' });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
    if (coupon.minOrderAmount > 0 && Number(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount of Rs ${coupon.minOrderAmount} required` });
    }
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((Number(orderAmount) * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }
    return res.json({ valid: true, coupon, discountAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== BUNDLE ENDPOINTS =====================

// GET all bundles (public)
app.get('/api/bundles', async (req, res) => {
  try {
    if (isUsingMongoDB) {
      const bundles = await Bundle.find({ isActive: true });
      return res.json(bundles);
    } else {
      const db = readLocalDB();
      return res.json((db.bundles || []).filter(b => b.isActive));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all bundles admin
app.get('/api/admin/bundles', adminAuth, async (req, res) => {
  try {
    if (isUsingMongoDB) {
      const bundles = await Bundle.find().sort({ createdAt: -1 });
      return res.json(bundles);
    } else {
      const db = readLocalDB();
      return res.json(db.bundles || []);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create bundle
app.post('/api/admin/bundles', adminAuth, async (req, res) => {
  try {
    const { name, description, productIds, bundlePrice, originalPrice, isActive } = req.body;
    if (!name || !bundlePrice) return res.status(400).json({ error: 'Name and bundle price are required' });
    if (isUsingMongoDB) {
      const bundle = await Bundle.create({
        name, description: description || '', productIds: productIds || [],
        bundlePrice: Number(bundlePrice), originalPrice: Number(originalPrice) || 0, isActive: isActive !== false
      });
      return res.status(201).json(bundle);
    } else {
      const db = readLocalDB();
      const newBundle = {
        _id: 'bundle_' + Date.now(), name, description: description || '',
        productIds: productIds || [], bundlePrice: Number(bundlePrice),
        originalPrice: Number(originalPrice) || 0, isActive: isActive !== false,
        createdAt: new Date().toISOString()
      };
      db.bundles.push(newBundle);
      writeLocalDB(db);
      return res.status(201).json(newBundle);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update bundle
app.put('/api/admin/bundles/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (isUsingMongoDB) {
      const updated = await Bundle.findByIdAndUpdate(id, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Bundle not found' });
      return res.json(updated);
    } else {
      const db = readLocalDB();
      const idx = db.bundles.findIndex(b => b._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Bundle not found' });
      db.bundles[idx] = { ...db.bundles[idx], ...update };
      writeLocalDB(db);
      return res.json(db.bundles[idx]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE bundle
app.delete('/api/admin/bundles/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isUsingMongoDB) {
      const deleted = await Bundle.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Bundle not found' });
      return res.json({ success: true });
    } else {
      const db = readLocalDB();
      const idx = db.bundles.findIndex(b => b._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Bundle not found' });
      db.bundles.splice(idx, 1);
      writeLocalDB(db);
      return res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
