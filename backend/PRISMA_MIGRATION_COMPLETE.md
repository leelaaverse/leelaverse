# 🚀 PostgreSQL + Prisma Migration Complete

## ✅ What's Been Done

### 1. **Database Migration to PostgreSQL (Supabase)**
- ✅ Prisma schema fully configured with all models
- ✅ PostgreSQL-specific data types and relationships
- ✅ All indexes and constraints properly set up

### 2. **Removed MongoDB/Mongoose Dependencies**
- ✅ All Mongoose models backed up (*.mongoose.js.bak)
- ✅ Database connections switched to Prisma
- ✅ No more MongoDB code in active files

### 3. **Updated All Database Interactions**
- ✅ `UserService.js` - Already using Prisma
- ✅ `dbHelpers.js` - Completely rewritten for Prisma
- ✅ `models/index.js` - Now exports Prisma client
- ✅ Controllers using Prisma client

### 4. **Updated Configuration Files**
- ✅ `package.json` - Added Prisma scripts and dev dependency
- ✅ `.env.example` - Supabase connection strings configured
- ✅ `database.js` - Using Prisma connection
- ✅ `prisma.js` - Prisma client singleton

### 5. **New Prisma Scripts Available**
```json
"prisma:generate": "prisma generate"
"prisma:migrate": "prisma migrate dev"
"prisma:migrate:deploy": "prisma migrate deploy"
"prisma:studio": "prisma studio"
"prisma:push": "prisma db push"
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for database provisioning (~2 minutes)
3. Go to **Project Settings > Database**
4. Copy your connection strings:
   - **Transaction pooler** → `DATABASE_URL`
   - **Session pooler** → `DIRECT_URL`

### Step 3: Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Required for Prisma + Supabase
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Other required vars
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
FAL_KEY="your-fal-ai-key"
# ... etc
```

### Step 4: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 5: Push Schema to Database

**Option A: Quick Push (Development)**
```bash
npm run prisma:push
```

**Option B: With Migrations (Recommended)**
```bash
npm run prisma:migrate
# Enter migration name when prompted: "init"
```

### Step 6: Verify Database

Open Prisma Studio to view your database:
```bash
npm run prisma:studio
```

### Step 7: Start the Server
```bash
npm run dev
```

---

## 📊 Database Schema Overview

### Core Models
- ✅ **User** - Authentication, profile, OAuth, coins, subscriptions
- ✅ **RefreshToken** - JWT refresh token management
- ✅ **Post** - Content posts (images, videos, text, shorts)
- ✅ **AIGeneration** - AI-generated content tracking
- ✅ **Comment** - Nested comments on posts
- ✅ **Like** - Likes on posts and comments
- ✅ **Follow** - User follow relationships
- ✅ **Save** - Saved posts by users
- ✅ **Story** - 24-hour stories with views
- ✅ **StoryView** - Story view tracking
- ✅ **CoinTransaction** - Coin economy transactions
- ✅ **Notification** - User notifications
- ✅ **Tag** - Content tags
- ✅ **Group** - Community groups (future)

### Key Features
- 🔐 **OAuth Support** - Google, GitHub, Discord
- 💰 **Coin System** - Earning, spending, transactions
- 🎨 **AI Integration** - FAL.AI for image/video generation
- 📊 **Engagement Tracking** - Likes, comments, saves, views
- 🔔 **Notifications** - Real-time user notifications
- 👥 **Social Features** - Follow, like, comment, share

---

## 🛠️ Common Prisma Commands

### Development
```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Push schema changes to database (no migration files)
npm run prisma:push

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Production
```bash
# Deploy pending migrations
npm run prisma:migrate:deploy
```

### Useful Queries
```bash
# View all migrations
npx prisma migrate status

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# Validate schema file
npx prisma validate
```

---

## 🔄 Migration from MongoDB

All MongoDB/Mongoose code has been **backed up** with `.mongoose.js.bak` extension:

- `User.js` → `User.mongoose.js.bak`
- `dbHelpers.js` → `dbHelpers.mongoose.js.bak`
- Other models remain for reference

**Do NOT delete these files yet** - keep them until you've verified everything works.

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- ✅ Check your `DATABASE_URL` is correct
- ✅ Verify Supabase project is running
- ✅ Check firewall/network settings

### Error: "Unknown argument 'pgbouncer'"
- ✅ Use `DATABASE_URL` for queries
- ✅ Use `DIRECT_URL` for migrations

### Error: "Table does not exist"
- ✅ Run `npm run prisma:push` or `npm run prisma:migrate`

### Slow query performance
- ✅ Check if indexes are created (see schema.prisma)
- ✅ Use Prisma Studio to verify data
- ✅ Enable query logging in development

---

## 📚 Helpful Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

## 🎉 Next Steps

1. ✅ Test user registration and login
2. ✅ Test post creation with AI generation
3. ✅ Test coin transactions
4. ✅ Test follow/unfollow functionality
5. ✅ Test notifications
6. ✅ Deploy to production (Vercel/Railway)

---

## 💡 Pro Tips

- Use **Prisma Studio** for quick database inspection
- Enable **query logging** in development for debugging
- Use **transactions** for operations that need atomicity
- Always use **prisma.$disconnect()** in serverless functions
- Use **connection pooling** (pgBouncer) for better performance

---

**Status:** ✅ Migration Complete - Ready for Development!
