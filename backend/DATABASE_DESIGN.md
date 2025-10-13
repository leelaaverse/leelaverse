# LeelaVerse MongoDB Database Design Plan

## 📋 Overview

This document outlines the complete MongoDB database schema design for the LeelaVerse AI Social Media Platform. The design is based on a comprehensive analysis of the frontend codebase and supports all core features including user authentication, posts, comments, likes, saves, follows, AI generation tracking, groups, and notifications.

---

## ✨ Core Features Supported

### 👤 User Management
- ✅ **User Registration & Authentication** (Email/Password + Google OAuth)
- ✅ **Profile Settings** (Update: avatar, bio, cover image, website, location, phone, DOB)
- ✅ **Account Preferences** (Dark mode, notifications, language)
- ✅ **User Statistics** (Posts count, followers, following, total likes received)
- ✅ **Virtual Currency System** (Coins for platform economy)
- ✅ **AI Credits/Tokens** (Track remaining API credits with reset periods)

### 📱 Content Management
- ✅ **Post Categories**:
  - `short` - Vertical short-form videos (< 60 seconds, TikTok/Reels style)
  - `normal-video` - Regular horizontal video content
  - `image-post` - Posts with image only
  - `text-post` - Text-only posts
  - `image-text-post` - Posts with both image and text
- ✅ **AI-Generated Content** (Track model, prompt, generation details)
- ✅ **Post Visibility** (Public, Followers-only, Private)
- ✅ **Post Status** (Draft, Published, Archived)

### 💝 User Interactions
- ✅ **Like System** (Like posts and comments)
- ✅ **Save/Bookmark Posts** (Organize into custom collections)
- ✅ **Comments & Nested Replies** (Up to 3 levels of nesting)
- ✅ **Share Posts** (Track share count)
- ✅ **Follow/Unfollow Users** (Build social network)

### 📊 User Data Access
- ✅ **View Saved Items** (Filter by collection)
- ✅ **View Liked Posts** (Paginated list of all liked content)
- ✅ **View Followers List** (Who follows you)
- ✅ **View Following List** (Who you follow)
- ✅ **View Own Posts** (Filter by category)
- ✅ **Credits Balance** (View remaining AI tokens/credits)

### 🔔 Additional Features
- ✅ **Real-time Notifications** (Likes, comments, follows, mentions)
- ✅ **Stories** (24-hour temporary content)
- ✅ **Groups/Communities** (AI creator communities)
- ✅ **Trending Tags** (Hashtag system)
- ✅ **AI Generation History** (Track all AI content created)
- ✅ **Transaction History** (Coin and credit transactions)

---

## 🏗️ Architecture Overview

### Database Type
- **MongoDB** (NoSQL Document Database)
- **ODM**: Mongoose for schema validation and relationships
- **Connection**: MongoDB Atlas (cloud) or local MongoDB instance

### Design Philosophy
- **Hybrid Approach**: Mix of embedded documents and references
- **Denormalization**: For frequently accessed data (performance)
- **Indexing**: Strategic indexes for query optimization
- **Scalability**: Designed for horizontal scaling

---

## 📊 Collections Overview

1. **Users** - User profiles and authentication
2. **Posts** - User-generated and AI-generated content
3. **Comments** - Post comments and replies
4. **Likes** - Like tracking for posts and comments
5. **Saves** - Saved posts/bookmarks
6. **Follows** - User follow relationships
7. **Groups** - Community groups
8. **Notifications** - User notifications
9. **Stories** - Temporary stories (24-hour content)
10. **Tags** - Hashtags and trending topics
11. **AIGenerations** - AI model usage tracking
12. **Coins** - Virtual currency transactions

---

## 🗄️ Collection Schemas

### 1. Users Collection

**Purpose**: Store user authentication data, profile information, and activity metrics.

**Relationships**:
- One-to-Many with Posts
- Many-to-Many with Users (follows/followers)
- One-to-Many with Comments, Likes, Saves

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not OAuth
    },
    select: false // Don't include in queries by default
  },

  // OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  // Profile Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  coverImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  website: {
    type: String,
    maxlength: 200
  },
  location: {
    type: String,
    maxlength: 100
  },
  dateOfBirth: {
    type: Date
  },
  phoneNumber: {
    type: String,
    sparse: true
  },

  // Status and Verification
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Statistics (Denormalized for performance)
  stats: {
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    likesReceivedCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 }
  },

  // Virtual Currency
  coins: {
    type: Number,
    default: 250, // Starting coins for new users
    min: 0,
    index: true
  },

  // AI Credits/Tokens (Separate from coins for API usage tracking)
  credits: {
    total: { type: Number, default: 1000 }, // Total credits available
    used: { type: Number, default: 0 }, // Credits used
    remaining: {
      type: Number,
      default: 1000,
      index: true
    }, // Credits remaining
    lastReset: { type: Date, default: Date.now },
    resetPeriod: { type: String, enum: ['daily', 'weekly', 'monthly', 'never'], default: 'monthly' }
  },

  // AI Usage Breakdown (for detailed tracking)
  aiCredits: {
    imageGeneration: { type: Number, default: 10 },
    videoGeneration: { type: Number, default: 5 },
    textEnhancement: { type: Number, default: 20 }
  },  // Preferences
  preferences: {
    darkMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },

  // Security
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Tokens
  refreshToken: {
    type: String,
    select: false
  },

  // Activity Tracking
  lastLogin: Date,
  lastActive: Date,

  // Soft Delete
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.followersCount': -1 }); // For trending users
userSchema.index({ createdAt: -1 });
userSchema.index({ deletedAt: 1 }); // For soft delete queries

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for follower-following ratio
userSchema.virtual('engagementRatio').get(function() {
  if (this.stats.followingCount === 0) return 0;
  return (this.stats.followersCount / this.stats.followingCount).toFixed(2);
});

