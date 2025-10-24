# Posting Feature - Data Flow Diagram

## Complete Feature Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │   Dashboard Component        │
                    │   - Shows feed of posts      │
                    │   - Fetches from database    │
                    └──────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐      ┌──────────────────────┐
        │   View Existing      │      │   Create New Post    │
        │   Posts in Feed      │      │   (Create Button)    │
        └──────────────────────┘      └──────────────────────┘
                    │                               │
                    │                               ▼
                    │               ┌──────────────────────────────┐
                    │               │  CreatePostModal Component   │
                    │               │  1. Enter prompt             │
                    │               │  2. Generate image (FAL AI)  │
                    │               │  3. Add caption              │
                    │               │  4. Click "Post"             │
                    │               └──────────────────────────────┘
                    │                               │
                    │                               │
┌───────────────────┴───────────────────────────────┴───────────────────┐
│                         BACKEND API LAYER                              │
└────────────────────────────────────────────────────────────────────────┘

    GET /api/posts/feed                    POST /api/posts
            │                                      │
            ▼                                      ▼
    ┌───────────────┐                  ┌────────────────────┐
    │  postController│                  │  postController    │
    │  .getFeedPosts()│                 │  .createPost()     │
    └───────────────┘                  └────────────────────┘
            │                                      │
            │                          ┌───────────┴──────────┐
            │                          │                      │
            │                          ▼                      ▼
            │                ┌──────────────────┐   ┌──────────────┐
            │                │ Upload images    │   │ Create Post  │
            │                │ to Cloudinary    │   │ in Database  │
            │                └──────────────────┘   └──────────────┘
            │                          │                      │
            ▼                          ▼                      ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER (Prisma)                        │
└───────────────────────────────────────────────────────────────────────┘

    prisma.post.findMany()              prisma.post.create()
            │                                      │
            ▼                                      ▼
    ┌───────────────┐                  ┌────────────────────┐
    │  Query Posts  │                  │   Insert Post      │
    │  with Author  │                  │   - authorId       │
    │  Information  │                  │   - caption        │
    │               │                  │   - mediaUrls[]    │
    │  Returns:     │                  │   - aiGenerated    │
    │  - Post data  │                  │   - aiModel        │
    │  - Author     │                  │   - aiPrompt       │
    │  - Media URLs │                  │   - timestamps     │
    └───────────────┘                  └────────────────────┘
            │                                      │
            │                                      │
┌───────────┴──────────────────────────────────────┴───────────────────┐
│                         POSTGRESQL DATABASE                            │
│                                                                        │
│  ┌─────────────────┐              ┌─────────────────┐                │
│  │   Post Table    │──────────────│   User Table    │                │
│  │   - id          │  authorId    │   - id          │                │
│  │   - caption     │──────────────│   - username    │                │
│  │   - mediaUrls[] │              │   - avatar      │                │
│  │   - aiModel     │              │   - email       │                │
│  │   - likesCount  │              │   - coinBalance │                │
│  │   - createdAt   │              │   - verified    │                │
│  └─────────────────┘              └─────────────────┘                │
│                                                                        │
│  ┌─────────────────┐                                                  │
│  │ AIGeneration    │                                                  │
│  │   - id          │                                                  │
│  │   - prompt      │                                                  │
│  │   - model       │                                                  │
│  │   - resultUrl   │                                                  │
│  │   - postId      │◄─── Links to Post                               │
│  └─────────────────┘                                                  │
└────────────────────────────────────────────────────────────────────────┘
            │                                      │
            │                                      │
            ▼                                      ▼
    ┌───────────────┐                  ┌────────────────────┐
    │  Return posts │                  │  Return new post   │
    │  as JSON      │                  │  as JSON           │
    └───────────────┘                  └────────────────────┘
            │                                      │
            │                                      │
