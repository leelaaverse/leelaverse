# Component Hierarchy & Data Flow

## Component Tree

```
App
└── Provider (Redux Store)
    └── HomeFeed
        ├── Navbar
        │   └── [Category Tabs: Featured | Trending | Following]
        │
        ├── MainContent ⭐ (Dynamic Feed)
        │   ├── PostSkeleton (initial load)
        │   │   └── [Skeleton × 10]
        │   │
        │   ├── Row 1 (Large Posts)
        │   │   ├── PostCard (size="large")
        │   │   │   ├── Image (lazy loading)
        │   │   │   └── Overlay (on hover)
        │   │   │       ├── Author Info
        │   │   │       ├── Post Stats
        │   │   │       └── Category Badge
        │   │   │
        │   │   └── PostCard (size="large")
        │   │
        │   ├── Row 2-N (Medium Posts)
        │   │   ├── PostCard (size="medium") × 4
        │   │   ├── PostCard (size="medium") × 4
        │   │   └── ...
        │   │
        │   ├── Observer Target (infinite scroll)
        │   │
        │   └── PostSkeleton (loading more)
        │
        ├── Sidebar
        ├── FloatingBar
        └── AuthModal
```

---

## Redux Store Structure

```
store
├── posts
│   ├── posts: []
│   ├── currentCategory: 'featured'
│   ├── loading: false
│   ├── loadingMore: false
│   ├── error: null
│   ├── pagination
│   │   ├── page: 1
│   │   ├── limit: 12
│   │   ├── total: 100
│   │   └── pages: 9
│   └── hasMore: true
│
└── auth
    ├── isLoggedIn: false
    ├── user: null
    └── token: null
```

---

## Data Flow Diagram

