# ⚡ QUICK TEST - Verify 10+ Photos

## 🎯 1-MINUTE TEST

### Step 1: Open Console
Press **F12** → Click **Console** tab

### Step 2: Watch for These Logs
You should see **exactly this pattern**:

```
🎥 [CAPTURE START] Target: 20 photos, Interval: 200ms, Type: login
📸 [FRONT] Starting 10 photo capture...
📸 [FRONT #1/10] Captured ✓ (Total: 1)
✅ [FRONT #1/10] Uploaded successfully
📸 [FRONT #2/10] Captured ✓ (Total: 2)
✅ [FRONT #2/10] Uploaded successfully
...continues to #10...
📊 [FRONT COMPLETE] 10/10 photos captured (10 attempts)
```

### Step 3: Count Photos
**Desktop:**
- Login should show: `10/10 photos captured`
- Verification should show: `15/15 photos captured`
- Receipt should show: `15/15 photos captured`

**Mobile:**
- Each page shows BOTH front AND back counts
- Each camera: minimum 10+ photos
- Example: `10/10 front + 10/10 back = 20 total`

---

## ✅ SUCCESS = You See This:

```
📊 [FRONT COMPLETE] 10/10 photos captured (10 attempts)
📊 [FRONT COMPLETE] 15/15 photos captured (15 attempts)
📊 [FRONT COMPLETE] 15/15 photos captured (15 attempts)
```

**Total Desktop: 40 front photos**  
**Total Mobile: 40 front + 40 back = 80 photos**

---

## ❌ FAILURE = You See This:

```
📊 [FRONT COMPLETE] 2/10 photos captured (10 attempts)
```

**If you see this:**
1. Check for red errors in console
2. Look for warnings about "video not ready"
3. Try refreshing the page (Ctrl+Shift+R)
4. Try a different browser (Chrome recommended)

---

## 📊 Quick Check - Open Admin Dashboard

1. Go to http://localhost:3003/admin
2. Password: `safwan@123`
3. Find your test transaction
4. Count photos - should see 40-80 total

---

## 🐛 Common Issues:

### "Only 2 photos showing"
✅ **Fixed!** Reload page (Ctrl+Shift+R) to get new code

### "Video not ready" warnings
⏳ Camera initializing - give it a moment and check final count

### "Upload failed" errors
⚠️ Photos captured but upload failed - check server logs

### Back camera shows 0 on mobile
❌ Permission denied - check browser settings

---

## ⚡ RECOMMENDED TEST FLOW:

1. Open `http://localhost:3003`
2. Press F12 → Console
3. Enter any details on login
4. Click "I am human" button
5. **WATCH CONSOLE** - should see rapid photo logs
6. Continue through verification and receipt
7. Check console shows 40+ photos total (desktop) or 80+ (mobile)

---

**Test now and verify console shows 10+ photos per camera!** 🚀