┌───────────┴──────────────────────────────────────┴───────────────────┐
│                         FRONTEND UPDATE                                │
└────────────────────────────────────────────────────────────────────────┘
            │                                      │
            ▼                                      ▼
    ┌───────────────┐                  ┌────────────────────┐
    │  Dashboard    │                  │  Success Message   │
    │  setPosts()   │                  │  Close Modal       │
    │  Render feed  │◄─────────────────│  refreshPosts()    │
    └───────────────┘                  └────────────────────┘
            │
            ▼
    ┌───────────────────────────────────────┐
    │  Display Posts in Grid                │
    │  - Author info + avatar               │
    │  - Post image(s)                      │
    │  - AI model badge                     │
    │  - Caption                            │
    │  - Time ago                           │
    │  - Engagement buttons                 │
    └───────────────────────────────────────┘
```

## Key Components Interaction

```
CreatePostModal.jsx
    │
    ├─► Generates image via FAL AI
    │   POST /api/posts/generate-image
    │   
    ├─► Polls for completion
    │   GET /api/posts/generation/:requestId
    │   
    ├─► Creates post with image + caption
    │   POST /api/posts
    │   
    └─► Triggers refresh callback
        │
        └─► Dashboard.jsx
            │
            └─► refreshPosts()
                │
                └─► GET /api/posts/feed
                    │
                    └─► Updates UI with new posts
```

## State Management Flow

```
┌──────────────────────────────────┐
│  Dashboard Component State       │
├──────────────────────────────────┤
│  - posts: []                     │ ◄── Fetched from API
│  - loadingPosts: true/false      │ ◄── Shows spinner
│  - postsError: null/string       │ ◄── Shows error message
│  - activeTab: 'home'             │
└──────────────────────────────────┘
             │
             ▼
    useEffect(() => {
        fetchPosts() when activeTab === 'home'
    })
             │
             ▼
┌──────────────────────────────────┐
│  API Call                        │
│  fetch(API_URL/api/posts/feed)   │
└──────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Response Handling               │
│  if (success) setPosts(data)     │
│  if (error) setPostsError(msg)   │
│  setLoadingPosts(false)          │
└──────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  UI Update                       │
│  - Loading: Show spinner         │
│  - Error: Show error message     │
│  - Success: Render post cards    │
└──────────────────────────────────┘
```

## Image Generation & Upload Flow

```
1. User Input
   "A beautiful sunset"
        │
        ▼
2. FAL AI Request
   POST /api/posts/generate-image
   {
     prompt: "A beautiful sunset",
     model: "flux-schnell",
     numImages: 1
   }
        │
        ▼
3. FAL AI Processing
   - Creates AIGeneration record
   - Returns requestId
        │
        ▼
4. Poll for Completion
   GET /api/posts/generation/:requestId
   - Status: "processing"
   - Status: "completed" ✓
        │
        ▼
5. Get Image URL
   https://fal.media/files/xyz123.jpg
        │
        ▼
6. Create Post
   POST /api/posts
   {
     imageUrls: ["https://fal.media/..."],
     caption: "Check this out!",
     aiGenerated: true,
     aiModel: "FLUX Schnell"
   }
        │
        ▼
7. Upload to Cloudinary
   - Download from FAL URL
   - Upload to Cloudinary
   - Get permanent URL
        │
        ▼
8. Save to Database
   prisma.post.create({
     authorId: userId,
     caption: "Check this out!",
     mediaUrls: ["https://res.cloudinary.com/..."],
     aiGenerated: true,
     aiModel: "FLUX Schnell"
   })
        │
        ▼
9. Return Success
   { success: true, post: {...} }
        │
        ▼
10. Refresh Feed
    Dashboard calls refreshPosts()
        │
        ▼
11. New Post Visible!
    User sees their post at the top of feed
```

## Authentication Flow

```
User Login
    │
    ▼
JWT Token Generated
    │
    ▼
Stored in localStorage
    │
    ▼
AuthContext provides:
- user object
- accessToken
    │
    ▼
API Requests Include:
Authorization: Bearer <token>
    │
    ▼
Backend Middleware (auth.js)
- Verifies JWT
- Attaches user to req.user
    │
    ▼
Controller Access
- req.user.id (for authorId)
- User-specific operations
```

This diagram shows the complete data flow from user interaction through backend processing to database storage and back to UI display!
