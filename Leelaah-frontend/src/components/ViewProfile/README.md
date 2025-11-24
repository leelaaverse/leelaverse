# ViewProfile Component

A comprehensive user profile page component that displays user information, statistics, and their created posts in a beautiful grid layout.

## Features

### 🎨 Design
- **Hero Section**: Large avatar with gradient background
- **Profile Information**: Display name, username, and bio
- **Statistics Dashboard**: Posts, followers, and following counts
- **Tabbed Navigation**: All Posts, Singularity, and Drafts
- **Grid Layout**: Responsive post grid with hover effects
- **Filter System**: Filter posts by type (Image, Video, Audio, Text)

### 📊 Dynamic Data
- Fetches user profile from API
- Loads user's posts
- Real-time statistics
- Smart number formatting (2.5k, 1.2M)
- Loading states

### 🚀 Functionality
- **Edit Profile**: Button to edit user information
- **Settings Access**: Quick access to settings
- **Post Filtering**: Filter posts by media type
- **Post Interaction**: View likes and comments count
- **Back Navigation**: Easy return to home feed
- **Responsive Design**: Works on all screen sizes

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onNavigate` | function | Yes | Callback to navigate between views |

## Usage

```jsx
import ViewProfile from './components/ViewProfile/ViewProfile';

function App() {
  const handleNavigate = (view) => {
    // Handle navigation logic
    setCurrentView(view);
  };

  return (
    <ViewProfile onNavigate={handleNavigate} />
  );
}
```

## Navigation Flow

```
Home Feed
    ↓
[Sidebar: View Profile Button Clicked]
    ↓
ViewProfile Component
    ↓
[Navbar: Back Button Clicked]
    ↓
