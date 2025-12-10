# 🚀 Quick Start Guide - Social Features

## ✨ WHERE TO FIND EVERYTHING

### 📍 **Navigation Menu (Hamburger Icon ☰)**
Click the hamburger menu icon at the top-left of your screen to see:

1. **🏠 Home** - Landing page
2. **📡 Feed** - ⭐ CREATE & VIEW POSTS HERE
3. **🧭 Explore** - Browse tasks
4. **👥 Find Users** - ⭐ SEARCH & FOLLOW USERS HERE
5. **⚔️ Duels** - Productivity challenges
6. **➕ Create Task** - Post new tasks
7. **🏆 Leaderboard** - Rankings

---

## 📝 HOW TO CREATE A POST

### Step 1: Navigate to Feed
1. Click the **☰ hamburger menu** (top-left)
2. Click **"Feed"**
3. You'll see the Feed page

### Step 2: Create Your Post
1. Look for the box that says **"What's on your mind?"**
2. Click on it
3. A text area will expand
4. Type your post (up to 500 characters)
5. **Optional:** Click "Add Image" to paste an image URL
6. Click the **"Post"** button (yellow/orange gradient)

### That's it! Your post is now live! 🎉

---

## 👥 HOW TO FOLLOW USERS

### Method 1: Find Users Page
1. Click the **☰ hamburger menu**
2. Click **"Find Users"**
3. Browse all users or use the search bar
4. Click on any **user card**
5. A profile modal will pop up
6. Click the **"Follow"** button (yellow gradient)
7. You'll now see their posts in your feed!

### Method 2: Search Icon
1. Click the **🔍 search icon** in the top-right corner
2. This also takes you to "Find Users"
3. Follow the same steps as Method 1

---

## 💡 IMPORTANT NOTES

### ✅ YOU MUST BE LOGGED IN TO:
- Create posts
- Like posts
- Comment on posts
- Follow/unfollow users
- See your personalized feed

### 📌 CURRENT BEHAVIOR:
- **Your Profile** (`/profile`) - Shows YOUR info only
- **Find Users** (`/search`) - Shows ALL users with Follow buttons
- **Feed** (`/feed`) - Shows posts from people you follow + your own posts

### 🎯 FOLLOW BUTTONS APPEAR:
- ✅ In the **user profile modal** (when you click a user card in "Find Users")
- ✅ Only for **other users** (not your own profile)
- ✅ Only when you're **logged in**

---

## 🔧 STEP-BY-STEP WALKTHROUGH

### Complete Social Experience:

1. **Login/Register:**
   - If not logged in, click "Login / Sign Up" in the menu
   - Create an account or login

2. **Find & Follow People:**
   ```
   ☰ Menu → Find Users → Click a user card → Click "Follow"
   ```

3. **Create Your First Post:**
   ```
   ☰ Menu → Feed → Click "What's on your mind?" → Type → Click "Post"
   ```

4. **Interact with Posts:**
   - ❤️ **Like**: Click the heart icon
   - 💬 **Comment**: Type in the comment box and press Enter
   - 🗑️ **Delete**: Click trash icon on YOUR posts

5. **See Your Personalized Feed:**
   - Go to Feed
   - You'll see posts from users you follow
   - Plus your own posts

---

## 🎨 VISUAL GUIDE

### Where is the "Follow" button?

```
Find Users Page (/search)
    ↓
Click any user card
    ↓
Profile Modal Opens
    ↓
Look for the yellow "Follow" button
    (next to user's name and email)
    ↓
Click "Follow"
    ↓
Button changes to gray "Unfollow"
```

### Where to create posts?

```
Feed Page (/feed)
    ↓
Look for white box at top
    ↓
"What's on your mind?" text
    ↓
Click it
    ↓
Form expands with textarea
    ↓
Type your post
    ↓
Click yellow "Post" button
```

---

## ❓ TROUBLESHOOTING

### "I don't see the Follow button"
- ✅ Make sure you're logged in
- ✅ Make sure you clicked on a **different** user (not your own profile)
- ✅ Make sure you're on the **Find Users** page (`/search`)
- ✅ Make sure you clicked a user card to open the modal

### "I can't create posts"
- ✅ Make sure you're logged in
- ✅ Navigate to `/feed` (via the hamburger menu)
- ✅ Click on "What's on your mind?" to expand the form
- ✅ Type some content (can't post empty content)

### "Feed is empty"
- ✅ If you haven't followed anyone, create some posts yourself first
- ✅ Or follow some users from the "Find Users" page
- ✅ Posts from followed users will appear in your feed

---

## 🎯 QUICK LINKS

When your app is running on `http://localhost:5173`:

- **Feed**: http://localhost:5173/feed
- **Find Users**: http://localhost:5173/search
- **Your Profile**: http://localhost:5173/profile
- **Home**: http://localhost:5173/

---

## 🔄 FLOW DIAGRAM

```
Login → Find Users → Follow People → Return to Feed → Create Post → Like & Comment
  ↓                                         ↑
  └─────────────────────────────────────────┘
              (See personalized feed)
```

---

## 💫 FEATURES SUMMARY

✅ **Feed System** (`/feed`)
- Create text posts (up to 500 chars)
- Add images via URL
- Like/unlike posts
- Comment on posts
- Delete your own posts
- See posts from followed users

✅ **Follow System** (`/search`)
- Search users by name
- Filter by XP/Level
- View user profiles in modal
- Follow/unfollow with one click
- See follower/following counts

✅ **User Discovery**
- Browse all users
- Advanced filtering
- View detailed profiles
- See work experience
- View social links

---

## 📞 STILL STUCK?

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache**
3. **Make sure both servers are running:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
4. **Check browser console** for any errors (F12)

---

**Everything is ready and working! Just follow the steps above.** 🚀

**TL;DR:**
- **Create Post**: ☰ Menu → Feed → "What's on your mind?"
- **Follow Users**: ☰ Menu → Find Users → Click user → Follow button
