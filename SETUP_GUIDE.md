# SadhakX - Complete Authentication Setup Guide

## 🎯 Features Implemented

✅ **Multiple Authentication Methods:**
- Email & Password
- Phone Number (with OTP)
- Google Sign-In

✅ **User Categorization:**
- SSC
- Banking
- Railway
- UPSC
- State PSC
- Defense

✅ **Category-Based Dashboards:**
Each category has a dedicated dashboard with relevant courses and materials

---

## 🔧 Firebase Console Setup Required

### Step 1: Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `test-67dbe`
3. Navigate to **Authentication** → **Sign-in method**

#### Enable Email/Password:
- Click on **Email/Password**
- Toggle **Enable**
- Click **Save**

#### Enable Google Sign-In:
- Click on **Google**
- Toggle **Enable**
- Enter your project support email
- Click **Save**

#### Enable Phone Authentication:
- Click on **Phone**
- Toggle **Enable**
- Click **Save**
- Add your phone number for testing in **Phone numbers for testing** (optional)

### Step 2: Configure Authorized Domains

1. In Authentication → **Settings** → **Authorized domains**
2. Add your local development domain:
   - `localhost`
3. Later add your production domain when deploying

### Step 3: Firestore Database Setup

1. Go to **Firestore Database** in Firebase Console
2. Create database if not already created
3. Start in **Test mode** (for development)
4. The app will automatically create the `users` collection

### Firestore Security Rules (Update Later):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Running the Application

### Install Dependencies (if needed):
```bash
npm install
```

### Start Development Server:
```bash
npm run dev
```

### Access the Application:
Open your browser and go to: `http://localhost:5173`

---

## 📱 How to Use

### For New Users (Sign Up):

1. **Email/Password Method:**
   - Select "Register" button
   - Enter email and password
   - Click "Sign Up"
   - Select your learning category
   - Redirected to category dashboard

2. **Phone Number Method:**
   - Click "Phone" tab
   - Enter phone number (+91 format or just 10 digits)
   - Click "Send OTP"
   - Enter the 6-digit OTP received
   - Click "Verify OTP"
   - Select your learning category
   - Redirected to category dashboard

3. **Google Sign-In:**
   - Click "Login With Google" button
   - Select Google account
   - Select your learning category
   - Redirected to category dashboard

### For Existing Users (Login):

1. Use the same method you registered with
2. You'll be automatically redirected to your saved category dashboard

---

## 📊 Database Structure

### Users Collection:
```javascript
users/{userId}
  - uid: string
  - email: string
  - phoneNumber: string (if phone auth)
  - category: string (ssc, banking, railway, etc.)
  - createdAt: timestamp
  - lastLogin: timestamp
```

---

## 🎨 UI Features

- Beautiful purple gradient theme matching the reference image
- Animated floating cubes on the right side
- Smooth transitions and hover effects
- Responsive design for mobile and desktop
- Category selection with visual cards
- Category-specific dashboards with course modules

---

## 📂 File Structure

```
src/
├── config/
│   └── firebaseConfig.js          # Firebase configuration
├── screens/
│   ├── LoginScreen.jsx            # Main login/signup screen
│   ├── LoginScreen.css            # Login screen styles
│   ├── Home.jsx                   # Original home (kept for reference)
│   └── dashboards/
│       ├── SSCDashboard.jsx
│       ├── BankingDashboard.jsx
│       ├── RailwayDashboard.jsx
│       ├── UPSCDashboard.jsx
│       ├── StatePSCDashboard.jsx
│       ├── DefenseDashboard.jsx
│       └── Dashboard.css          # Shared dashboard styles
├── App.jsx                         # Main app with routing
└── main.jsx
```

---

## 🔐 Security Notes

⚠️ **Important:**
1. Never commit Firebase config with production keys to public repos
2. Update Firestore security rules before production deployment
3. Enable App Check for additional security
4. Set up proper authorized domains in Firebase

---

## 🐛 Troubleshooting

### Issue: Phone Authentication Not Working
- **Solution:** Ensure you've enabled Phone authentication in Firebase Console
- Check that reCAPTCHA is not blocked by browser extensions
- Use correct phone number format (+91xxxxxxxxxx)

### Issue: Google Sign-In Popup Blocked
- **Solution:** Allow popups for localhost in browser settings
- Check authorized domains in Firebase Console

### Issue: User Not Redirected After Category Selection
- **Solution:** Check Firestore permissions
- Ensure user is authenticated (check browser console)

---

## 🎓 Next Steps / Enhancements

- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Implement actual course content
- [ ] Add progress tracking
- [ ] Create quiz/test modules
- [ ] Add profile management
- [ ] Implement payment integration
- [ ] Add admin panel

---

## 📞 Support

For issues or questions, check the browser console for error messages.

---

**Happy Learning with SadhakX! 📚✨**