module.exports = mongoose.model('User', userSchema);
```

---

### 2. Posts Collection

**Purpose**: Store all types of content (images, videos, text, AI-generated, user-uploaded).

**Relationships**:
- Many-to-One with Users (author)
- One-to-Many with Comments
- One-to-Many with Likes
- Many-to-Many with Tags

```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Content Type
  type: {
    type: String,
    enum: ['image', 'video', 'text', 'short'], // short = short-form video (TikTok/Reels style)
    required: true,
    index: true
  },

  // Post Category (More specific categorization)
  category: {
    type: String,
    enum: ['short', 'normal-video', 'image-post', 'text-post', 'image-text-post'],
    required: true,
    index: true,
    /*
      - short: Vertical short-form video (< 60 seconds)
      - normal-video: Regular horizontal video content
      - image-post: Post with image only (no text)
      - text-post: Text-only post (no image/video)
      - image-text-post: Post with both image and text
    */
  },

  // Text Content
  caption: {
    type: String,
    maxlength: 2500
  },
  title: {
    type: String,
    maxlength: 200
  },

  // Media
  mediaUrl: {
    type: String // URL to image/video on storage
  },
  thumbnailUrl: {
    type: String // Thumbnail for videos
  },
  mediaType: {
    type: String,
    enum: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', null]
  },

  // AI Generation Details
  aiGenerated: {
    type: Boolean,
    default: false,
    index: true
  },
  aiDetails: {
    model: {
      type: String,
      enum: ['DALL-E 3', 'Midjourney v6', 'Stable Diffusion XL', 'Runway Gen-2', 'Pika Labs', 'Firefly', 'Leonardo AI', null]
    },
    prompt: String,
    enhancedPrompt: String,
    style: String,
    aspectRatio: String,
    steps: Number,
    generationTime: Number, // in seconds
    cost: Number, // coin cost
    seed: String // For reproducibility
  },

  // Engagement Stats (Denormalized)
  stats: {
    likes: { type: Number, default: 0, index: true },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },

  // Tags
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // Location
  location: {
    name: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },

  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
    index: true
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },

  // Featured
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  // Neural Score (AI quality rating)
  neuralScore: {
    type: Number,
    min: 0,
    max: 10,
    index: true
  },

  // Moderation
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,

  // Soft Delete
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'stats.likes': -1 }); // For trending posts
postSchema.index({ 'stats.views': -1 }); // For popular posts
postSchema.index({ tags: 1 });
postSchema.index({ aiGenerated: 1, createdAt: -1 });
postSchema.index({ type: 1, status: 1, visibility: 1 });
postSchema.index({ isFeatured: 1, createdAt: -1 });
postSchema.index({ neuralScore: -1 }); // For high-quality AI content

// Compound index for feed queries
postSchema.index({
  status: 1,
  visibility: 1,
  deletedAt: 1,
  createdAt: -1
});

// Geospatial index for location-based queries
postSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function() {
  if (this.stats.views === 0) return 0;
  const totalEngagement = this.stats.likes + this.stats.comments + this.stats.shares;
  return ((totalEngagement / this.stats.views) * 100).toFixed(2);
});

// Virtual populate for author details
postSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Post', postSchema);
```

---

### 3. Comments Collection

**Purpose**: Store comments on posts with support for nested replies.

**Relationships**:
- Many-to-One with Posts
- Many-to-One with Users (author)
- Self-referencing for replies (parent-child)

```javascript
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Post Reference
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },

  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Comment Content
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Reply Structure
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  replyLevel: {
    type: Number,
    default: 0,
    max: 3 // Limit nesting to 3 levels
  },

  // Engagement
  likes: {
    type: Number,
    default: 0
  },
  repliesCount: {
    type: Number,
    default: 0
  },

  // Moderation
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  flagged: {
    type: Boolean,
    default: false
  },

  // Soft Delete
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ post: 1, parentComment: 1 });

module.exports = mongoose.model('Comment', commentSchema);
```

---

### 4. Likes Collection

**Purpose**: Track likes on posts and comments.

**Relationships**:
- Many-to-One with Users
- Many-to-One with Posts or Comments (polymorphic)

```javascript
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  // User who liked
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Polymorphic reference (can be Post or Comment)
  targetModel: {
    type: String,
    required: true,
    enum: ['Post', 'Comment'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    refPath: 'targetModel'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate likes
likeSchema.index({ user: 1, targetModel: 1, targetId: 1 }, { unique: true });

// Index for counting likes on a specific target
likeSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('Like', likeSchema);
```

---

### 5. Saves Collection

**Purpose**: Track saved/bookmarked posts by users.

**Relationships**:
- Many-to-One with Users
- Many-to-One with Posts

```javascript
const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
  // User who saved
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Saved Post
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },

  // Collections/Folders
  collection: {
    type: String,
    default: 'Saved Items',
    index: true
  },

  // Notes (optional)
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent duplicate saves
saveSchema.index({ user: 1, post: 1 }, { unique: true });

// Index for user's saved collections
saveSchema.index({ user: 1, collection: 1, createdAt: -1 });

module.exports = mongoose.model('Save', saveSchema);
```

---

### 6. Follows Collection

**Purpose**: Manage follow relationships between users.

**Relationships**:
- Many-to-One with Users (follower)
- Many-to-One with Users (following)

```javascript
const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // Who is following
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Who is being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification preference for this follow
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent self-follow and duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for queries
followSchema.index({ follower: 1, createdAt: -1 }); // User's following list
followSchema.index({ following: 1, createdAt: -1 }); // User's followers list

// Prevent users from following themselves
followSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Follow', followSchema);
```

---

### 7. Groups Collection

**Purpose**: Manage community groups for AI creators and enthusiasts.

**Relationships**:
- Many-to-One with Users (creator)
- Many-to-Many with Users (members)
- One-to-Many with Posts (group posts)

```javascript
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 1000
  },

  // Media
  avatar: String,
  coverImage: String,

  // Creator
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Stats
  stats: {
    membersCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 }
  },

  // Settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public',
    index: true
  },
  joinApprovalRequired: {
    type: Boolean,
    default: false
  },

  // Category
  category: {
    type: String,
    enum: ['AI Art', 'Video Generation', 'Photography', 'Discussion', 'Tech', 'General'],
    index: true
  },

  // Tags
  tags: [{
    type: String,
    lowercase: true
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ 'stats.membersCount': -1 });
groupSchema.index({ category: 1, visibility: 1 });

module.exports = mongoose.model('Group', groupSchema);
```

---

### 8. Notifications Collection

**Purpose**: Store user notifications for various events.

**Relationships**:
- Many-to-One with Users (recipient)
- Polymorphic reference to trigger source

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Sender/Actor
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Notification Type
  type: {
    type: String,
    required: true,
    enum: [
      'like',
      'comment',
      'reply',
      'follow',
      'mention',
      'share',
      'post',
      'group_invite',
      'achievement',
      'coin_earned',
      'ai_generation_complete'
    ],
    index: true
  },

  // Reference to related entity
  relatedModel: {
    type: String,
    enum: ['Post', 'Comment', 'User', 'Group', null]
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },

  // Content
  message: {
    type: String,
    required: true
  },

  // Status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,

  // Action URL
  actionUrl: String
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// TTL index - delete read notifications after 30 days
notificationSchema.index({ readAt: 1 }, {
  expireAfterSeconds: 2592000, // 30 days
  partialFilterExpression: { read: true }
});

module.exports = mongoose.model('Notification', notificationSchema);
```

