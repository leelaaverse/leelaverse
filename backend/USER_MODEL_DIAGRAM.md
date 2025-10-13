# User Model Relationship Diagram

## 🎯 Visual Database Schema

```
                            ┌─────────────────┐
                            │   USER MODEL    │
                            │   (Central)     │
                            └────────┬────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
    ┌────────────▼──────────┐      │      ┌──────────▼────────────┐
    │   Posts               │      │      │   Comments            │
    │   author: User._id    │      │      │   author: User._id    │
    │   (One-to-Many)       │      │      │   (One-to-Many)       │
    └───────────────────────┘      │      └───────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼────────┐           ┌────▼────────┐          ┌─────▼────────┐
    │   Likes     │           │   Saves     │          │  Stories     │
    │ user: User  │           │ user: User  │          │ author: User │
    │(One-to-Many)│           │(One-to-Many)│          │(One-to-Many) │
    └─────────────┘           └─────────────┘          └──────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼─────────────┐     ┌─────▼──────────┐      ┌───────▼────────┐
    │  Notifications   │     │ AIGenerations  │      │CoinTransactions│
    │ recipient: User  │     │   user: User   │      │   user: User   │
    │  sender: User    │     │ (One-to-Many)  │      │ (One-to-Many)  │
    │  (One-to-Many)   │     └────────────────┘      └────────────────┘
    └──────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼───────────┐        ┌────▼────────┐         ┌──────▼──────┐
    │    Groups      │        │   Follows   │         │    Tags     │
    │ creator: User  │        │follower:User│         │  (indirect) │
    │ members[].user │        │following:   │         │  via Posts  │
    │ (One-to-Many & │        │    User     │         └─────────────┘
    │  Many-to-Many) │        │(Many-to-Many)│
    └────────────────┘        └─────────────┘
```

## 🔄 Relationship Flow Diagram

```
USER
├── Creates ──────────────────> POSTS
│   └── Posts have ──────────> COMMENTS
│   └── Posts have ──────────> LIKES
│   └── Posts have ──────────> SAVES
│   └── Posts have ──────────> TAGS
│
├── Creates ──────────────────> COMMENTS
│
├── Gives ────────────────────> LIKES
│   ├── on Posts
│   └── on Comments
│
├── Makes ────────────────────> SAVES
│   └── Organized in Collections
│
├── Creates ──────────────────> STORIES
│   └── Auto-delete after 24h
│
├── Follows ──────────────────> OTHER USERS (via FOLLOWS)
│   └── Bidirectional M2M
│
├── Creates ──────────────────> GROUPS
│   └── Can join as member
│
├── Receives ─────────────────> NOTIFICATIONS
│   └── From other users
│
├── Generates ────────────────> AI CONTENT (via AIGenerations)
│   └── Tracks usage & costs
│
├── Has ──────────────────────> COIN TRANSACTIONS
│   └── Tracks earnings & spending
│
└── Has ──────────────────────> STATS (Denormalized)
    ├── Posts Count
    ├── Followers Count
    ├── Following Count
    ├── Likes Received
    └── Total Views
```

## 📊 Data Flow: User Action → Related Models

### Example 1: User Creates a Post
```
1. User creates Post
   ├─> Post.author = User._id
   └─> User.stats.postsCount += 1

2. Post gets AI generated
   └─> AIGeneration.user = User._id
       └─> User.credits.remaining -= cost

3. Post gets liked
   └─> Like.user = OtherUser._id
       └─> User.stats.likesReceivedCount += 1
           └─> Notification.recipient = User._id
```

### Example 2: User Follows Another User
```
1. User A follows User B
   ├─> Follow.follower = UserA._id
   ├─> Follow.following = UserB._id
   ├─> UserA.stats.followingCount += 1
   └─> UserB.stats.followersCount += 1
       └─> Notification.recipient = UserB._id
```

### Example 3: User Interacts with Content
```
1. User likes a Post
   ├─> Like.user = User._id
   ├─> Like.targetId = Post._id
   ├─> Post.stats.likes += 1
   └─> Notification → Post.author

2. User saves Post
   ├─> Save.user = User._id
   ├─> Save.post = Post._id
   └─> Post.stats.saves += 1

3. User comments on Post
   ├─> Comment.author = User._id
   ├─> Comment.post = Post._id
   ├─> Post.stats.comments += 1
   └─> Notification → Post.author
```

## 🎨 Collection Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      USERS (Core)                        │
│  • All other collections depend on User existence       │
│  • CASCADE: When user deleted → set deletedAt           │
└───────────────┬─────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌─────────┐          ┌──────────┐
│  POSTS  │          │ FOLLOWS  │
│(Level 1)│          │(Level 1) │
└────┬────┘          └──────────┘
     │
     ├─────────────┬─────────────┬─────────────┐
     ▼             ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│COMMENTS │  │  LIKES  │  │  SAVES  │  │  TAGS   │
│(Level 2)│  │(Level 2)│  │(Level 2)│  │(Level 2)│
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

## 🔍 Query Patterns by User

### Get All User Content
```javascript
// All posts by user
Post.find({ author: userId })

// All comments by user
Comment.find({ author: userId })

// All stories by user
Story.find({ author: userId })

// All groups created by user
Group.find({ creator: userId })

// All AI generations by user
AIGeneration.find({ user: userId })
```

### Get All User Interactions
```javascript
// All likes by user
Like.find({ user: userId })

// All saves by user
Save.find({ user: userId })

// Users following
Follow.find({ follower: userId })

// User's followers
Follow.find({ following: userId })
```

### Get User Activity
```javascript
// All notifications
Notification.find({ recipient: userId })

// All transactions
CoinTransaction.find({ user: userId })
```

## 📈 Database Indexes by User Relations

```javascript
// Optimized queries for User-related data
[
    // Posts by author
    { author: 1, createdAt: -1 },

    // Comments by author
    { author: 1, post: 1 },

    // Likes by user
    { user: 1, targetModel: 1, targetId: 1 },

    // Saves by user
    { user: 1, post: 1 },
    { user: 1, collection: 1, createdAt: -1 },

    // Follows
    { follower: 1, following: 1 },
    { follower: 1, createdAt: -1 },
    { following: 1, createdAt: -1 },

    // Groups
    { creator: 1 },
    { 'members.user': 1 },

    // Notifications
    { recipient: 1, read: 1, createdAt: -1 },
    { sender: 1, createdAt: -1 },

    // Stories
    { author: 1, createdAt: -1 },

    // AI Generations
    { user: 1, createdAt: -1 },

    // Transactions
    { user: 1, createdAt: -1 },
    { user: 1, type: 1 }
]
```

## 🎯 Summary

**Total Models: 12**
- 1 Core Model: User
- 11 Related Models: All reference User

**Relationship Types:**
- ✅ One-to-Many: 8 relationships
- ✅ Many-to-Many: 2 relationships (Follow, Group members)
- ✅ Polymorphic: 2 models (Like, Notification)

**All Models Connected:** ✅ 100% Coverage

Every model (except Tag) has a direct reference to the User model through ObjectId fields with `ref: 'User'`.
