# Sidebar Component - Implementation Guide

## Quick Start

The enhanced Sidebar component is now fully dynamic and integrated with your Redux store and API. Here's how it works:

## What Changed?

### Before (Static)
```jsx
// Hard-coded user data
<h4>Junadi ALi</h4>
<p>@junaidali0077</p>
<p>40</p> // Posts
<p>2.5k</p> // Followers
```

### After (Dynamic)
```jsx
// Data from Redux + API
const { user } = useSelector((state) => state.auth);
const [userStats, setUserStats] = useState(null);

// Fetches real user data
useEffect(() => {
  fetchUserProfile();
}, [user]);

// Displays actual data
<h4>{displayName}</h4>
<p>@{username}</p>
<p>{formatNumber(userStats?.totalCreations)}</p>
<p>{formatNumber(userStats?._count?.followers)}</p>
```

## Features Implemented

### ✅ Dynamic Data Loading
- Fetches user profile from `/api/auth/profile`
- Falls back to Redux store data
- Shows loading states
- Handles errors gracefully

### ✅ Real User Statistics
- **Posts**: From `userStats.totalCreations`
- **Followers**: From `userStats._count.followers`
- **Following**: From `userStats._count.following`
- **AI Credits**: From `userStats.dailyGenerationsUsed` / `dailyGenerationsLimit`
- **Coin Balance**: From `userStats.coinBalance`
- **Subscription Tier**: From `userStats.subscriptionTier`

### ✅ Smart Number Formatting
```javascript
1234 → "1.2k"
5678900 → "5.7M"
45 → "45"
```

### ✅ Progress Bar Calculation
Automatically calculates credit usage percentage:
```javascript
const creditUsage = {
  used: 7,
  limit: 10,
  percentage: 70 // Shows 70% filled
};
```

### ✅ Logout Functionality
- Calls API to invalidate tokens
- Clears Redux state
- Removes localStorage items
- Closes sidebar automatically

### ✅ Settings Persistence
Theme and language preferences saved to localStorage:
```javascript
localStorage.setItem('theme', 'Dark');
localStorage.setItem('language', 'English');
```

## Integration Steps

### 1. Ensure Redux Store is Set Up

Your `store.js` should include:
```javascript
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});
```

### 2. User Must Be Logged In

The sidebar expects a user in Redux state:
```javascript
// After successful login/register
dispatch(setAuth({
  user: userData,
  token: accessToken
}));
```

### 3. Bootstrap Must Be Loaded

Ensure Bootstrap JS is included in your HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

### 4. Trigger Button Setup

Any button can open the sidebar:
```jsx
<button
  data-bs-toggle="offcanvas"
  data-bs-target="#offcanvasRight"
  aria-controls="offcanvasRight"
>
  <i className="fa-solid fa-border-all"></i>
</button>
```

## API Requirements

### GET /api/auth/profile

Expected response structure:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "email": "john@example.com",
      "bio": "User bio",
      
      // Stats
      "totalCreations": 42,
      "_count": {
        "followers": 2500,
        "following": 150
      },
      
      // AI Credits
      "dailyGenerationsUsed": 7,
      "dailyGenerationsLimit": 10,
      "monthlyGenerationsUsed": 35,
      "monthlyGenerationsLimit": 50,
      
      // Coins
      "coinBalance": 1250,
      "totalCoinsEarned": 5000,
      "totalCoinsSpent": 3750,
      
      // Subscription
      "subscriptionTier": "Pro",
      "subscriptionStatus": "active"
    }
  }
}
```

### POST /api/auth/logout

Request:
```javascript
{
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Styling Customization

### Change Color Scheme

Edit `Sidebar.css`:

```css
/* Purple Accent (Current) */
.custom-progress-fill {
    background: linear-gradient(90deg, #9b6cf8 0%, #c084fc 100%);
}

/* Blue Accent (Alternative) */
.custom-progress-fill {
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

/* Green Accent (Alternative) */
.custom-progress-fill {
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}
```

### Adjust Sidebar Width

```css
.offcanvas.offcanvas-end {
    width: 350px; /* Default: 320px */
}
```

### Change Background

```css
.offcanvas.offcanvas-end {
    background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
}
```

## Error Handling

### Scenario 1: API Fails
```javascript
// Falls back to Redux data
const displayName = userStats 
  ? `${userStats.firstName} ${userStats.lastName}`.trim() 
  : user?.firstName || 'User';
```

### Scenario 2: Image Not Found
```jsx
<img 
  src={avatarUrl} 
  onError={(e) => e.target.src = '/assets/profile.png'}
/>
```

### Scenario 3: Missing Data
```javascript
// Shows 0 instead of undefined
{formatNumber(userStats?.totalCreations || 0)}
```

## Testing Checklist

- [ ] Sidebar opens when trigger button is clicked
- [ ] User profile data loads correctly
- [ ] Statistics display accurate numbers
- [ ] Progress bar shows correct percentage
- [ ] Coin balance displays properly
- [ ] Theme selector changes theme
- [ ] Language selector changes language
- [ ] Logout button logs out and closes sidebar
- [ ] Loading states show while fetching
- [ ] Error states don't break UI
- [ ] Avatar fallback works if image fails
- [ ] Responsive on mobile devices
- [ ] Smooth animations and transitions
- [ ] Scrollbar appears when content overflows

## Performance Tips

1. **Lazy Load Profile**: Only fetches when sidebar is opened (already implemented)
2. **Cache Results**: Consider caching profile data for 5 minutes
3. **Optimize Images**: Ensure avatar images are optimized
4. **Debounce Updates**: If adding real-time features, debounce updates

## Common Issues

### Issue: "bootstrap is not defined"
**Solution**: Ensure Bootstrap JS is loaded before React app:
```html
<script src="bootstrap.bundle.min.js"></script>
<script src="your-react-app.js"></script>
```

### Issue: Sidebar doesn't show user data
**Solution**: Check Redux state:
```javascript
// In browser console
store.getState().auth.user
```

### Issue: Logout doesn't work
**Solution**: Verify API endpoint and token:
```javascript
// Check localStorage
localStorage.getItem('accessToken')
```

### Issue: Numbers show "NaN"
**Solution**: Ensure API returns numbers, not strings:
```javascript
totalCreations: 42  // ✅ Good
totalCreations: "42"  // ❌ Bad
```

## Next Steps

1. **Add Profile Navigation**: Make "View Profile" button functional
2. **Implement Account Settings**: Create settings page
3. **Add Notifications**: Badge count for notifications
4. **Real-time Updates**: WebSocket for live stats
5. **Add Achievements**: Show user badges/achievements
6. **Theme Switching**: Implement actual theme switching logic
7. **Language Support**: Add i18n for translations

## Example Usage in App

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import HomeFeed from './components/HomeFeed/HomeFeed';

function App() {
  const { isLoggedIn } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Navbar />
      
      {isLoggedIn && (
        <>
          <HomeFeed />
          <Sidebar />
        </>
      )}
    </div>
  );
}

export default App;
```

## Support

For issues or questions:
1. Check the main README.md
2. Review API documentation
3. Check browser console for errors
4. Verify Redux DevTools state
