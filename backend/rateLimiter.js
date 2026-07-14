import { createClient } from 'redis';
import nodemailer from 'nodemailer';

// Redis Client Setup (fallback to memory if not available)
let redisClient;
const memoryStore = new Map();

export const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) return new Error('Max retries reached');
          return Math.min(retries * 50, 500);
        }
      }
    });
    redisClient.on('error', (err) => console.log('Redis error:', err.message));
    await redisClient.connect();
    console.log('Redis connected for rate limiting');
  } catch (err) {
    console.log('Redis connection failed, using in-memory store for rate limiting');
    redisClient = null;
  }
};

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

const sendLockoutEmail = async (username) => {
  if (!process.env.SMTP_USER) return; // Skip if not configured
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: 'Security Alert: Admin Account Locked',
      text: `Your admin account (${username}) has been locked for 15 minutes due to 5 consecutive failed login attempts.`
    });
  } catch (error) {
    console.error('Failed to send lockout email:', error);
  }
};

// In-Memory Helper Functions
const getVal = async (key) => {
  if (redisClient) return await redisClient.get(key);
  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expiry && item.expiry < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return item.value;
};

const setVal = async (key, value, ttlSeconds = null) => {
  if (redisClient) {
    if (ttlSeconds) await redisClient.setEx(key, ttlSeconds, value.toString());
    else await redisClient.set(key, value.toString());
  } else {
    memoryStore.set(key, {
      value: value.toString(),
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    });
  }
};

const delVal = async (key) => {
  if (redisClient) await redisClient.del(key);
  else memoryStore.delete(key);
};

const incrVal = async (key, ttlSeconds = null) => {
  let val = await getVal(key);
  val = val ? parseInt(val) + 1 : 1;
  await setVal(key, val, ttlSeconds);
  return val;
};

// Core Middleware / Logic
export const checkRateLimits = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const username = req.body?.username;

  // 1. IP Rate Limiting (10 req / min)
  const ipKey = `login_attempts_ip:${ip}`;
  const ipAttempts = await incrVal(ipKey, 60);
  if (ipAttempts > 10) {
    return res.status(429).json({ error: 'Too many attempts, try again later.' });
  }

  // 2. Account Lockout Check
  if (username) {
    const isLocked = await getVal(`lockout_acc:${username}`);
    if (isLocked) {
      // Return generic 401 to not reveal lock status directly to attacker
      return res.status(401).json({ error: 'Invalid request parameters' });
    }
  }

  next();
};

export const handleFailedLogin = async (username) => {
  const accKey = `login_attempts_acc:${username}`;
  const attempts = await incrVal(accKey, 15 * 60); // Track for 15 mins

  // Progressive delay (1s, 2s, 5s, 15s, 30s)
  const delays = [1000, 2000, 5000, 15000, 30000];
  const delayTime = delays[Math.min(attempts - 1, delays.length - 1)];
  
  // Lock account after 5 failed attempts
  if (attempts >= 5) {
    await setVal(`lockout_acc:${username}`, '1', 15 * 60); // Lock for 15 mins
    await delVal(accKey); // Reset attempt counter
    sendLockoutEmail(username); // Fire and forget
  }

  return new Promise(resolve => setTimeout(resolve, delayTime));
};

export const handleSuccessfulLogin = async (username) => {
  await delVal(`login_attempts_acc:${username}`);
};

export const requiresCaptcha = async (username) => {
  if (!username) return false;
  const attempts = await getVal(`login_attempts_acc:${username}`);
  return attempts ? parseInt(attempts) >= 3 : false;
};

export const verifyCaptcha = async (token) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // Bypass if not configured
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
};
