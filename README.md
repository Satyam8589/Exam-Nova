# ExamNova

ExamNova is a unified, intelligent platform that aggregates all government exam and job notifications, with trusted data, powerful filters, and smart alerts across Web and Mobile.

## Features

### MVP Phase 1
- Core exam listing with filters (state, category, qualification, status)
- Exam details with official sources and links
- Basic login / signup (email + password)
- User bookmarks ("My Exams" dashboard)
- Simple Admin Panel for manual creation and editing of exams
- Basic status workflow (Draft / Published)
- Minimal analytics (number of exams, basic views, and bookmarks)

## Data Sources

### Current Implementation (MVP)
The app uses curated sample data with realistic government exam information. This ensures:
- ✅ Reliable data display
- ✅ Proper filtering and search functionality
- ✅ Realistic user experience for testing

### Production Data Integration Options

#### Option 1: RapidAPI Integration (Recommended)
```javascript
// In src/services/sarkariApi.js, replace the function with:
const SARKARI_API_KEY = 'your-rapidapi-key-here';
const url = 'https://sarkari-result.p.rapidapi.com/scrape/latestjob';
// ... implement API call
```

#### Option 2: Official Government APIs
- UPSC: https://www.upsc.gov.in/
- SSC: https://ssc.nic.in/
- Railway: https://indianrailways.gov.in/
- Banking: https://ibps.in/

#### Option 3: RSS Feed Integration
Many government sites provide RSS feeds that can be parsed.

#### Option 4: Manual Admin Entry
Admins can manually add and update exam information through the Admin Panel.

### Next Steps for Real Data
1. **Choose a data source** based on your requirements and budget
2. **Implement data fetching** in `sarkariApi.js`
3. **Update data transformation** in `ExamList.jsx` if needed
4. **Add data validation** to ensure accuracy
5. **Implement caching** to reduce API calls

## Tech Stack
- React 19
- Vite
- Firebase (Auth, Firestore)
- React Router

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase config in `src/config/firebaseConfig.js`
4. Run development server: `npm run dev`

## Project Structure
```
src/
  components/
    header.jsx
  screens/
    LoginScreen.jsx
    ExamList.jsx
    ExamDetail.jsx
    Bookmarks.jsx
    AdminPanel.jsx
  config/
    firebaseConfig.js
```
