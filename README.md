# מערכת ניהול משתמשים

מערכת לניהול רשימת משתמשים המשולבת עם GitHub.

## דרישות מערכת
- Node.js (גרסה 14 ומעלה)
- npm או yarn
- חשבון GitHub

## התקנה והפעלה

1. התקנת חבילות נדרשות:
```bash
npm install
```

2. הגדרת משתני סביבה:
צור קובץ `.env` בתיקיית הפרויקט עם התוכן הבא:
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GITHUB_TOKEN=your_github_token
```

3. הפעלת השרת:
```bash
npm start
```

## הגדרת GitHub

1. צור repository חדש ב-GitHub
2. הגדר את ה-repository כ-private
3. צור Personal Access Token ב-GitHub:
   - לך ל-Settings > Developer settings > Personal access tokens
   - צור token חדש עם הרשאות repo
   - העתק את ה-token והשתמש בו ב-.env

## מבנה הפרויקט
- `/frontend` - קוד ה-React
- `/backend` - קוד ה-Node.js/Express
- `/data` - קבצי JSON לשמירת נתוני המשתמשים 