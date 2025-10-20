# 🔄 MongoDB to PostgreSQL Migration Guide
## Leelaverse Backend - Database Migration to Supabase + Prisma ORM

---

## 📋 Overview

This document outlines the complete migration from **MongoDB + Mongoose** to **PostgreSQL + Prisma ORM** using **Supabase** as the database provider.

### Migration Summary
- **From:** MongoDB Atlas with Mongoose ODM
- **To:** PostgreSQL (Supabase) with Prisma ORM
- **Date:** $(Get-Date -Format "yyyy-MM-dd")
- **Status:** ✅ Schema Ready, Pending Migration Execution

---

## 🎯 What Changed

### 1. **Database Provider**
- ❌ MongoDB Atlas → ✅ Supabase PostgreSQL
- ❌ `MONGODB_URI` → ✅ `DATABASE_URL` and `DIRECT_URL`

### 2. **ORM/ODM**
- ❌ Mongoose (ODM) → ✅ Prisma (ORM)
- ❌ `mongoose` package → ✅ `@prisma/client` and `prisma`

### 3. **Data Models**
- ❌ Mongoose Schemas → ✅ Prisma Schema (`schema.prisma`)
- All 11 models converted:
  - User
  - Post
  - Comment
  - Like
  - Follow
  - Save
  - Story (with StoryView)
  - AIGeneration
  - CoinTransaction
  - Notification
  - RefreshToken (new model)
  - Tag
  - Group

### 4. **Key Structural Changes**

#### ID Fields
- ❌ MongoDB ObjectId (`_id`) → ✅ PostgreSQL CUID (`id: String @default(cuid())`)

#### Timestamps
- ❌ `timestamps: true` → ✅ `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`

#### Relations
- ❌ `ref: 'User'` → ✅ Explicit relations with `@relation` directive
- ❌ Array of ObjectIds → ✅ Proper foreign key relationships

#### Refresh Tokens
- ❌ Embedded array in User → ✅ Separate `RefreshToken` model with foreign key

#### Story Views
- ❌ Embedded array → ✅ Separate `StoryView` model

---

## 📁 File Changes

### New Files
```
backend/
├── prisma/
│   └── schema.prisma                    # ✨ NEW: Prisma schema definition
├── src/
│   ├── config/
│   │   ├── prisma.js                    # ✨ NEW: Prisma client singleton
│   │   └── database.js                  # ✏️ MODIFIED: Now uses Prisma
│   ├── services/
│   │   └── UserService.js               # ✨ NEW: User service with Prisma
│   └── controllers/
│       ├── authController.js            # ✏️ REWRITTEN: Uses Prisma
│       └── authController.old.js        # 📦 BACKUP: Original Mongoose version
```

### Modified Files
```
- .env                                    # Updated database URLs
- .env.example                            # Updated with Prisma variables
- package.json                            # Added Prisma dependencies
- app.js                                  # Removed Mongoose, added Prisma
- src/middleware/auth.js                  # Updated to use UserService
```

### Deprecated Files (To Be Removed)
```
- src/models/*.js                         # All Mongoose models (keep as backup)
```

---

## 🔧 Environment Variables

### Old (.env)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leelaverse
```

### New (.env)
```bash
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.vazrmnotobblcnebrfui:+23+45-abc@26@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgresql://postgres.vazrmnotobblcnebrfui:+23+45-abc@26@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

---

## 🚀 Migration Steps

### Step 1: Install Dependencies
```powershell
cd backend
npm install @prisma/client
npm install -D prisma
```

### Step 2: Generate Prisma Client
```powershell
npx prisma generate
```

### Step 3: Run Initial Migration
This will create all tables in your Supabase database:
```powershell
npx prisma migrate dev --name init
```

### Step 4: Verify Database
Check your Supabase dashboard to ensure all tables were created.

### Step 5: (Optional) Seed Data
If you want to start fresh with test data:
```powershell
# Create a seed script first (see Seeding section below)
npx prisma db seed
```

---