### 1. Initial Load Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User opens app                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ HomeFeed Component Mounts                                   │
│ • Check localStorage for auth                               │
│ • Dispatch setAuth if logged in                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ MainContent Component Mounts                                │
│ • activeTab = 'featured'                                    │
│ • posts.length = 0                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ useEffect Triggers                                          │
│ dispatch(fetchFeedPosts({                                   │
│   category: 'featured',                                     │
│   page: 1,                                                  │
│   limit: 12                                                 │
│ }))                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Redux Action: posts/fetchFeedPosts/pending                  │
│ • loading = true                                            │
│ • error = null                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • Shows PostSkeleton × 10                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API Service Layer                                           │
│ apiService.posts.getFeed({                                  │
│   category: 'featured',                                     │
│   page: 1,                                                  │
│   limit: 12                                                 │
│ })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Axios Request                                               │
│ GET /api/posts/feed?category=featured&page=1&limit=12      │
│ • Interceptor adds Authorization header                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend API Handler (postController.getFeedPosts)          │
│ • Query database with filters                              │
│ • Include author data                                       │
│ • Calculate pagination                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API Response                                                │
│ {                                                           │
│   success: true,                                            │
│   posts: [...12 posts...],                                  │
│   pagination: { page: 1, limit: 12, total: 100, pages: 9 } │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Redux Action: posts/fetchFeedPosts/fulfilled                │
│ • loading = false                                           │
│ • posts = response.posts                                    │
│ • pagination = response.pagination                          │
│ • hasMore = page < pages                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • Remove skeletons                                          │
│ • Show PostCard × 12                                        │
│   - Row 1: 2 large posts                                    │
│   - Row 2: 4 medium posts                                   │
│   - Row 3: 4 medium posts                                   │
│   - Row 4: 2 medium posts (remaining)                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Infinite Scroll Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User scrolls down                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Intersection Observer Target enters viewport               │
│ • threshold: 0.1                                            │
│ • rootMargin: '100px'                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ handleObserver Callback                                     │
│ • Check: target.isIntersecting = true                       │
│ • Check: hasMore = true                                     │
│ • Check: loading = false                                    │
│ • Check: loadingMore = false                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Calculate Next Page                                         │
│ nextPage = pagination.page + 1                              │
│ // Example: 1 + 1 = 2                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ dispatch(fetchFeedPosts({                                   │
│   category: 'featured',                                     │
│   page: 2,                                                  │
│   limit: 12                                                 │
│ }))                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Redux Action: posts/fetchFeedPosts/pending                  │
│ • loadingMore = true (NOT loading)                          │
│ • error = null                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • Shows PostSkeleton row at bottom                          │
│ • Existing posts remain visible                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API Request                                                 │
│ GET /api/posts/feed?category=featured&page=2&limit=12      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API Response                                                │
│ {                                                           │
│   success: true,                                            │
│   posts: [...12 more posts...],                             │
│   pagination: { page: 2, limit: 12, total: 100, pages: 9 } │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Redux Action: posts/fetchFeedPosts/fulfilled                │
│ • loadingMore = false                                       │
│ • posts = [...oldPosts, ...newPosts] (append)               │
│   - Filter duplicates by post.id                            │
│ • pagination = { page: 2, ... }                             │
│ • hasMore = 2 < 9 = true                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • Remove loading skeleton                                   │
│ • Show new PostCards                                        │
│ • Observer target moves down                                │
│ • Total posts now: 24                                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Category Switch Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Trending" tab                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Navbar Component                                            │
│ setActiveTab('trending')                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ MainContent useEffect Triggers                              │
│ • Detects: activeTab changed                                │
│ • currentCategory !== 'trending'                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ dispatch(setCategory('trending'))                           │
│ • Reset posts = []                                          │
│ • Reset pagination.page = 1                                 │
│ • Reset hasMore = true                                      │
│ • Set currentCategory = 'trending'                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • posts.length = 0                                          │
│ • Shows empty state briefly                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ dispatch(fetchFeedPosts({                                   │
│   category: 'trending',                                     │
│   page: 1,                                                  │
│   limit: 12                                                 │
│ }))                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ [Same flow as Initial Load]                                 │
│ • Show skeletons                                            │
│ • Fetch from API                                            │
│ • Display new posts                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Image Lazy Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│ PostCard Component Renders                                  │
│ <img loading="lazy" ... />                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Initial State                                               │
│ • imageLoaded = false                                       │
│ • Show skeleton overlay                                     │
│ • Image src set but not loaded                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Image enters viewport                                       │
│ • Browser triggers image load                               │
│ • Native lazy loading                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Image loads successfully                                    │
│ onLoad event fires                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ setState: imageLoaded = true                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Re-renders                                        │
│ • Remove skeleton overlay                                   │
│ • Show image with opacity: 1                                │
│ • Smooth transition                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

### Redux Actions

```javascript
// PENDING
dispatch({ type: 'posts/fetchFeedPosts/pending' })
→ loading = true (if page === 1)
→ loadingMore = true (if page > 1)

// FULFILLED
dispatch({
  type: 'posts/fetchFeedPosts/fulfilled',
  payload: {
    posts: [...],
    pagination: {...},
    category: 'featured',
    page: 1
  }
})
→ loading = false
→ loadingMore = false
→ posts = (page === 1) ? newPosts : [...oldPosts, ...newPosts]
→ pagination = newPagination
→ hasMore = page < pages

// REJECTED
dispatch({
  type: 'posts/fetchFeedPosts/rejected',
  payload: 'Error message'
})
→ loading = false
→ loadingMore = false
→ error = payload
```

---

## Component Lifecycle

### MainContent Component

```javascript
// Mount
useEffect(() => {
  // Check if initial load needed
  if (posts.length === 0 && !loading) {
    dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 }));
  }
}, []);

// Category Change
useEffect(() => {
  const category = getCategoryFromTab(activeTab);
  if (category !== currentCategory) {
    dispatch(setCategory(category));
    dispatch(fetchFeedPosts({ category, page: 1, limit: 12 }));
  }
}, [activeTab, currentCategory]);

// Infinite Scroll Observer
useEffect(() => {
  const observer = new IntersectionObserver(handleObserver, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  });

  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }

  return () => {
    if (observerTarget.current) {
      observer.unobserve(observerTarget.current);
    }
  };
}, [handleObserver]);
```

---

## Performance Optimizations

### 1. Memoization
```javascript
// PostCard is memoized
const PostCard = memo(({ post, size }) => {
  // Only re-renders if post or size changes
});
```

### 2. Duplicate Prevention
```javascript
// In Redux reducer
const existingIds = new Set(state.posts.map(p => p.id));
const newPosts = posts.filter(p => !existingIds.has(p.id));
state.posts = [...state.posts, ...newPosts];
```

### 3. Conditional Loading
```javascript
// Only load if conditions are met
if (target.isIntersecting && hasMore && !loading && !loadingMore) {
  dispatch(fetchFeedPosts(...));
}
```

### 4. Lazy Loading
```javascript
// Native browser lazy loading
<img loading="lazy" src={imageUrl} />
```

---

## Error Handling Flow

```
API Request
    │
    ├─ Success
    │   └─> fulfilled action → show posts
    │
    ├─ Network Error
    │   └─> rejected action → show error message
    │
    ├─ 401 Unauthorized
    │   └─> Interceptor → refresh token → retry
    │       ├─ Success → continue
    │       └─ Fail → logout → redirect
    │
    └─ 404/500 Server Error
        └─> rejected action → show error message
```

---

**This visualization covers all major data flows and component interactions in the dynamic feed implementation.**
