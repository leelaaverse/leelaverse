# Testing Guide for Dynamic Feed

## Prerequisites
1. Backend server running on `http://localhost:3000`
2. Database populated with posts
3. Frontend dev server ready to start

## Test Checklist

### ✅ Initial Load
- [ ] Open browser to `http://localhost:5173`
- [ ] Skeleton loaders appear first
- [ ] Posts load after API call completes
- [ ] First row shows 2 large posts
- [ ] Following rows show 4 medium posts each

### ✅ Category Switching
- [ ] Click "Featured" tab - posts reload
- [ ] Click "Trending" tab - posts reload
- [ ] Click "Following" tab - posts reload
- [ ] Skeleton shows during category switch
- [ ] Posts reset when changing tabs

### ✅ Infinite Scrolling
- [ ] Scroll to bottom of page
- [ ] More posts automatically load
- [ ] Skeleton row appears at bottom during load
- [ ] Page counter increments correctly
- [ ] No duplicate posts appear

### ✅ Post Card Hover
- [ ] Hover over any post
- [ ] Overlay fades in smoothly
- [ ] Author info displays (avatar, name, date)
- [ ] Stats display (views, likes, comments)
- [ ] Category badge visible
- [ ] Image scales slightly

### ✅ Lazy Loading
- [ ] Images load as they enter viewport
- [ ] Skeleton visible before image loads
- [ ] Smooth transition when image appears
- [ ] Broken images fallback to placeholder

### ✅ Edge Cases
- [ ] End of posts shows "You've reached the end!"
- [ ] Empty feed shows "No posts available"
- [ ] Network errors display properly
- [ ] Back button works correctly
- [ ] Refresh preserves tab selection

### ✅ Responsive Design
- [ ] Desktop (1920px) - Full grid layout
- [ ] Tablet (768px) - Adjusted spacing
- [ ] Mobile (375px) - Single column

### ✅ Performance
- [ ] Smooth scrolling with many posts
- [ ] No memory leaks during infinite scroll
- [ ] Images load efficiently
- [ ] Redux DevTools shows correct state

## Test Data Requirements

### Minimum Posts in Database
- At least 20 posts for infinite scroll testing
- Posts should have:
  - `imageUrl` (valid image URL)
  - `title` or `prompt`
  - `category` ('featured', 'trending', or 'following')
  - `author` object with username, firstName, lastName
  - `viewsCount`, `likesCount`, `commentsCount`
  - `createdAt` timestamp

### Sample API Response
```bash
curl "http://localhost:3000/api/posts/feed?category=featured&page=1&limit=12"
```

Expected response:
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

## Development Commands

### Start Frontend
```bash
cd Leelaah-frontend
npm run dev
```

### Start Backend
```bash
cd backend
npm start
```

### Check Redux State (Browser Console)
```javascript
// View current posts state
store.getState().posts

// View auth state
store.getState().auth
```

## Common Issues & Fixes

### Issue: Posts not loading
**Fix**: Check browser console for CORS errors. Verify backend is running on port 3000.

### Issue: Infinite scroll not working
**Fix**: Check if `hasMore` is true in Redux state. Verify pagination from API.

### Issue: Images not showing
**Fix**: Verify image URLs in database. Check if placeholder image exists at `/assets/placeholder.png`.

### Issue: Skeleton loading forever
**Fix**: Check API response time. Verify network tab for failed requests.

### Issue: Duplicate posts appearing
**Fix**: Redux slice has duplicate prevention. Check if API returns consistent data.

## Browser DevTools Testing

### Network Tab
- Monitor API calls to `/api/posts/feed`
- Verify query parameters (category, page, limit)
- Check response times and payload size

### Console
- No errors should appear
- Look for success logs: "✅ OAuth authentication successful!"

### Redux DevTools
- Install Redux DevTools extension
- Monitor state changes
- Track actions: `posts/fetchFeedPosts/pending`, `posts/fetchFeedPosts/fulfilled`

### Performance Tab
- Check for memory leaks during scrolling
- Verify smooth 60fps scrolling
- Monitor image loading times

## Screenshot Checklist
- [ ] Initial skeleton state
- [ ] Loaded posts (desktop)
- [ ] Post hover state
- [ ] Loading more skeleton
- [ ] End of feed message
- [ ] Mobile responsive view

---

**Testing Status**: Ready for QA
**Environment**: Development
**Last Updated**: November 14, 2025
