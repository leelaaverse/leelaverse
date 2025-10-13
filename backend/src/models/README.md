# LeelaVerse Database Models

This directory contains all Mongoose schemas for the LeelaVerse AI Social Media Platform.

## 📋 Models Overview

### Core Models

1. **User.js** - User profiles, authentication, and statistics
2. **Post.js** - User-generated and AI-generated content
3. **Comment.js** - Comments and nested replies on posts
4. **Like.js** - Like tracking for posts and comments (polymorphic)
5. **Save.js** - Saved/bookmarked posts with collections
6. **Follow.js** - User follow relationships

### Community & Engagement

7. **Group.js** - Community groups for AI creators
8. **Notification.js** - User notifications for various events
9. **Story.js** - Temporary 24-hour content
10. **Tag.js** - Hashtags and trending topics

### AI & Economy

11. **AIGeneration.js** - AI model usage and generation history
12. **CoinTransaction.js** - Virtual currency transaction tracking

## 🔗 Relationships

```
User
├── One-to-Many → Post (author)
├── One-to-Many → Comment (author)
├── One-to-Many → Like (user)
├── One-to-Many → Save (user)
├── One-to-Many → Follow (follower/following)
├── One-to-Many → Group (creator)
├── One-to-Many → Notification (recipient)
├── One-to-Many → Story (author)
├── One-to-Many → AIGeneration (user)
└── One-to-Many → CoinTransaction (user)

Post
├── Many-to-One → User (author)
├── One-to-Many → Comment (post)
├── Many-to-Many → Like (targetId)
├── One-to-Many → Save (post)
├── Many-to-Many → Tag (tags array)
└── One-to-Many → AIGeneration (post)

Comment
├── Many-to-One → Post (post)
├── Many-to-One → User (author)
├── Many-to-Many → Like (targetId)
└── Self-referencing → Comment (parentComment)

Follow
├── Many-to-One → User (follower)
└── Many-to-One → User (following)
```

## 🎯 Key Features

### Polymorphic Relationships
- **Like**: Can reference both Post and Comment using `targetModel` and `targetId`
- **Notification**: Can reference Post, Comment, User, or Group

### Denormalized Counters
For performance optimization, we maintain counters in documents:
- **User**: `stats.postsCount`, `stats.followersCount`, `stats.followingCount`, `stats.likesReceivedCount`
- **Post**: `stats.likes`, `stats.comments`, `stats.shares`, `stats.saves`, `stats.views`
- **Comment**: `likes`, `repliesCount`
- **Group**: `stats.membersCount`, `stats.postsCount`

### Soft Deletes
Major collections support soft deletion via `deletedAt` field:
- User
- Post
- Comment

### Auto-Expiring Documents
- **Story**: Automatically deleted after 24 hours using TTL index
- **Notification**: Read notifications auto-deleted after 30 days

## 📊 Indexes

All models have strategic indexes for query optimization:

### User Indexes
```javascript
- email (unique)
- username (unique)
- googleId (sparse, unique)
- stats.followersCount (for trending users)
- createdAt
- deletedAt
```

### Post Indexes
```javascript
- author + createdAt (compound)
- stats.likes (for trending)
- stats.views (for popular)
- tags (multikey)
- type + status + visibility (compound)
- location.coordinates (geospatial 2dsphere)
```

### Follow Indexes
```javascript
- follower + following (unique compound)
- follower + createdAt
- following + createdAt
```

## 💡 Usage Examples

### Import Models
```javascript
// Import specific model
const User = require('./models/User');
const Post = require('./models/Post');

// Import all models
const { User, Post, Comment, Like } = require('./models');
```

### Create Relationships
```javascript
// Create a post with author reference
const post = await Post.create({
    author: userId,
    type: 'image',
    category: 'image-post',
    caption: 'My AI generated artwork',
    mediaUrl: 'https://...',
    aiGenerated: true
});

// Create a like (polymorphic)
const like = await Like.create({
    user: userId,
    targetModel: 'Post',
    targetId: postId
});

// Create a follow relationship
const follow = await Follow.create({
    follower: currentUserId,
    following: targetUserId
});
```

### Query with Population
```javascript
// Get post with author details
const post = await Post.findById(postId)
    .populate('author', 'username avatar verified');

// Get user's feed with populated data
const posts = await Post.find({ status: 'published' })
    .populate('author', 'username avatar verified stats')
    .sort({ createdAt: -1 })
    .limit(20);

// Get comments with nested replies
const comments = await Comment.find({ post: postId, parentComment: null })
    .populate('author', 'username avatar')
    .populate({
        path: 'parentComment',
        populate: { path: 'author', select: 'username avatar' }
    });
```

### Update Denormalized Counters
```javascript
// When creating a post
await User.findByIdAndUpdate(userId, { $inc: { 'stats.postsCount': 1 } });

// When liking a post
await Post.findByIdAndUpdate(postId, { $inc: { 'stats.likes': 1 } });
await User.findByIdAndUpdate(postAuthorId, { $inc: { 'stats.likesReceivedCount': 1 } });

// When following a user
await User.findByIdAndUpdate(followerId, { $inc: { 'stats.followingCount': 1 } });
await User.findByIdAndUpdate(followingId, { $inc: { 'stats.followersCount': 1 } });
```

## 🔒 Data Integrity

### Middleware Examples

Update counters automatically:
```javascript
// In Like.js - auto-update post/comment likes
likeSchema.post('save', async function() {
    if (this.targetModel === 'Post') {
        await Post.findByIdAndUpdate(this.targetId, { $inc: { 'stats.likes': 1 } });
    } else if (this.targetModel === 'Comment') {
        await Comment.findByIdAndUpdate(this.targetId, { $inc: { likes: 1 } });
    }
});
```

### Validation

Pre-save validation in Follow model:
```javascript
followSchema.pre('save', function(next) {
    if (this.follower.equals(this.following)) {
        next(new Error('Users cannot follow themselves'));
    } else {
        next();
    }
});
```

## 🚀 Performance Tips

1. **Use Indexes**: All frequently queried fields are indexed
2. **Populate Selectively**: Only populate fields you need
3. **Use Lean Queries**: Use `.lean()` for read-only data to improve performance
4. **Pagination**: Always paginate large result sets
5. **Projection**: Select only required fields using `.select()`

## 📝 Model Statistics

- **Total Models**: 12
- **With Soft Delete**: 3 (User, Post, Comment)
- **Polymorphic Relations**: 2 (Like, Notification)
- **Auto-Expiring**: 2 (Story, Notification)
- **Self-Referencing**: 1 (Comment)

## 🔄 Migration Notes

When updating the User schema from the old structure:
- Moved profile fields to root level
- Added `stats` object for denormalized counters
- Added `credits` and `aiCredits` for AI platform features
- Removed embedded `followers` and `following` arrays (now in Follow collection)
- Added `preferences` object for user settings

## 📚 Additional Resources

- See `DATABASE_DESIGN.md` for complete database design documentation
- See API integration examples in the design document
- Refer to MongoDB documentation for index optimization strategies
