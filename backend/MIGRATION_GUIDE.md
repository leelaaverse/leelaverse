# Database Migration Guide

This guide helps you migrate from the old User schema to the new comprehensive database structure.

## 🎯 Overview

The new database design includes:
- **Updated User schema** with new fields and structure
- **11 new collections** for complete social media functionality
- **Relationships** properly structured with references
- **Denormalized counters** for better performance

## 📋 Migration Steps

### Step 1: Backup Current Database

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/leelaverse" --out=./backup
```

### Step 2: Update Environment Variables

Ensure your `.env` has the following:

```env
MONGODB_URI=mongodb://localhost:27017/leelaverse
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d
```

### Step 3: Run Migration Script

Create and run this migration script:

```javascript
// migrations/migrateUserSchema.js
const mongoose = require('mongoose');
const { User, Follow } = require('../src/models');

async function migrateUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users to migrate`);

        for (const oldUser of users) {
            try {
                // Map old structure to new structure
                const newUserData = {
                    // Keep existing fields
                    email: oldUser.email,
                    password: oldUser.password,
                    username: oldUser.username,
                    firstName: oldUser.firstName || 'User',
                    lastName: oldUser.lastName || 'OAuth',
                    avatar: oldUser.avatar || oldUser.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',

                    // Map OAuth
                    googleId: oldUser.oauth?.googleId || null,

                    // Map profile fields to root level
                    bio: oldUser.profile?.bio || null,
                    website: oldUser.profile?.website || null,
                    location: oldUser.profile?.location || null,
                    coverImage: oldUser.profile?.coverImage || null,
                    phoneNumber: oldUser.phoneNumber || null,
                    dateOfBirth: oldUser.dateOfBirth || null,

                    // Map verification and status
                    verified: oldUser.verified || false,
                    isActive: oldUser.isActive !== undefined ? oldUser.isActive : true,
                    emailVerified: oldUser.isEmailVerified || false,

                    // Initialize new stats structure
                    stats: {
                        postsCount: oldUser.totalCreations || 0,
                        followersCount: oldUser.followers?.length || 0,
                        followingCount: oldUser.following?.length || 0,
                        likesReceivedCount: 0,
                        totalViews: 0
                    },

                    // Initialize coins and credits
                    coins: oldUser.coins || 250,
                    credits: {
                        total: 1000,
                        used: 0,
                        remaining: 1000,
                        lastReset: new Date(),
                        resetPeriod: 'monthly'
                    },
                    aiCredits: {
                        imageGeneration: 10,
                        videoGeneration: 5,
                        textEnhancement: 20
                    },

                    // Initialize preferences
                    preferences: {
                        darkMode: false,
                        emailNotifications: true,
                        pushNotifications: true,
                        language: 'en'
                    },

                    // Keep security fields
                    emailVerificationToken: oldUser.emailVerificationToken,
                    passwordResetToken: oldUser.passwordResetToken,
                    passwordResetExpires: oldUser.passwordResetExpires,
                    refreshTokens: oldUser.refreshTokens || [],

                    // Keep activity tracking
                    lastLogin: oldUser.lastLogin,
                    lastActive: oldUser.lastActive || oldUser.updatedAt,
                    loginAttempts: oldUser.loginAttempts || 0,
                    lockUntil: oldUser.lockUntil,

                    // Keep role and ban info
                    role: oldUser.role || 'user',
                    isBanned: oldUser.isBanned || false,
                    banReason: oldUser.banReason,
                    banExpiresAt: oldUser.banExpiresAt,

                    // Keep timestamps
                    createdAt: oldUser.createdAt,
                    updatedAt: oldUser.updatedAt,
                    deletedAt: null
                };

                // Update user document
                await mongoose.connection.db.collection('users').updateOne(
                    { _id: oldUser._id },
                    { $set: newUserData }
                );

                // Migrate followers to Follow collection
                if (oldUser.followers && oldUser.followers.length > 0) {
                    for (const followerId of oldUser.followers) {
                        try {
                            await Follow.create({
                                follower: followerId,
                                following: oldUser._id,
                                notificationsEnabled: true
                            });
                        } catch (err) {
                            // Skip if follow relationship already exists
                            if (err.code !== 11000) throw err;
                        }
                    }
                }

                // Migrate following to Follow collection
                if (oldUser.following && oldUser.following.length > 0) {
                    for (const followingId of oldUser.following) {
                        try {
                            await Follow.create({
                                follower: oldUser._id,
                                following: followingId,
                                notificationsEnabled: true
                            });
                        } catch (err) {
                            // Skip if follow relationship already exists
                            if (err.code !== 11000) throw err;
                        }
                    }
                }

                console.log(`✓ Migrated user: ${oldUser.username}`);
            } catch (error) {
                console.error(`✗ Error migrating user ${oldUser.username}:`, error.message);
            }
        }

        // Remove old fields from all users
        await mongoose.connection.db.collection('users').updateMany(
            {},
            {
                $unset: {
                    'oauth': '',
                    'profile': '',
                    'followers': '',
                    'following': '',
                    'totalCreations': '',
                    'totalEarnings': '',
                    'isEmailVerified': '',
                    'emailVerificationExpires': ''
                }
            }
        );

        console.log('✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateUsers();
```

