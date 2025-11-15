# Dynamic Feed Implementation with Redux

## Overview
This implementation transforms the static home feed into a dynamic, infinite-scrolling feed powered by Redux state management and the backend API.

## Features Implemented

### ✅ Redux State Management
- **Store Structure**: Centralized state management using Redux Toolkit
- **Posts Slice**: Handles post fetching, pagination, and category filtering
- **Auth Slice**: Manages user authentication state

### ✅ Dynamic Post Loading
- **API Integration**: Connects to `/api/posts/feed` endpoint
- **Category Support**: Featured, Trending, and Following tabs
- **Pagination**: Page-based loading with configurable limit (default: 12 posts per page)

### ✅ Infinite Scrolling
- **Intersection Observer**: Automatic loading when scrolling near the bottom
- **Smart Loading**: Only fetches when more posts are available
- **Offset Management**: Proper page tracking to avoid duplicates

### ✅ Lazy Loading & Skeletons
- **Lazy Image Loading**: Native browser lazy loading with `loading="lazy"`
- **Skeleton Loaders**: Beautiful shimmer effect during initial load
- **Loading States**:
  - Initial load: Full skeleton grid
  - Load more: Skeleton row at bottom
  - Image loading: Individual skeleton per image

### ✅ Post Card Component
- **Responsive Design**: Adapts to different screen sizes
- **Size Variants**: Large (col-md-6) and Medium (col-md-3)
- **Hover Details**: Shows author info, stats, and metadata on hover
- **Image Optimization**: Proper error handling and fallbacks

### ✅ UI Features
- **Maintained Layout**: First row with 2 large posts, subsequent rows with 4 medium posts
- **Smooth Animations**: Fade-in effects and hover transitions
- **Tailwind CSS**: Modern styling with utility classes
- **Responsive Grid**: Mobile-friendly breakpoints

## File Structure

```
Leelaah-frontend/
├── src/
│   ├── store/
│   │   ├── store.js                 # Redux store configuration
│   │   └── slices/
│   │       ├── postsSlice.js        # Posts state management
│   │       └── authSlice.js         # Auth state management
│   ├── components/
│   │   ├── HomeFeed/
│   │   │   └── HomeFeed.jsx         # Main container (Redux integrated)
│   │   ├── MainContent/
│   │   │   ├── MainContent.jsx      # Dynamic feed with infinite scroll
│   │   │   └── MainContent.css      # Layout styles
│   │   ├── PostCard/
│   │   │   ├── PostCard.jsx         # Individual post card
│   │   │   └── PostCard.css         # Post card styles
│   │   └── PostSkeleton/
│   │       ├── PostSkeleton.jsx     # Loading skeleton component
│   │       └── PostSkeleton.css     # Skeleton styles
│   └── main.jsx                     # Redux Provider setup
└── .env                             # Environment variables
```

## API Integration

### Endpoint
```
GET /api/posts/feed
```

### Query Parameters
- `category`: 'featured' | 'trending' | 'following'
- `page`: Number (default: 1)
- `limit`: Number (default: 12)

### Response Format
```json
{
  "success": true,
  "posts": [
    {
      "id": "string",
      "imageUrl": "string",
      "title": "string",
      "prompt": "string",
      "category": "string",
      "createdAt": "ISO date",
      "viewsCount": number,
      "likesCount": number,
      "commentsCount": number,
      "author": {
        "id": "string",
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "avatar": "string",
        "verificationStatus": "string",
        "totalCreations": number
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

## Redux State Structure

### Posts State
```javascript
{
  posts: [],              // Array of post objects
  currentCategory: '',    // Active category filter
  loading: false,         // Initial load status
  loadingMore: false,     // Load more status
  error: null,            // Error message
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  },
  hasMore: true          // Whether more posts are available
}
```

## How It Works

### 1. Initial Load
```javascript
// Fetches first page when component mounts or tab changes
dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 }));
```

### 2. Category Change
```javascript
// Resets posts and fetches new category
dispatch(setCategory('trending'));
dispatch(fetchFeedPosts({ category: 'trending', page: 1, limit: 12 }));
```

### 3. Infinite Scroll
```javascript
// Intersection Observer triggers when user scrolls near bottom
if (target.isIntersecting && hasMore && !loading && !loadingMore) {
  const nextPage = pagination.page + 1;
  dispatch(fetchFeedPosts({ category, page: nextPage, limit: 12 }));
}
```

### 4. Layout Algorithm
```javascript
// First row: 2 large posts (col-md-6)
// Remaining rows: 4 medium posts each (col-md-3)
// Maintains consistent grid layout
```

## Styling Features

### Skeleton Loader
- Shimmer animation effect
- Matches post card dimensions
- Smooth transition when image loads

### Post Card Hover
- Fade-in overlay with gradient
- Author information with avatar
- Post stats (views, likes, comments)
- Category badge
- Smooth scale animation

### Responsive Design
- Desktop: Full grid layout
- Tablet: Adjusted spacing
- Mobile: Single column (handled by Bootstrap grid)

## Performance Optimizations

1. **Memoization**: PostCard component is memoized with React.memo
2. **Lazy Loading**: Images load only when entering viewport
3. **Debounced Scroll**: Intersection Observer with 100px root margin
4. **Duplicate Prevention**: Filters duplicate posts during pagination
5. **Smart Loading**: Only fetches when necessary (hasMore check)

## Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

## Usage

### Start Development Server
```bash
cd Leelaah-frontend
npm run dev
```

### Backend Requirements
```bash
cd backend
npm start
```

Make sure the backend is running on `http://localhost:3000` or update `VITE_API_URL` accordingly.

## Troubleshooting

### Posts Not Loading
- Check if backend is running
- Verify API endpoint in Redux slice
- Check browser console for errors
- Ensure CORS is properly configured

### Infinite Scroll Not Working
- Check if `hasMore` is true
- Verify pagination data from API
- Ensure observer target is rendered

### Images Not Showing
- Verify `imageUrl` field in post data
- Check image URLs are accessible
- Ensure fallback image exists at `/assets/placeholder.png`

## Next Steps

Potential enhancements:
- Add error retry mechanism
- Implement pull-to-refresh
- Add post detail modal
- Implement like/comment functionality
- Add skeleton count based on viewport size
- Optimize image delivery with CDN
- Add virtualization for thousands of posts

## Dependencies Added

```json
{
  "axios": "^1.x.x"
}
```

Existing dependencies used:
- @reduxjs/toolkit
- react-redux
- tailwindcss

---

**Status**: ✅ Fully Implemented
**Date**: November 14, 2025
**Version**: 1.0.0