## 📊 Schema Highlights

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String?

  // Relations
  posts     Post[]
  comments  Comment[]
  followers Follow[] @relation("UserFollowers")
  following Follow[] @relation("UserFollowing")
  // ... more relations
}
```

### Post Model
```prisma
model Post {
  id         String   @id @default(cuid())
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])

  type       String   // 'image', 'video', 'text', 'short'
  caption    String?
  mediaUrl   String?

  likesCount Int      @default(0)
  // ... more fields
}
```

### Key Relations
- `User` ↔ `Post` (One-to-Many)
- `User` ↔ `Follow` (Many-to-Many self-relation)
- `Post` ↔ `Comment` (One-to-Many)
- `Post/Comment` ↔ `Like` (Polymorphic via optional fields)

---

## 📝 Query Migration Examples

### Finding a User

#### Mongoose (OLD)
```javascript
const user = await User.findOne({ email });
```

#### Prisma (NEW)
```javascript
const user = await prisma.user.findUnique({
  where: { email }
});
```

### Creating a Post

#### Mongoose (OLD)
```javascript
const post = new Post({
  author: userId,
  caption: 'Hello',
  type: 'text'
});
await post.save();
```

#### Prisma (NEW)
```javascript
const post = await prisma.post.create({
  data: {
    authorId: userId,
    caption: 'Hello',
    type: 'text'
  }
});
```

### Finding Posts with Author

#### Mongoose (OLD)
```javascript
const posts = await Post.find()
  .populate('author', 'username avatar')
  .sort({ createdAt: -1 });
```

#### Prisma (NEW)
```javascript
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: {
        username: true,
        avatar: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Counting Relations

#### Mongoose (OLD)
```javascript
const postCount = await Post.countDocuments({ author: userId });
```

#### Prisma (NEW)
```javascript
const postCount = await prisma.post.count({
  where: { authorId: userId }
});
```

---

## 🔄 Data Migration (If Needed)

If you have existing MongoDB data to migrate:

### Option 1: Manual Export/Import
```powershell
# Export from MongoDB
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json

# Transform and import to PostgreSQL
# (You'll need a custom script for this)
```

### Option 2: Dual Write Period
1. Keep both databases running
2. Write to both MongoDB and PostgreSQL
3. Verify PostgreSQL data
4. Switch read operations to PostgreSQL
5. Decommission MongoDB

### Option 3: Fresh Start
If this is development/early stage:
- Start with empty PostgreSQL database
- Let users register fresh
- No data migration needed

---

## 🧪 Testing the Migration

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 4. Check Database
```powershell
npx prisma studio
```
This opens a visual database browser at http://localhost:5555

---

## 🎨 Prisma Studio

Prisma Studio is a visual database editor:

```powershell
npx prisma studio
```

Features:
- Browse all tables
- View, edit, add, delete records
- Test relations
- Great for debugging

---

## 📚 Prisma Commands Reference

```powershell
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema without creating migration
npx prisma db push
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: Connection Pooling Errors
**Error:** `Can't reach database server`

**Solution:** Make sure you're using the correct URL format with `?pgbouncer=true` for connection pooling.

### Issue 2: Migration Fails
**Error:** `P3009: Failed to apply migration`

**Solution:**
```powershell
npx prisma migrate resolve --rolled-back <migration_name>
```

### Issue 3: Schema Out of Sync
**Error:** `Prisma schema is out of sync with database`

**Solution:**
```powershell
npx prisma db push
```

### Issue 4: Foreign Key Violations
**Error:** `Foreign key constraint failed`

**Solution:** Ensure related records exist before creating relationships. Use transactions for complex operations.

---

## 🔐 Security Considerations

1. **Password in Connection String**: Store securely, never commit to Git
2. **Connection Pooling**: Already configured for Supabase
3. **Row Level Security**: Consider enabling in Supabase for additional security
4. **Query Logging**: Disabled in production (configured in `prisma.js`)

---

## 📊 Performance Tips

1. **Indexes**: Already defined in schema with `@@index` directives
2. **Connection Pooling**: Using PgBouncer via Supabase
3. **Select Only Needed Fields**: Use `select` to reduce data transfer
4. **Pagination**: Always paginate large datasets
5. **Caching**: Consider Redis for frequently accessed data

---

## 🚧 Remaining Work

### Files to Update (Post Controllers)
- [ ] `src/controllers/postController.js` - Convert to Prisma
- [ ] Update all route handlers to use Prisma queries
- [ ] Create service files for other models

### Optional Enhancements
- [ ] Add database seeding script
- [ ] Implement soft deletes
- [ ] Add database backup strategy
- [ ] Set up Row Level Security in Supabase
- [ ] Add full-text search capabilities

---

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🆘 Need Help?

1. Check Prisma logs: Set `DEBUG=prisma:*` environment variable
2. Review Supabase logs in dashboard
3. Use Prisma Studio to inspect database state
4. Check the Prisma Discord community

---

## ✅ Rollback Plan

If you need to rollback to MongoDB:

1. Restore `authController.old.js` to `authController.js`
2. Restore original `src/config/database.js` from Git history
3. Restore `mongoose` in `package.json`
4. Revert `.env` to use `MONGODB_URI`
5. Run `npm install` to restore Mongoose

---

**Migration Status:** 🟡 In Progress - Schema ready, awaiting execution

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