---

### 9. Stories Collection

**Purpose**: Temporary 24-hour content (Instagram/Snapchat style).

**Relationships**:
- Many-to-One with Users (author)

```javascript
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Content
  type: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: true
  },
  mediaUrl: String,
  thumbnailUrl: String,
  text: String,
  backgroundColor: String,

  // AI Details
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiActivity: {
    type: String,
    enum: ['Training Model', 'Live Streaming', 'Generating Art', 'Experimenting', null]
  },

  // Engagement
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewsCount: {
    type: Number,
    default: 0
  },

  // Duration (in seconds)
  duration: {
    type: Number,
    default: 5
  },

  // Visibility
  visibility: {
    type: String,
    enum: ['all', 'followers', 'close-friends'],
    default: 'all'
  }
}, {
  timestamps: true
});

// Indexes
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24 hours

module.exports = mongoose.model('Story', storySchema);
```

---

### 10. Tags Collection

**Purpose**: Track hashtags and trending topics.

**Relationships**:
- Referenced by Posts (many-to-many)

```javascript
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  // Tag Name
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  // Usage Stats
  usageCount: {
    type: Number,
    default: 0,
    index: true
  },

  // Trending Score (calculated based on recent usage)
  trendingScore: {
    type: Number,
    default: 0,
    index: true
  },

  // Category
  category: {
    type: String,
    enum: ['ai-art', 'photography', 'video', 'discussion', 'tech', 'general'],
    index: true
  },

  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Last Used
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
tagSchema.index({ trendingScore: -1, usageCount: -1 });
tagSchema.index({ name: 'text' });

module.exports = mongoose.model('Tag', tagSchema);
```

---

### 11. AIGenerations Collection

**Purpose**: Track AI model usage, costs, and generation history.

**Relationships**:
- Many-to-One with Users
- Many-to-One with Posts (optional)

```javascript
const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema({
  // User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Generation Type
  type: {
    type: String,
    enum: ['image', 'video', 'text-enhancement'],
    required: true,
    index: true
  },

  // AI Model
  model: {
    type: String,
    required: true,
    enum: ['DALL-E 3', 'Midjourney v6', 'Stable Diffusion XL', 'Runway Gen-2', 'Pika Labs', 'Firefly', 'Leonardo AI']
  },

  // Input
  prompt: {
    type: String,
    required: true
  },
  enhancedPrompt: String,

  // Parameters
  parameters: {
    style: String,
    aspectRatio: String,
    steps: Number,
    seed: String,
    quality: String
  },

  // Output
  resultUrl: String,
  thumbnailUrl: String,

  // Related Post
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  // Performance Metrics
  generationTime: Number, // seconds
  cost: Number, // coins spent

  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  errorMessage: String,

  // Quality Rating (user feedback)
  userRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
aiGenerationSchema.index({ user: 1, createdAt: -1 });
aiGenerationSchema.index({ type: 1, model: 1 });
aiGenerationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
```

---

### 12. Coins Collection (Transactions)

**Purpose**: Track virtual currency transactions for transparency and auditing.

**Relationships**:
- Many-to-One with Users

```javascript
const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  // User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Transaction Type
  type: {
    type: String,
    required: true,
    enum: [
      'earn',
      'spend',
      'purchase',
      'gift',
      'reward',
      'refund',
      'daily_bonus',
      'achievement'
    ],
    index: true
  },

  // Amount (positive or negative)
  amount: {
    type: Number,
    required: true
  },

  // Balance After Transaction
  balanceAfter: {
    type: Number,
    required: true
  },

  // Description
  description: {
    type: String,
    required: true
  },

  // Related Entity
  relatedModel: {
    type: String,
    enum: ['Post', 'AIGeneration', 'User', null]
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },

  // Metadata
  metadata: {
    aiModel: String,
    generationType: String,
    achievementName: String
  }
}, {
  timestamps: true
});

// Indexes
coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
```

---

## 🔗 Relationship Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│    Posts    │  │   Follows   │
└──────┬──────┘  └─────────────┘
       │
       ├────────┬────────┬────────┐
       │        │        │        │
       ▼        ▼        ▼        ▼
┌──────────┐ ┌─────┐ ┌──────┐ ┌────────┐
│ Comments │ │Likes│ │Saves │ │  Tags  │
└──────────┘ └─────┘ └──────┘ └────────┘

┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Groups    │  │ AIGenerations   │  │ Notifications   │
└─────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────┐  ┌─────────────────┐
│   Stories   │  │ CoinTransactions│
└─────────────┘  └─────────────────┘
```

---

## 📊 Key Design Decisions

### 1. **Denormalization Strategy**

**Where**: User stats, post stats
**Why**: Faster read operations, reduce joins
**Trade-off**: Need to keep counters in sync

```javascript
// Example: Update post likes count
async function likePost(userId, postId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create like
    await Like.create([{ user: userId, targetModel: 'Post', targetId: postId }], { session });

    // Increment post likes counter
    await Post.findByIdAndUpdate(postId, { $inc: { 'stats.likes': 1 } }, { session });

    // Increment user's likes received counter
    const post = await Post.findById(postId).session(session);
    await User.findByIdAndUpdate(post.author, { $inc: { 'stats.likesReceivedCount': 1 } }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 2. **Polymorphic Relationships**

Used in Likes and Notifications to reference multiple model types.

```javascript
// Like can belong to Post or Comment
{
  targetModel: 'Post',
  targetId: ObjectId('...')
}
```

### 3. **Soft Deletes**

All major collections support soft deletion via `deletedAt` field.

```javascript
// Query to exclude soft-deleted items
Post.find({ deletedAt: null });
```

### 4. **Virtual Fields**

Computed properties that don't take up database space.

```javascript
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

---

## 🚀 Performance Optimization

### Indexing Strategy

**Compound Indexes**:
```javascript
// Feed query optimization
postSchema.index({
  status: 1,
  visibility: 1,
  deletedAt: 1,
  createdAt: -1
});
```

**Sparse Indexes**:
```javascript
// Only index documents that have googleId
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
```

**Text Indexes** (for search):
```javascript
postSchema.index({ caption: 'text', title: 'text' });
groupSchema.index({ name: 'text', description: 'text' });
```

**TTL Indexes** (auto-deletion):
```javascript
// Auto-delete stories after 24 hours
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
```

### Query Optimization Examples

```javascript
// ❌ Bad: Multiple queries
const user = await User.findById(userId);
const posts = await Post.find({ author: userId });
const followers = await Follow.find({ following: userId });

// ✅ Good: Aggregation pipeline
const userProfile = await User.aggregate([
  { $match: { _id: userId } },
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'author',
      as: 'posts',
      pipeline: [
        { $match: { deletedAt: null, status: 'published' } },
        { $limit: 10 },
        { $sort: { createdAt: -1 } }
      ]
    }
  },
  {
    $lookup: {
      from: 'follows',
      localField: '_id',
      foreignField: 'following',
      as: 'followers'
    }
  }
]);
```

---

## 🔒 Data Integrity & Validation

### Mongoose Middleware for Consistency

```javascript
// Auto-update stats on like
likeSchema.post('save', async function() {
  if (this.targetModel === 'Post') {
    await Post.findByIdAndUpdate(this.targetId, { $inc: { 'stats.likes': 1 } });
  }
});

