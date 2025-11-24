# Sidebar Component

A dynamic, minimalistic, and aesthetic sidebar component for user profile and navigation in the Leelaverse application.

## Features

### 🎨 Design
- **Minimalistic & Modern**: Clean, gradient-based design with smooth animations
- **Responsive**: Adapts to different screen sizes
- **Dark Theme**: Beautiful dark mode with purple accent colors
- **Smooth Interactions**: Hover effects, transitions, and micro-animations

### 🔄 Dynamic Data
- **Redux Integration**: Fetches user data from Redux store
- **API Integration**: Loads complete profile data via API
- **Real-time Updates**: Displays current user stats and information
- **Loading States**: Shows loading indicators while fetching data

### 📊 User Information Display
- **Profile Section**: User avatar, name, and username
- **Statistics**:
  - Total posts created
  - Followers count
  - Following count
- **AI Credit Usage**:
  - Daily generation usage progress
  - Subscription tier badge
  - Coin balance
- **Dynamic Calculations**: Automatically formats large numbers (e.g., 2.5k)

### ⚙️ Settings & Preferences
- **Theme Selector**: Switch between Light, Dark, and Auto themes
- **Language Selector**: Choose from English, Hindi, Spanish
- **Persistent Settings**: Saves preferences to localStorage

### 🚀 Navigation
- View Profile
- Account Settings
- Join Discord
- Help & Support
- Logout functionality

## Props

The component doesn't require any props as it uses Redux for state management.

## Usage

```jsx
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <div>
      {/* Sidebar is triggered by Bootstrap offcanvas */}
      <button
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
      >
        Open Sidebar
      </button>
      
      <Sidebar />
    </div>
  );
}
```

## Redux State Structure

The component expects the following Redux state structure:

```javascript
{
  auth: {
    isLoggedIn: boolean,
    user: {
      id: string,
      username: string,
      email: string,
      firstName: string,
      lastName: string,
      avatar: string,
      // ... other user fields
    },
    token: string
  }
}
```

## API Endpoints Used

### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  success: true,
  data: {
    user: {
      id: string,
      username: string,
      firstName: string,
      lastName: string,
      avatar: string,
      totalCreations: number,
      dailyGenerationsUsed: number,
      dailyGenerationsLimit: number,
      coinBalance: number,
      subscriptionTier: string,
      _count: {
        followers: number,
        following: number
      }
    }
  }
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

## Data Flow

1. **Component Mount**:
   - Reads user from Redux store
   - Fetches complete profile from API
   - Loads theme and language from localStorage

2. **User Interaction**:
   - Theme/Language change → Updates localStorage
   - Logout → Calls API → Dispatches Redux action → Closes sidebar

3. **Data Display**:
   - Shows loading state while fetching
   - Calculates credit usage percentage
   - Formats numbers for better readability
   - Displays fallback values if data is unavailable

## Styling

### CSS Classes

#### Layout
- `.offcanvas-end`: Main sidebar container
- `.offcanvas-header`: Header section with profile
- `.offcanvas-body`: Scrollable body content

#### Profile Section
- `.sidebar-avatar`: User avatar container
- `.sidebar-user-info`: Name and username display

#### Stats Section
- `.sidebar-stats`: Stats container
- `.stat-item`: Individual stat (posts, followers, following)
- `.stat-value`: Numeric value
- `.stat-label`: Stat label text
- `.stat-divider`: Vertical divider between stats

#### Credit Card
- `.credit-card`: AI credit usage card
- `.credit-header`: Header with title and tier badge
- `.credit-tier`: Subscription tier badge
- `.custom-progress-bar`: Progress bar container
- `.custom-progress-fill`: Filled portion of progress
- `.coin-balance`: Coin balance display

#### Navigation
- `.sidebar-nav`: Navigation items container
- `.sidebar-nav-item`: Individual navigation button
- `.sidebar-nav-item-select`: Navigation item with select dropdown
- `.nav-item-content`: Left content (icon + text)
- `.sidebar-select`: Custom styled select dropdown

#### Actions
- `.sidebar-logout`: Logout button container
- `.logout-btn`: Logout button

### Color Scheme

```css
Primary Colors:
- Background Gradient: #2a2a2a → #1f1f1f
- Accent Purple: #9b6cf8
- Text Primary: #ffffff
- Text Secondary: #999999

Interactive States:
- Hover Background: rgba(255, 255, 255, 0.05)
- Border Color: rgba(255, 255, 255, 0.08)
- Progress Bar: Linear gradient #9b6cf8 → #c084fc

Logout Button:
- Background: #dc2626 → #b91c1c
- Shadow: rgba(220, 38, 38, 0.3)
```

## Customization

### Change Theme Colors

Edit `Sidebar.css`:

```css
/* Change accent color */
.custom-progress-fill {
    background: linear-gradient(90deg, #your-color 0%, #your-color-light 100%);
}

.credit-tier {
    color: #your-color;
    background: rgba(your-color-rgb, 0.15);
}
```

### Add New Navigation Items

```jsx
<button className="sidebar-nav-item">
    <div className="nav-item-content">
        <img src="/assets/your-icon.png" alt="Item" width="18" height="18" />
        <span>Your Item</span>
    </div>
    <i className="fa-solid fa-chevron-right"></i>
</button>
```

### Modify Stats Display

```jsx
// Add new stat in the sidebar-stats section
<div className="stat-item">
    <h4 className="stat-value">
        {formatNumber(userStats?.yourStat || 0)}
    </h4>
    <p className="stat-label">Your Label</p>
</div>
```

## Error Handling

The component includes robust error handling:

1. **Image Loading**: Falls back to default profile image on error
2. **API Failures**: Logs errors and continues with cached Redux data
3. **Missing Data**: Shows fallback values (0, 'User', etc.)
4. **Loading States**: Displays "Loading..." or "..." while fetching

## Performance Optimizations

- **Lazy Loading**: Profile data fetched only when needed
- **Memoization**: Calculations cached to prevent re-renders
- **Smooth Animations**: CSS transitions instead of JS animations
- **Efficient State Updates**: Only updates changed values

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- Redux Toolkit
- React Redux
- Bootstrap 5 (for offcanvas functionality)
- Font Awesome (for icons)
- Axios (via apiService)

## Future Enhancements

- [ ] Add notification badge on support icon
- [ ] Implement profile picture upload directly from sidebar
- [ ] Add quick stats animation on open
- [ ] Implement swipe gestures for mobile
- [ ] Add keyboard navigation support
- [ ] Create dark/light theme transition animation
- [ ] Add user achievements/badges section
- [ ] Implement quick actions menu

## Troubleshooting

### Sidebar not opening
- Ensure Bootstrap JS is loaded
- Check if `offcanvasRight` ID matches trigger button

### User data not showing
- Verify Redux store has user data
- Check API endpoint is accessible
- Ensure auth token is valid

### Styles not applying
- Import `Sidebar.css` in component
- Check for CSS conflicts with global styles
- Verify CSS file path is correct

## Contributing

When contributing to this component:
1. Maintain the minimalistic design philosophy
2. Ensure all new features are responsive
3. Add loading states for async operations
4. Update this README with new features
5. Test across different screen sizes

## License

This component is part of the Leelaverse project.