Home Feed
```

## Component Structure

```jsx
ViewProfile
├── Navbar (with back button)
├── Profile Hero Section
│   ├── Large Avatar
│   ├── Display Name & Username
│   ├── Bio
│   ├── Edit Profile Button
│   ├── Settings Button
│   └── Statistics (Posts, Followers, Following)
├── Profile Content
│   ├── Tabs (All Posts, Singularity, Drafts)
│   ├── Filter Dropdown
│   └── Posts Grid
│       ├── Post Items (with hover overlay)
│       └── No Posts State
└── Sidebar
```

## API Integration

### Endpoints Used

1. **Get Profile**
```javascript
GET /api/auth/profile
Response: {
  success: true,
  data: {
    user: {
      id, username, firstName, lastName,
      avatar, bio, totalCreations,
      _count: { followers, following }
    }
  }
}
```

2. **Get User Posts**
```javascript
GET /api/posts/user/:userId
Response: {
  success: true,
  posts: [
    {
      id, title, mediaUrl, thumbnailUrl,
      mediaType, _count: { likes, comments }
    }
  ]
}
```

## Features Breakdown

### Profile Hero Section
- **Avatar**: 150x150px circular image with purple border and shadow
- **Display Name**: Full name from user profile
- **Username**: @username format
- **Bio**: User's biography or default text
- **Statistics**: Dynamic counts with formatted numbers

### Action Buttons
- **Edit Profile**: Opens profile editing (to be implemented)
- **Settings**: Quick access to settings (to be implemented)

### Tabs System
```javascript
- All Posts: Shows all user posts
- Singularity: Featured/special posts (to be implemented)
- Drafts: Unpublished posts (to be implemented)
```

### Post Filtering
```javascript
Filter Types:
- All: Shows everything
- Image: Only image posts
- Video: Only video posts
- Audio: Only audio posts
- Text: Text-only posts
```

### Posts Grid
- **Responsive Grid**: Auto-adjusts columns based on screen width
- **Hover Effects**: Overlay with stats appears on hover
- **Post Stats**: Shows like and comment counts
- **Placeholder**: Shows icon for posts without media

## Styling

### Color Scheme
```css
Background: #000 (Black)
Hero Gradient: rgba(155, 108, 248, 0.1) → transparent
Accent: #9b6cf8 (Purple)
Text Primary: #fff (White)
Text Secondary: #999 (Gray)
Borders: rgba(255, 255, 255, 0.08)
```

### Key CSS Classes

#### Layout
- `.view-profile`: Main container
- `.profile-main`: Content wrapper
- `.profile-hero`: Hero section
- `.profile-content`: Posts section

#### Profile Elements
- `.profile-avatar-large`: 150x150px avatar
- `.profile-username`: Username display
- `.profile-display-name`: Full name
- `.profile-bio`: Biography text
- `.profile-stats`: Statistics container

#### Buttons
- `.btn-edit-profile`: Edit profile button
- `.btn-settings`: Settings icon button
- `.filter-btn`: Filter dropdown trigger

#### Posts
- `.posts-grid`: Grid container
- `.post-grid-item`: Individual post
- `.post-overlay`: Hover overlay
- `.no-posts`: Empty state

## State Management

```javascript
const [userProfile, setUserProfile] = useState(null);
const [userPosts, setUserPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('all');
const [filterType, setFilterType] = useState('all');
```

## Responsive Breakpoints

```css
Desktop (1200px+): 4-5 columns
Tablet (768px - 1199px): 3-4 columns
Mobile (480px - 767px): 2 columns
Small Mobile (<480px): 1-2 columns
```

## Loading States

```jsx
{loading ? (
  <div className="profile-loading">
    <div className="spinner"></div>
    <p>Loading profile...</p>
  </div>
) : (
  // Profile content
)}
```

## Empty States

```jsx
{filteredPosts.length === 0 && (
  <div className="no-posts">
    <i className="fa-solid fa-image"></i>
    <h3>No posts yet</h3>
    <p>Start creating amazing content!</p>
  </div>
)}
```

## Integration with Other Components

### Sidebar Integration
```jsx
// In Sidebar.jsx
<button onClick={() => onNavigate('profile')}>
  View Profile
</button>
```

### Navbar Integration
```jsx
// In ViewProfile
<Navbar 
  isLoggedIn={true} 
  onBack={() => onNavigate('home')} 
  showBackButton={true} 
/>
```

### App.jsx Integration
```jsx
const [currentView, setCurrentView] = useState('home');

{currentView === 'profile' ? (
  <ViewProfile onNavigate={setCurrentView} />
) : (
  <HomeFeed onNavigate={setCurrentView} />
)}
```

## Future Enhancements

- [ ] Edit profile modal
- [ ] Upload new avatar
- [ ] Edit bio inline
- [ ] Post detail modal on click
- [ ] Infinite scroll for posts
- [ ] Share profile functionality
- [ ] Follow/Unfollow buttons (for other users)
- [ ] Activity timeline tab
- [ ] Collections/Albums
- [ ] Export profile data
- [ ] Profile themes

## Error Handling

```javascript
// Profile fetch error
try {
  const response = await apiService.auth.getProfile();
  setUserProfile(response.data.data.user);
} catch (error) {
  console.error('Failed to fetch profile:', error);
  // Falls back to Redux user data
}

// Posts fetch error
try {
  const response = await apiService.posts.getUserPosts(user.id);
  setUserPosts(response.data.posts || []);
} catch (error) {
  console.error('Failed to fetch user posts:', error);
  setUserPosts([]); // Shows empty state
}

// Image load error
<img 
  src={avatarUrl}
  onError={(e) => e.target.src = '/assets/profile.png'}
/>
```

## Performance Optimizations

1. **Lazy Loading**: Only fetch data when component mounts
2. **Image Optimization**: Use thumbnails for grid view
3. **Conditional Rendering**: Only render visible posts
4. **Memoization**: Cache formatted numbers and stats
5. **Debounced Filtering**: Optimize filter performance

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader friendly labels
- ✅ Focus indicators on interactive elements
- ✅ Semantic HTML structure
- ✅ Alt text for images
- ✅ ARIA labels where needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Redux (for user state)
- API Service (for data fetching)
- Font Awesome (for icons)
- Bootstrap (for offcanvas in Sidebar)

## Testing Checklist

- [ ] Profile loads with correct user data
- [ ] Statistics display accurate numbers
- [ ] Posts grid renders properly
- [ ] Filtering works for all types
- [ ] Tabs switch correctly
- [ ] Back button navigates to home
- [ ] Edit/Settings buttons are clickable
- [ ] Responsive on all screen sizes
- [ ] Loading state shows correctly
- [ ] Empty state shows when no posts
- [ ] Hover effects work on posts
- [ ] Avatar fallback works
- [ ] Navigation integration works

## Troubleshooting

### Issue: Profile doesn't load
**Check**: User is logged in and Redux state has user data

### Issue: Posts don't appear
**Check**: API endpoint `/api/posts/user/:userId` is accessible

### Issue: Images not loading
**Check**: Media URLs are correct and accessible

### Issue: Back button doesn't work
**Check**: `onNavigate` prop is passed correctly

## Example Complete Flow

```javascript
// 1. User logs in
dispatch(setAuth({ user, token }));

// 2. User opens sidebar
<Sidebar onNavigate={handleNavigate} />

// 3. User clicks "View Profile"
// Sidebar closes, ViewProfile opens

// 4. ViewProfile fetches data
useEffect(() => {
  fetchUserProfile();
  fetchUserPosts();
}, []);

// 5. Profile displays with data
<div className="profile-hero">
  <img src={avatar} />
  <h2>{username}</h2>
  <div className="stats">...</div>
</div>

// 6. User clicks back button
<Navbar onBack={() => onNavigate('home')} />

// 7. Returns to HomeFeed
```

## Credits

Part of the Leelaverse project - A social platform for AI-generated content.