// Auto-update stats on unlike
likeSchema.post('remove', async function() {
  if (this.targetModel === 'Post') {
    await Post.findByIdAndUpdate(this.targetId, { $inc: { 'stats.likes': -1 } });
  }
});

// Update follower counts
followSchema.post('save', async function() {
  await User.findByIdAndUpdate(this.follower, { $inc: { 'stats.followingCount': 1 } });
  await User.findByIdAndUpdate(this.following, { $inc: { 'stats.followersCount': 1 } });
});

// Generate slug for groups
groupSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});
```

### Transactions for Critical Operations

```javascript
// Example: Transfer coins between users
async function transferCoins(fromUserId, toUserId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Deduct from sender
    const sender = await User.findByIdAndUpdate(
      fromUserId,
      { $inc: { coins: -amount } },
      { session, new: true }
    );

    if (sender.coins < 0) {
      throw new Error('Insufficient coins');
    }

    // Add to receiver
    await User.findByIdAndUpdate(
      toUserId,
      { $inc: { coins: amount } },
      { session }
    );

    // Record transactions
    await CoinTransaction.create([
      {
        user: fromUserId,
        type: 'gift',
        amount: -amount,
        balanceAfter: sender.coins,
        description: `Sent ${amount} coins to user`,
        relatedModel: 'User',
        relatedId: toUserId
      }
    ], { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 📈 Scalability Considerations

### 1. **Sharding Strategy**

For horizontal scaling as the platform grows:

```javascript
// Shard Posts by author (userId)
sh.enableSharding("leelaverse");
sh.shardCollection("leelaverse.posts", { author: 1, createdAt: 1 });

// Shard Likes by user
sh.shardCollection("leelaverse.likes", { user: 1 });

// Shard Notifications by recipient
sh.shardCollection("leelaverse.notifications", { recipient: 1 });
```

### 2. **Read Replicas**

- Use MongoDB replica sets
- Route read-heavy queries to secondary nodes
- Keep writes on primary

### 3. **Caching Layer**

```javascript
// Redis cache for hot data
const redis = require('redis');
const client = redis.createClient();

// Cache user profile
async function getUserProfile(userId) {
  const cacheKey = `user:${userId}`;

  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query database
  const user = await User.findById(userId);

  // Store in cache (1 hour TTL)
  await client.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

### 4. **Archive Old Data**

```javascript
// Archive posts older than 2 years
const archiveThreshold = new Date();
archiveThreshold.setFullYear(archiveThreshold.getFullYear() - 2);

await Post.updateMany(
  { createdAt: { $lt: archiveThreshold }, status: 'published' },
  { $set: { status: 'archived' } }
);
```

---

## 🛠️ Connection Setup

### database.js

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### .env Configuration

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/leelaverse
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leelaverse?retryWrites=true&w=majority

# Node Environment
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Cookie Settings
COOKIE_EXPIRE=7

# File Storage (AWS S3, Cloudinary, etc.)
STORAGE_TYPE=s3
AWS_BUCKET_NAME=leelaverse-media
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# AI Services (if using external APIs)
OPENAI_API_KEY=your-openai-key
REPLICATE_API_KEY=your-replicate-key

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

---

## 📝 API Integration Examples

### 1. User Profile Management

```javascript
// GET /api/users/:userId/profile
async function getUserProfile(userId) {
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .lean();

  if (!user) throw new Error('User not found');

  return {
    user,
    stats: {
      posts: user.stats.postsCount,
      followers: user.stats.followersCount,
      following: user.stats.followingCount,
      likes: user.stats.likesReceivedCount
    },
    credits: {
      coins: user.coins,
      tokensRemaining: user.credits.remaining,
      tokensTotal: user.credits.total
    }
  };
}

// PUT /api/users/profile/settings
async function updateUserSettings(userId, updateData) {
  // Allowed fields for update
  const allowedFields = [
    'firstName', 'lastName', 'username', 'bio',
    'avatar', 'coverImage', 'website', 'location',
    'phoneNumber', 'dateOfBirth'
  ];

  // Filter update data
  const filteredData = {};
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  // Check username uniqueness if being updated
  if (filteredData.username) {
    const existing = await User.findOne({
      username: filteredData.username,
      _id: { $ne: userId }
    });
    if (existing) {
      throw new Error('Username already taken');
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  return user;
}

// PUT /api/users/preferences
async function updateUserPreferences(userId, preferences) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { preferences } },
    { new: true }
  ).select('preferences');

  return user;
}
```

### 2. User Feed with Category Filter

```javascript
// GET /api/posts/feed?category=short&page=1&limit=20
// GET /api/posts/feed?category=short&page=1&limit=20
async function getUserFeed(userId, options = {}) {
  const { category, page = 1, limit = 20 } = options;

  // Get users that current user follows
  const following = await Follow.find({ follower: userId }).select('following');
  const followingIds = following.map(f => f.following);
  followingIds.push(userId); // Include own posts

  // Build query
  const query = {
    author: { $in: followingIds },
    status: 'published',
    visibility: { $in: ['public', 'followers'] },
    deletedAt: null
  };

  // Add category filter if specified
  if (category) {
    query.category = category;
  }

  const posts = await Post.find(query)
    .populate('author', 'username avatar verified')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return posts;
}

// GET /api/posts/category/:category
async function getPostsByCategory(category, page = 1, limit = 20) {
  const validCategories = ['short', 'normal-video', 'image-post', 'text-post', 'image-text-post'];

  if (!validCategories.includes(category)) {
    throw new Error('Invalid category');
  }

  const posts = await Post.find({
    category,
    status: 'published',
    visibility: 'public',
    deletedAt: null
  })
  .populate('author', 'username avatar verified')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

  const total = await Post.countDocuments({
    category,
    status: 'published',
    visibility: 'public',
    deletedAt: null
  });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### 3. User's Liked Posts

```javascript
// GET /api/users/:userId/liked-posts
async function getUserLikedPosts(userId, page = 1, limit = 20) {
  // Find all likes by the user for posts
  const likes = await Like.find({
    user: userId,
    targetModel: 'Post'
  })
  .select('targetId createdAt')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

  // Get post IDs
  const postIds = likes.map(like => like.targetId);

  // Fetch posts
  const posts = await Post.find({
    _id: { $in: postIds },
    deletedAt: null
  })
  .populate('author', 'username avatar verified')
  .lean();

  // Sort posts by like date
  const likeMap = {};
  likes.forEach(like => {
    likeMap[like.targetId.toString()] = like.createdAt;
  });

  posts.sort((a, b) => {
    return likeMap[b._id.toString()] - likeMap[a._id.toString()];
  });

  const total = await Like.countDocuments({
    user: userId,
    targetModel: 'Post'
  });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### 4. User's Saved Posts

```javascript
// GET /api/users/:userId/saved-posts?collection=All
async function getUserSavedPosts(userId, collection = null, page = 1, limit = 20) {
  const query = { user: userId };

  // Filter by collection if specified
  if (collection && collection !== 'All') {
    query.collection = collection;
  }

  const saves = await Save.find(query)
    .populate({
      path: 'post',
      match: { deletedAt: null },
      populate: {
        path: 'author',
        select: 'username avatar verified'
      }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Filter out null posts (deleted posts)
  const savedPosts = saves
    .filter(save => save.post !== null)
    .map(save => ({
      ...save.post,
      savedAt: save.createdAt,
      saveCollection: save.collection,
      saveNotes: save.notes
    }));

  const total = await Save.countDocuments(query);

  return {
    posts: savedPosts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// GET /api/users/:userId/saved-collections
async function getUserSavedCollections(userId) {
  const collections = await Save.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$collection',
        count: { $sum: 1 },
        lastSaved: { $max: '$createdAt' }
      }
    },
    { $sort: { lastSaved: -1 } }
  ]);

  return collections.map(col => ({
    name: col._id,
    count: col.count,
    lastSaved: col.lastSaved
  }));
}

// POST /api/users/:userId/save-post
async function savePost(userId, postId, collection = 'Saved Items', notes = '') {
  // Check if already saved
  const existing = await Save.findOne({ user: userId, post: postId });

  if (existing) {
    // Update collection or notes
    existing.collection = collection;
    existing.notes = notes;
    await existing.save();
    return existing;
  }

  // Create new save
  const save = await Save.create({
    user: userId,
    post: postId,
    collection,
    notes
  });

  // Increment post saves count
  await Post.findByIdAndUpdate(postId, {
    $inc: { 'stats.saves': 1 }
  });

  return save;
}

// DELETE /api/users/:userId/unsave-post/:postId
async function unsavePost(userId, postId) {
  const save = await Save.findOneAndDelete({
    user: userId,
    post: postId
  });

  if (save) {
    // Decrement post saves count
    await Post.findByIdAndUpdate(postId, {
      $inc: { 'stats.saves': -1 }
    });
  }

  return save;
}
```

### 5. Followers & Following Management

```javascript
// GET /api/users/:userId/followers
async function getUserFollowers(userId, page = 1, limit = 20) {
  const followers = await Follow.find({ following: userId })
    .populate('follower', 'username avatar verified stats')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Follow.countDocuments({ following: userId });

  return {
    followers: followers.map(f => f.follower),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// GET /api/users/:userId/following
async function getUserFollowing(userId, page = 1, limit = 20) {
  const following = await Follow.find({ follower: userId })
    .populate('following', 'username avatar verified stats')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Follow.countDocuments({ follower: userId });

  return {
    following: following.map(f => f.following),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// POST /api/users/:userId/follow
async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  // Check if already following
  const existing = await Follow.findOne({
    follower: followerId,
    following: followingId
  });

  if (existing) {
    return { message: 'Already following', follow: existing };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create follow relationship
    const follow = await Follow.create([{
      follower: followerId,
      following: followingId
    }], { session });

    // Update follower's following count
    await User.findByIdAndUpdate(
      followerId,
      { $inc: { 'stats.followingCount': 1 } },
      { session }
    );

    // Update following's followers count
    await User.findByIdAndUpdate(
      followingId,
      { $inc: { 'stats.followersCount': 1 } },
      { session }
    );

    // Create notification
    await Notification.create([{
      recipient: followingId,
      sender: followerId,
      type: 'follow',
      message: 'started following you'
    }], { session });

    await session.commitTransaction();

    return { message: 'Successfully followed', follow: follow[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// DELETE /api/users/:userId/unfollow
async function unfollowUser(followerId, followingId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId
    }, { session });

    if (!follow) {
      throw new Error('Follow relationship not found');
    }

    // Update follower's following count
    await User.findByIdAndUpdate(
      followerId,
      { $inc: { 'stats.followingCount': -1 } },
      { session }
    );

    // Update following's followers count
    await User.findByIdAndUpdate(
      followingId,
      { $inc: { 'stats.followersCount': -1 } },
      { session }
    );

    await session.commitTransaction();

    return { message: 'Successfully unfollowed' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 6. User Posts by Category

```javascript
// GET /api/users/:userId/posts?category=short
async function getUserPosts(userId, options = {}) {
  const { category, page = 1, limit = 20 } = options;

  const query = {
    author: userId,
    status: 'published',
    deletedAt: null
  };

  if (category) {
    query.category = category;
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Post.countDocuments(query);

  // Get category breakdown
  const categoryStats = await Post.aggregate([
    { $match: { author: mongoose.Types.ObjectId(userId), deletedAt: null } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    categoryBreakdown: categoryStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
}
```

### 7. Credits/Token Management

```javascript
// GET /api/users/:userId/credits
async function getUserCredits(userId) {
  const user = await User.findById(userId)
    .select('coins credits aiCredits')
    .lean();

  return {
    coins: user.coins,
    credits: {
      total: user.credits.total,
      used: user.credits.used,
      remaining: user.credits.remaining,
      lastReset: user.credits.lastReset,
      resetPeriod: user.credits.resetPeriod
    },
    aiCredits: user.aiCredits
  };
}

// POST /api/users/:userId/credits/deduct
async function deductCredits(userId, amount, reason) {
  const user = await User.findById(userId);

  if (user.credits.remaining < amount) {
    throw new Error('Insufficient credits');
  }

  user.credits.used += amount;
  user.credits.remaining -= amount;
  await user.save();

  // Record transaction
  await CoinTransaction.create({
    user: userId,
    type: 'spend',
    amount: -amount,
    balanceAfter: user.credits.remaining,
    description: reason,
    metadata: { creditType: 'ai_token' }
  });

  return user.credits;
}

// POST /api/users/:userId/credits/reset
async function resetUserCredits(userId) {
  const user = await User.findById(userId);

  user.credits.used = 0;
  user.credits.remaining = user.credits.total;
  user.credits.lastReset = new Date();
  await user.save();

  return user.credits;
}
```

### 8. User Statistics Dashboard

```javascript
// GET /api/users/:userId/dashboard
async function getUserDashboard(userId) {
  const user = await User.findById(userId).lean();

  // Get post stats by category
  const postStats = await Post.aggregate([
    { $match: { author: mongoose.Types.ObjectId(userId), deletedAt: null } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalLikes: { $sum: '$stats.likes' },
        totalViews: { $sum: '$stats.views' },
        totalComments: { $sum: '$stats.comments' }
      }
    }
  ]);

  // Get recent activity
  const recentPosts = await Post.find({
    author: userId,
    deletedAt: null
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select('title category stats createdAt')
  .lean();

  // Get follower growth (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newFollowers = await Follow.countDocuments({
    following: userId,
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Get AI generation stats
  const aiStats = await AIGeneration.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);

  return {
    user: {
      username: user.username,
      avatar: user.avatar,
      verified: user.verified
    },
    stats: {
      totalPosts: user.stats.postsCount,
      followers: user.stats.followersCount,
      following: user.stats.followingCount,
      totalLikesReceived: user.stats.likesReceivedCount,
      totalViews: user.stats.totalViews
    },
    credits: {
      coins: user.coins,
      tokensTotal: user.credits.total,
      tokensUsed: user.credits.used,
      tokensRemaining: user.credits.remaining,
      resetPeriod: user.credits.resetPeriod,
      lastReset: user.credits.lastReset
    },
    postsByCategory: postStats,
    recentActivity: recentPosts,
    growth: {
      newFollowersLast30Days: newFollowers
    },
    aiUsage: aiStats
  };
}
```

### 9. Complete User Profile with All Data

```javascript
// GET /api/users/:userId/complete-profile
async function getCompleteUserProfile(userId, requestingUserId) {
  // Get user basic info
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .lean();

  if (!user) throw new Error('User not found');

  // Check if requesting user follows this user
  const isFollowing = requestingUserId
    ? await Follow.exists({ follower: requestingUserId, following: userId })
    : false;

  // Get saved posts count
  const savedPostsCount = await Save.countDocuments({ user: userId });

  // Get liked posts count
  const likedPostsCount = await Like.countDocuments({
    user: userId,
    targetModel: 'Post'
  });

  // Get posts by category
  const postsByCategory = await Post.aggregate([
    { $match: { author: mongoose.Types.ObjectId(userId), deletedAt: null } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Get recent posts (5 most recent)
  const recentPosts = await Post.find({
    author: userId,
    status: 'published',
    deletedAt: null,
    visibility: 'public'
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select('title category mediaUrl thumbnailUrl stats createdAt')
  .lean();

  return {
    profile: {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio,
      website: user.website,
      location: user.location,
      verified: user.verified,
      createdAt: user.createdAt
    },
    stats: {
      posts: user.stats.postsCount,
      followers: user.stats.followersCount,
      following: user.stats.followingCount,
      likesReceived: user.stats.likesReceivedCount,
      totalViews: user.stats.totalViews,
      savedPosts: savedPostsCount,
      likedPosts: likedPostsCount
    },
    credits: requestingUserId === userId ? {
      coins: user.coins,
      tokensRemaining: user.credits.remaining,
      tokensTotal: user.credits.total
    } : null, // Only show credits to profile owner
    postBreakdown: postsByCategory.reduce((acc, cat) => {
      acc[cat._id] = cat.count;
      return acc;
    }, {}),
    recentPosts,
    isFollowing: !!isFollowing,
    isOwnProfile: requestingUserId === userId
  };
}
```

---

## 🎯 User Journey Examples

### Journey 1: New User Registration & First Post

```javascript
// Step 1: User signs up
const newUser = await User.create({
  email: 'john@example.com',
  password: hashedPassword,
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  coins: 250, // Starting bonus
  credits: {
    total: 1000,
    remaining: 1000
  }
});

// Step 2: User updates profile settings
await User.findByIdAndUpdate(newUser._id, {
  avatar: 'https://cdn.example.com/avatars/john.jpg',
  bio: 'AI Art Enthusiast | Digital Creator',
  website: 'https://johndoe.art'
});

// Step 3: User creates first AI-generated post
const post = await Post.create({
  author: newUser._id,
  type: 'image',
  category: 'image-post',
  caption: 'My first AI-generated artwork!',
  mediaUrl: 'https://cdn.example.com/posts/first-art.jpg',
  aiGenerated: true,
  aiDetails: {
    model: 'DALL-E 3',
    prompt: 'Futuristic cityscape at sunset',
    cost: 10
  },
  tags: ['aiart', 'digital', 'futuristic']
});

// Step 4: Deduct credits for AI generation
await deductCredits(newUser._id, 10, 'AI Image Generation - DALL-E 3');

// Step 5: Update user's post count
await User.findByIdAndUpdate(newUser._id, {
  $inc: { 'stats.postsCount': 1 }
});
```

### Journey 2: User Discovers & Engages with Content

```javascript
// Step 1: User views feed
const feed = await getUserFeed(userId, { category: 'short', page: 1, limit: 20 });

// Step 2: User likes a post
const postToLike = feed[0];
await Like.create({
  user: userId,
  targetModel: 'Post',
  targetId: postToLike._id
});
await Post.findByIdAndUpdate(postToLike._id, {
  $inc: { 'stats.likes': 1 }
});

// Step 3: User saves the post
await savePost(userId, postToLike._id, 'Inspiration', 'Love this style!');

// Step 4: User comments on the post
const comment = await Comment.create({
  post: postToLike._id,
  author: userId,
  text: 'Amazing work! How did you achieve this effect?'
});
await Post.findByIdAndUpdate(postToLike._id, {
  $inc: { 'stats.comments': 1 }
});

// Step 5: User follows the post author
await followUser(userId, postToLike.author);
```

### Journey 3: User Manages Their Profile

```javascript
// Step 1: User views their complete dashboard
const dashboard = await getUserDashboard(userId);
console.log(`Total Posts: ${dashboard.stats.totalPosts}`);
console.log(`Credits Remaining: ${dashboard.credits.tokensRemaining}`);

// Step 2: User views their liked posts
const likedPosts = await getUserLikedPosts(userId, 1, 20);

// Step 3: User views their saved posts in specific collection
const savedPosts = await getUserSavedPosts(userId, 'Inspiration', 1, 20);

// Step 4: User updates profile settings
await updateUserSettings(userId, {
  bio: 'AI Artist & Tech Enthusiast | Creating the future',
  website: 'https://newsite.com',
  location: 'San Francisco, CA'
});

// Step 5: User views their followers
const followers = await getUserFollowers(userId, 1, 20);
console.log(`Total Followers: ${followers.pagination.total}`);

// Step 6: User checks credits balance
const credits = await getUserCredits(userId);
if (credits.credits.remaining < 100) {
  console.log('Low credits! Time to upgrade or wait for reset.');
}
```

---

## 📊 Database Relationship Summary

### User-Centric Relationships

```
USER
├── Has Many POSTS (author)
│   ├── Posts by Category
│   │   ├── shorts
│   │   ├── normal-video
│   │   ├── image-post
│   │   ├── text-post
│   │   └── image-text-post
│   └── Post Statistics
│       ├── likes
│       ├── comments
│       ├── shares
│       ├── saves
│       └── views
│
├── Has Many LIKES (user → posts/comments)
│   └── Tracks Liked Content
│
├── Has Many SAVES (user → posts)
│   ├── Organized by Collections
│   └── With Optional Notes
│
├── Has Many FOLLOWS (as follower)
│   └── Following Other Users
│
├── Has Many FOLLOWERS (as following)
│   └── Users Following Them
│
├── Has Many COMMENTS (author)
│   └── On Posts
│
├── Has Many NOTIFICATIONS (recipient)
│   ├── Like notifications
│   ├── Comment notifications
│   ├── Follow notifications
│   └── Achievement notifications
│
├── Has CREDITS
│   ├── Coins (virtual currency)
│   └── Tokens (AI API credits)
│       ├── Total
│       ├── Used
│       └── Remaining
│
└── Has STATISTICS
    ├── Total Posts
    ├── Followers Count
    ├── Following Count
    ├── Likes Received
    └── Total Views
```

### Post-Centric Relationships

```
POST
├── Belongs To USER (author)
├── Has Category
│   ├── short (vertical video < 60s)
│   ├── normal-video (horizontal video)
│   ├── image-post (image only)
│   ├── text-post (text only)
│   └── image-text-post (image + text)
│
├── Has Many LIKES
├── Has Many COMMENTS
│   └── Nested Replies (up to 3 levels)
├── Has Many SAVES
├── Has Many TAGS
│
├── Has AI Details (if AI-generated)
│   ├── Model Used
│   ├── Prompt
│   ├── Generation Cost
│   └── Parameters
│
└── Has Statistics
    ├── Likes Count
    ├── Comments Count
    ├── Shares Count
    ├── Saves Count
    └── Views Count
```

---
  // Get users that current user follows
  const following = await Follow.find({ follower: userId }).select('following');
  const followingIds = following.map(f => f.following);
  followingIds.push(userId); // Include own posts

  const posts = await Post.find({
    author: { $in: followingIds },
    status: 'published',
    visibility: { $in: ['public', 'followers'] },
    deletedAt: null
  })
  .populate('author', 'username avatar verified')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

  return posts;
}
```

### Trending Posts

```javascript
// GET /api/posts/trending
async function getTrendingPosts(timeframe = 'week') {
  const dateThreshold = new Date();
  if (timeframe === 'day') dateThreshold.setDate(dateThreshold.getDate() - 1);
  else if (timeframe === 'week') dateThreshold.setDate(dateThreshold.getDate() - 7);
  else dateThreshold.setMonth(dateThreshold.getMonth() - 1);

  const posts = await Post.aggregate([
    {
      $match: {
        createdAt: { $gte: dateThreshold },
        status: 'published',
        visibility: 'public',
        deletedAt: null
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$stats.likes', 2] },
            { $multiply: ['$stats.comments', 3] },
            { $multiply: ['$stats.shares', 5] },
            { $divide: ['$stats.views', 10] }
          ]
        }
      }
    },
    { $sort: { trendingScore: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorDetails'
      }
    },
    { $unwind: '$authorDetails' }
  ]);

  return posts;
}
```

### User Notifications

```javascript
// GET /api/notifications
async function getUserNotifications(userId, unreadOnly = false) {
  const query = { recipient: userId };
  if (unreadOnly) query.read = false;

  const notifications = await Notification.find(query)
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return notifications;
}

// Mark notification as read
async function markAsRead(notificationId) {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true, readAt: new Date() },
    { new: true }
  );
}
```

---

## 🎯 Future Enhancements

### 1. **Analytics Collection**

Track user behavior for recommendations:

```javascript
const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  eventType: { type: String, enum: ['view', 'click', 'share', 'search'], index: true },
  targetModel: String,
  targetId: mongoose.Schema.Types.ObjectId,
  metadata: mongoose.Schema.Types.Mixed,
  sessionId: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true, timeseries: { timeField: 'timestamp', metaField: 'user' } });
```

### 2. **Chat/Messaging**

Direct messages between users:

```javascript
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  mediaUrl: String,
  read: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
```

### 3. **Content Moderation**

AI-powered content flagging:

```javascript
const moderationSchema = new mongoose.Schema({
  targetModel: String,
  targetId: mongoose.Schema.Types.ObjectId,
  flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiScore: Number
});
```

### 4. **Achievements/Badges**

Gamification system:

```javascript
const achievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  category: String,
  criteria: mongoose.Schema.Types.Mixed,
  coinReward: Number,
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] }
});