### Step 4: Run the Migration

```bash
node migrations/migrateUserSchema.js
```

### Step 5: Verify Migration

```javascript
// scripts/verifyMigration.js
const mongoose = require('mongoose');
const { User, Follow } = require('../src/models');

async function verifyMigration() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check users
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);

    // Sample a user
    const sampleUser = await User.findOne();
    console.log('\nSample user structure:');
    console.log(JSON.stringify(sampleUser, null, 2));

    // Check follows
    const followCount = await Follow.countDocuments();
    console.log(`\nTotal follow relationships: ${followCount}`);

    // Verify stats
    const usersWithStats = await User.countDocuments({
        'stats.followersCount': { $exists: true }
    });
    console.log(`Users with stats: ${usersWithStats}`);

    // Verify credits
    const usersWithCredits = await User.countDocuments({
        'credits.remaining': { $exists: true }
    });
    console.log(`Users with credits: ${usersWithCredits}`);

    mongoose.disconnect();
}

verifyMigration();
```

### Step 6: Create Indexes

The indexes will be created automatically when you use the models, but you can force creation:

```javascript
// scripts/createIndexes.js
const mongoose = require('mongoose');
const models = require('../src/models');

async function createIndexes() {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Creating indexes...');

    for (const [modelName, Model] of Object.entries(models)) {
        try {
            await Model.createIndexes();
            console.log(`✓ Created indexes for ${modelName}`);
        } catch (error) {
            console.error(`✗ Error creating indexes for ${modelName}:`, error.message);
        }
    }

    console.log('✓ All indexes created!');
    mongoose.disconnect();
}

createIndexes();
```

## 🔄 Rollback Plan

If you need to rollback:

```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/leelaverse" --drop ./backup/leelaverse
```

## 📊 Post-Migration Tasks

### 1. Recalculate User Stats

```javascript
const { updateUserStats } = require('./src/utils/dbHelpers');

async function recalculateAllStats() {
    const users = await User.find({ deletedAt: null });

    for (const user of users) {
        try {
            await updateUserStats.recalculateUserStats(user._id);
            console.log(`✓ Recalculated stats for ${user.username}`);
        } catch (error) {
            console.error(`✗ Error for ${user.username}:`, error.message);
        }
    }
}
```

### 2. Set Initial Credits

All users will have:
- **250 coins** (initial balance)
- **1000 credits** (monthly AI generation credits)
- **10 image generations**
- **5 video generations**
- **20 text enhancements**

## ⚠️ Breaking Changes

1. **User Schema**:
   - `oauth` object removed → `googleId` is now at root level
   - `profile` object removed → fields moved to root level
   - `followers` array removed → use `Follow` collection
   - `following` array removed → use `Follow` collection
   - Added `stats` object with counters
   - Added `credits` and `aiCredits` objects

2. **New Collections**:
   - Must create 11 new collections
   - Relationships must be established

3. **API Changes**:
   - Update queries to use new field paths
   - Use `Follow` collection instead of embedded arrays
   - Use population for related data

## 🔍 Testing

After migration, test these scenarios:

1. **Authentication**: Login with existing users
2. **Profiles**: View and edit user profiles
3. **Follows**: Follow/unfollow operations
4. **Posts**: Create, view, edit posts
5. **Likes**: Like/unlike posts and comments
6. **Stats**: Verify counter accuracy

## 📞 Support

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running and accessible
4. Check that all models are properly imported
5. Verify indexes were created successfully

## ✅ Migration Checklist

- [ ] Backup current database
- [ ] Update environment variables
- [ ] Run migration script
- [ ] Verify migration results
- [ ] Create indexes
- [ ] Recalculate stats
- [ ] Test authentication
- [ ] Test user operations
- [ ] Test social features
- [ ] Update API endpoints
- [ ] Update frontend queries
- [ ] Document API changes
