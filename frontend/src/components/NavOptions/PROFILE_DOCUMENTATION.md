# Profile System Documentation

## Overview
The Profile component is a comprehensive user profile system for the leelaah AI social media platform. It supports both viewing your own profile and viewing other users' profiles with different permissions.

## Features

### 🎨 Profile Display
- **Cover Image**: Customizable banner image with gradient fallback
- **Avatar**: Profile picture with border styling
- **User Stats**: Posts, Followers, Following counts
- **Bio Section**: User description with rich formatting
- **Location & Website**: Additional user information
- **Verification Badge**: Blue checkmark for verified users

### ⚙️ Profile Settings (Own Profile Only)
- **Profile Information**:
  - Username
  - Display Name (First Name)
  - Bio (160 character limit with counter)
  - Avatar URL
  - Cover Image URL
  - Location
  - Website

- **Multiple Setting Sections**:
  - Profile Info (Active)
  - Appearance (Coming Soon)
  - Privacy (Coming Soon)

### 📑 Content Tabs
Users can view different types of content created by the profile owner:

#### 1. **Posts Tab**
- Grid layout of AI-generated images and uploaded content
- Hover effects showing likes and comments
- AI badge for AI-generated content
- Shows AI model used (FLUX Schnell, Stable Diffusion, etc.)

#### 2. **Thoughts Tab**
- Text-only posts/status updates
- Similar to tweets or status updates
- Shows timestamp, likes, and comments
- Clean card-based layout
- Perfect for sharing ideas and quick updates

#### 3. **Shorts Tab**
- Vertical video thumbnails (9:16 aspect ratio)
- View count and duration display
- Play button overlay on hover
- Optimized for short-form video content

### 🔒 Permission System
The profile component intelligently handles two modes:

#### Own Profile (`isOwnProfile={true}`)
- **Edit Profile** button in cover image
- Can modify all settings
- Full access to ProfileSettings modal
- Shows personal statistics

#### Other User's Profile (`isOwnProfile={false}`)
- No edit functionality
- **Follow** button displayed
- **Message** button available
- View-only access to content

## Component Structure

```
NavOptions/
├── Profile.jsx              # Main profile component
└── ProfileSettings.jsx      # Settings modal component
```

## Usage

### Basic Usage (Own Profile)
```jsx
import Profile from './NavOptions/Profile';

<Profile 
  currentUser={currentUser} 
  isOwnProfile={true}
/>
```

### Viewing Another User's Profile
```jsx
<Profile 
  currentUser={currentUser}
  isOwnProfile={false}
  viewingUsername="other_user_123"
/>
```

## Props

### Profile Component
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentUser` | Object | Required | User data object with profile information |
| `isOwnProfile` | Boolean | `true` | Whether viewing own profile or someone else's |
| `viewingUsername` | String | `null` | Username of the profile being viewed (for other profiles) |

### ProfileSettings Component
| Prop | Type | Description |
|------|------|-------------|
| `currentUser` | Object | Current user data for pre-filling form |
| `onSave` | Function | Callback when user saves changes |
| `onCancel` | Function | Callback when user cancels/closes modal |

## User Data Structure
```javascript
{
  id: 'user_id',
  username: 'creative_explorer',
  firstName: 'John Doe',
  avatar: 'https://...',
  coverImage: 'https://...',
  bio: 'AI artist and creator...',
  location: 'San Francisco, CA',
  website: 'https://mysite.com',
  posts: 156,
  followers: '1.2K',
  following: 892,
  verificationStatus: 'verified' // or 'unverified'
}
```

## Content Data Structures

### Posts
```javascript
{
  id: 1,
  type: 'image',
  mediaUrl: 'https://...',
  likes: 234,
  comments: 12,
  aiGenerated: true,
  aiModel: 'FLUX Schnell'
}
```

### Thoughts
```javascript
{
  id: 1,
  text: "Just discovered an amazing AI model...",
  timestamp: "2h ago",
  likes: 45,
  comments: 8
}
```

### Shorts
```javascript
{
  id: 1,
  thumbnail: 'https://...',
  views: '12.5K',
  duration: '0:15'
}
```

## Styling
- Uses Tailwind CSS with custom cabin font classes
- Dark mode support throughout
- Responsive design (mobile, tablet, desktop)
- Smooth transitions and hover effects
- Gradient accents for CTAs

## Future Enhancements
- [ ] Real API integration for profile updates
- [ ] Image upload functionality
- [ ] Profile theme customization
- [ ] Privacy settings implementation
- [ ] Activity/Analytics tab
- [ ] Saved/Bookmarked content tab
- [ ] Profile badges and achievements
- [ ] Social sharing capabilities

## Technical Notes
- Component uses React hooks (useState)
- Modal overlay with backdrop blur
- Form validation for required fields
- Character limit enforcement on bio
- Responsive grid layouts
- Optimized for performance with proper key props

## Integration with Dashboard
The Profile component is integrated into the Dashboard's navigation system and renders when the 'profile' tab is active.

```javascript
case 'profile':
  return <Profile currentUser={currentUser} />;
```

## Accessibility
- Semantic HTML structure
- Alt text on all images
- Keyboard navigation support
- Focus states on interactive elements
- ARIA labels where appropriate