const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
  earnedAt: { type: Date, default: Date.now },
  progress: Number
});
```

---

## 🎓 Best Practices Summary

1. ✅ **Use transactions** for multi-document operations
2. ✅ **Index frequently queried fields**
3. ✅ **Denormalize for read-heavy operations**
4. ✅ **Use virtuals for computed fields**
5. ✅ **Implement soft deletes** for data recovery
6. ✅ **Validate input** with Mongoose schemas
7. ✅ **Use lean()** for read-only queries (better performance)
8. ✅ **Paginate results** to prevent memory issues
9. ✅ **Use aggregation** for complex queries
10. ✅ **Cache hot data** with Redis

---

## 🚦 Getting Started

### 1. Install Dependencies

```bash
npm install mongoose dotenv
```

### 2. Create Models Directory

```bash
mkdir -p src/models
```

### 3. Initialize Connection

```javascript
// app.js
const connectDB = require('./src/config/database');
connectDB();
```

### 4. Create First Model

```javascript
// src/models/User.js
// (Use schema from above)
```

### 5. Test Connection

```bash
node test-mongodb.js
```

---

## 📚 Quick Reference Guide

### Post Categories Explained

| Category | Description | Example Use Case | Media Type |
|----------|-------------|------------------|------------|
| `short` | Vertical short-form video (< 60 seconds) | TikTok/Reels style content | Video (9:16 ratio) |
| `normal-video` | Regular horizontal video content | YouTube-style videos, tutorials | Video (16:9 ratio) |
| `image-post` | Post with image only (no caption) | Photo galleries, artwork showcase | Image |
| `text-post` | Text-only post (no media) | Thoughts, discussions, announcements | None |
| `image-text-post` | Post with both image and caption | Instagram-style posts | Image + Text |

### User Statistics Fields

```javascript
{
  postsCount: 42,              // Total posts created
  followersCount: 2500,        // People following this user
  followingCount: 180,         // People this user follows
  likesReceivedCount: 15000,   // Total likes received on all posts
  totalViews: 50000            // Total views across all posts
}
```

### Credits System Breakdown

```javascript
{
  coins: 250,                  // Virtual currency for premium features
  credits: {
    total: 1000,              // Total credits allocated
    used: 250,                // Credits consumed
    remaining: 750,           // Credits still available
    lastReset: Date,          // When credits were last reset
    resetPeriod: 'monthly'    // How often credits reset
  }
}
```

### Common Query Patterns

**Get User's Feed (All Categories)**
```javascript
const feed = await getUserFeed(userId, { page: 1, limit: 20 });
```

**Get User's Feed (Specific Category)**
```javascript
const shorts = await getUserFeed(userId, { category: 'short', page: 1, limit: 20 });
```

**Get User's Liked Posts**
```javascript
const liked = await getUserLikedPosts(userId, 1, 20);
```

**Get User's Saved Posts**
```javascript
const saved = await getUserSavedPosts(userId, 'All', 1, 20);
```

**Get User's Followers**
```javascript
const followers = await getUserFollowers(userId, 1, 20);
```

**Get User's Following**
```javascript
const following = await getUserFollowing(userId, 1, 20);
```

**Get User's Posts by Category**
```javascript
const userShorts = await getUserPosts(userId, { category: 'short' });
```

**Update Profile Settings**
```javascript
await updateUserSettings(userId, {
  bio: 'New bio',
  website: 'https://example.com',
  location: 'New York'
});
```

**Check Credits Balance**
```javascript
const credits = await getUserCredits(userId);
console.log(`Remaining: ${credits.credits.remaining}`);
```

### API Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/:id/profile` | GET | Get user profile with stats |
| `/api/users/profile/settings` | PUT | Update profile settings |
| `/api/users/preferences` | PUT | Update user preferences |
| `/api/posts/feed` | GET | Get personalized feed |
| `/api/posts/category/:category` | GET | Get posts by category |
| `/api/users/:id/liked-posts` | GET | Get user's liked posts |
| `/api/users/:id/saved-posts` | GET | Get user's saved posts |
| `/api/users/:id/saved-collections` | GET | Get user's save collections |
| `/api/users/:id/save-post` | POST | Save a post |
| `/api/users/:id/unsave-post/:postId` | DELETE | Unsave a post |
| `/api/users/:id/followers` | GET | Get user's followers |
| `/api/users/:id/following` | GET | Get user's following list |
| `/api/users/:id/follow` | POST | Follow a user |
| `/api/users/:id/unfollow` | DELETE | Unfollow a user |
| `/api/users/:id/posts` | GET | Get user's posts |
| `/api/users/:id/credits` | GET | Get user's credits balance |
| `/api/users/:id/dashboard` | GET | Get user dashboard stats |

