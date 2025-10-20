# 🔍 Prisma Quick Reference Guide
## Common Query Patterns for Leelaverse Backend

---

## 📦 Import Prisma Client

```javascript
const prisma = require('../config/prisma');
// or
const { prisma } = require('../config/database');
```

---

## 👤 USER QUERIES

### Find User by ID
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Find User by Email
```javascript
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});
```

### Find User with Relations
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: true,
    followers: true,
    following: true
  }
});
```

### Get User with Counts
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    _count: {
      select: {
        posts: true,
        followers: true,
        following: true
      }
    }
  }
});
```

### Create User
```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'testuser',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User'
  }
});
```

### Update User
```javascript
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    bio: 'New bio',
    avatar: 'https://...'
  }
});
```

### Update Coin Balance
```javascript
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    coinBalance: {
      increment: 50  // or decrement: 10
    }
  }
});
```

---

## 📝 POST QUERIES

### Create Post
```javascript
const post = await prisma.post.create({
  data: {
    authorId: userId,
    type: 'image',
    category: 'image-post',
    caption: 'My new post',
    mediaUrl: 'https://...',
    tags: ['ai', 'art']
  }
});
```

### Get Post with Author
```javascript
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    }
  }
});
```

### Get User's Posts
```javascript
const posts = await prisma.post.findMany({
  where: { authorId: userId },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

### Get Feed (Posts from followed users)
```javascript
const feed = await prisma.post.findMany({
  where: {
    author: {
      followers: {
        some: {
          followerId: currentUserId
        }
      }
    }
  },
  include: {
    author: {
      select: {
        username: true,
        avatar: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20
});
```

### Update Post Stats
```javascript
const post = await prisma.post.update({
  where: { id: postId },
  data: {
    likesCount: { increment: 1 },
    viewsCount: { increment: 1 }
  }
});
```

### Search Posts
```javascript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { caption: { contains: searchTerm, mode: 'insensitive' } },
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { has: searchTerm } }
    ]
  }
});
```

---

## 💬 COMMENT QUERIES

### Create Comment
```javascript
const comment = await prisma.comment.create({
  data: {
    postId: postId,
    authorId: userId,
    text: 'Great post!'
  }
});
```

### Create Reply
```javascript
const reply = await prisma.comment.create({
  data: {
    postId: postId,
    authorId: userId,
    text: 'Thanks!',
    parentCommentId: commentId,
    replyLevel: 1
  }
});
```

### Get Comments with Replies
```javascript
const comments = await prisma.comment.findMany({
  where: {
    postId: postId,
    parentCommentId: null  // Only top-level comments
  },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    },
    replies: {
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## ❤️ LIKE QUERIES

### Like a Post
```javascript
const like = await prisma.like.create({
  data: {
    userId: userId,
    postId: postId
  }
});

// Also increment post like count
await prisma.post.update({
  where: { id: postId },
  data: { likesCount: { increment: 1 } }
});
```

### Unlike a Post
```javascript
await prisma.like.delete({
  where: {
    userId_postId: {
      userId: userId,
      postId: postId
    }
  }
});

await prisma.post.update({
  where: { id: postId },
  data: { likesCount: { decrement: 1 } }
});
```

### Check if User Liked Post
```javascript
const liked = await prisma.like.findUnique({
  where: {
    userId_postId: {
      userId: userId,
      postId: postId
    }
  }
});

const isLiked = !!liked;
```

### Get Post Likes with Users
```javascript
const likes = await prisma.like.findMany({
  where: { postId: postId },
  include: {
    user: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    }
  }
});
```

---

## 👥 FOLLOW QUERIES

### Follow User
```javascript
const follow = await prisma.follow.create({
  data: {
    followerId: currentUserId,
    followingId: targetUserId
  }
});
```

### Unfollow User
```javascript
await prisma.follow.delete({
  where: {
    followerId_followingId: {
      followerId: currentUserId,
      followingId: targetUserId
    }
  }
});
```

### Check if Following
```javascript
const following = await prisma.follow.findUnique({
  where: {
    followerId_followingId: {
      followerId: currentUserId,
      followingId: targetUserId
    }
  }
});

const isFollowing = !!following;
```

### Get Followers
```javascript
const followers = await prisma.follow.findMany({
  where: { followingId: userId },
  include: {
    follower: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    }
  }
});
```

### Get Following
```javascript
const following = await prisma.follow.findMany({
  where: { followerId: userId },
  include: {
    following: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    }
  }
});
```

---

## 💾 SAVE QUERIES

### Save Post
```javascript
const save = await prisma.save.create({
  data: {
    userId: userId,
    postId: postId,
    collection: 'Favorites'
  }
});
```

### Unsave Post
```javascript
await prisma.save.delete({
  where: {
    userId_postId: {
      userId: userId,
      postId: postId
    }
  }
});
```

### Get Saved Posts
```javascript
const saved = await prisma.save.findMany({
  where: { userId: userId },
  include: {
    post: {
      include: {
        author: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### Get Collections
```javascript
const collections = await prisma.save.groupBy({
  by: ['collection'],
  where: { userId: userId },
  _count: {
    collection: true
  }
});
```

---

## 🤖 AI GENERATION QUERIES

### Create AI Generation
```javascript
const generation = await prisma.aIGeneration.create({
  data: {
    userId: userId,
    type: 'image',
    model: 'FLUX Schnell',
    prompt: 'A beautiful sunset',
    status: 'pending'
  }
});
```

### Update Generation Status
```javascript
const generation = await prisma.aIGeneration.update({
  where: { id: generationId },
  data: {
    status: 'completed',
    resultUrl: 'https://...',
    generationTime: 1500,
    cost: 2.5
  }
});
```

### Get User Generations
```javascript
const generations = await prisma.aIGeneration.findMany({
  where: { userId: userId },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

### Link Generation to Post
```javascript
const generation = await prisma.aIGeneration.update({
  where: { id: generationId },
  data: {
    postId: postId
  }
});
```

---

## 🪙 COIN TRANSACTION QUERIES

### Create Transaction
```javascript
const transaction = await prisma.coinTransaction.create({
  data: {
    userId: userId,
    type: 'spend',
    amount: -10,
    balanceAfter: currentBalance - 10,
    description: 'AI Image Generation',
    postId: postId,
    status: 'completed'
  }
});

// Also update user balance
await prisma.user.update({
  where: { id: userId },
  data: {
    coinBalance: { decrement: 10 },
    totalCoinsSpent: { increment: 10 }
  }
});
```

### Get Transaction History
```javascript
const transactions = await prisma.coinTransaction.findMany({
  where: { userId: userId },
  orderBy: { createdAt: 'desc' },
  take: 50
});
```

### Get Balance
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    coinBalance: true,
    totalCoinsEarned: true,
    totalCoinsSpent: true
  }
});
```

---

## 🔔 NOTIFICATION QUERIES

### Create Notification
```javascript
const notification = await prisma.notification.create({
  data: {
    recipientId: targetUserId,
    senderId: currentUserId,
    type: 'like',
    message: 'liked your post',
    postId: postId
  }
});
```

### Get User Notifications
```javascript
const notifications = await prisma.notification.findMany({
  where: { recipientId: userId },
  include: {
    sender: {
      select: {
        username: true,
        avatar: true
      }
    },
    post: {
      select: {
        id: true,
        mediaUrl: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 50
});
```

### Mark as Read
```javascript
await prisma.notification.update({
  where: { id: notificationId },
  data: {
    isRead: true,
    readAt: new Date()
  }
});
```

### Get Unread Count
```javascript
const unreadCount = await prisma.notification.count({
  where: {
    recipientId: userId,
    isRead: false
  }
});
```

---

## 📊 AGGREGATIONS & STATS

### Count Posts by User
```javascript
const postCount = await prisma.post.count({
  where: { authorId: userId }
});
```

### Get Total Likes
```javascript
const totalLikes = await prisma.like.count({
  where: { postId: postId }
});
```

### Average Engagement
```javascript
const avgStats = await prisma.post.aggregate({
  where: { authorId: userId },
  _avg: {
    likesCount: true,
    commentsCount: true,
    viewsCount: true
  }
});
```

### Group by Type
```javascript
const postsByType = await prisma.post.groupBy({
  by: ['type'],
  where: { authorId: userId },
  _count: {
    type: true
  }
});
```

---

## 🔄 TRANSACTIONS

### Atomic Operations
```javascript
const result = await prisma.$transaction(async (tx) => {
  // Deduct coins
  const user = await tx.user.update({
    where: { id: userId },
    data: { coinBalance: { decrement: 10 } }
  });

  // Create transaction record
  const transaction = await tx.coinTransaction.create({
    data: {
      userId: userId,
      type: 'spend',
      amount: -10,
      balanceAfter: user.coinBalance,
      description: 'AI Generation'
    }
  });

  // Create AI generation
  const generation = await tx.aIGeneration.create({
    data: {
      userId: userId,
      type: 'image',
      model: 'FLUX Schnell',
      prompt: 'Test prompt',
      status: 'pending'
    }
  });

  return { user, transaction, generation };
});
```

---

## 🔍 ADVANCED QUERIES

### Pagination with Cursor
```javascript
const posts = await prisma.post.findMany({
  take: 20,
  skip: 1,  // Skip cursor
  cursor: {
    id: lastPostId
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Multiple Conditions (AND)
```javascript
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { visibility: 'public' },
      { isApproved: true },
      { aiGenerated: true }
    ]
  }
});
```

### Multiple Conditions (OR)
```javascript
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: searchTerm } },
      { username: { contains: searchTerm } }
    ]
  }
});
```

### Nested Relations
```javascript
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        likes: {
          some: {
            userId: currentUserId
          }
        }
      }
    }
  }
});
```

---

## 🛠️ UTILITY QUERIES

### Disconnect from Database
```javascript
await prisma.$disconnect();
```

### Raw SQL Query
```javascript
const result = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE "username" = ${username}
`;
```

### Execute Raw SQL
```javascript
await prisma.$executeRaw`
  UPDATE "Post" SET "viewsCount" = "viewsCount" + 1 WHERE "id" = ${postId}
`;
```

---

## 🎯 Best Practices

1. **Always handle errors**
   ```javascript
   try {
     const user = await prisma.user.findUnique({ where: { id } });
   } catch (error) {
     console.error('Database error:', error);
   }
   ```

2. **Use select to limit fields**
   ```javascript
   const user = await prisma.user.findUnique({
     where: { id },
     select: {
       id: true,
       username: true,
       // Only fields you need
     }
   });
   ```

3. **Use transactions for related operations**
   ```javascript
   await prisma.$transaction([...]);
   ```

4. **Paginate large datasets**
   ```javascript
   const posts = await prisma.post.findMany({
     take: 20,
     skip: page * 20
   });
   ```

5. **Index frequently queried fields** (already done in schema)

---

## 📚 Resources

- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma CRUD Operations](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