### Database Indexes Summary

**User Collection**
- `email` (unique)
- `username` (unique)
- `googleId` (unique, sparse)
- `stats.followersCount` (for trending)
- `coins` (for ranking)
- `credits.remaining` (for filtering)

**Post Collection**
- `author + createdAt` (compound, for user posts)
- `category + status + visibility` (compound, for filtering)
- `stats.likes` (for trending)
- `stats.views` (for popular posts)
- `tags` (for hashtag search)
- `aiGenerated + createdAt` (for AI content)

**Like Collection**
- `user + targetModel + targetId` (compound, unique)
- `targetModel + targetId` (for counting)

**Save Collection**
- `user + post` (compound, unique)
- `user + collection + createdAt` (for organizing)

**Follow Collection**
- `follower + following` (compound, unique)
- `follower + createdAt` (for following list)
- `following + createdAt` (for followers list)

---

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/schema-design-best-practices/)
- [Indexing Strategies](https://www.mongodb.com/docs/manual/indexes/)
- [Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)

---

## 🤝 Contributing

This is a living document. As the platform evolves, update this design doc to reflect new features and optimizations.

---

**Last Updated**: October 13, 2025
**Version**: 2.0
**Author**: LeelaVerse Development Team
**Changes in v2.0**:
- ✅ Added profile settings update functionality
- ✅ Added comprehensive post categories (short, normal-video, image-post, text-post, image-text-post)
- ✅ Added saved items with collection organization
- ✅ Added liked posts tracking
- ✅ Enhanced user statistics (followers, following, total posts)
- ✅ Added AI credits/tokens system with reset periods
- ✅ Added comprehensive API examples
- ✅ Added user journey examples
- ✅ Added quick reference guide
