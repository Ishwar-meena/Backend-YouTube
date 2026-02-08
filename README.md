# Backend YouTube

A full-featured YouTube backend clone built with Node.js, Express.js, MongoDB, and Cloudinary for media management.


## ✨ Features

- **User Authentication & Authorization** - JWT-based authentication with access and refresh tokens
- **Video Management** - Upload, view, update, delete, and toggle video publishing status
- **Comments System** - Add and delete comments on videos
- **Tweets/Posts** - Create, read, update, and delete tweets
- **Playlists** - Create and manage video playlists
- **Like System** - Like videos, comments, and tweets
- **User Profiles** - Update user details, avatar, and cover image
- **Watch History** - Track and retrieve user watch history
- **Channel Dashboard** - Get channel statistics and videos
- **Subscription System** - Subscribe to channels
- **File Upload** - Support for image and video uploads via Cloudinary

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **File Upload:** Multer + Cloudinary
- **Environment Management:** dotenv
- **Development:** Nodemon

## 📁 Project Structure

```
Backend YouTube/
├── public/
│   └── temp/              # Temporary file storage for uploads
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── healthcheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db/
│   │   └── connection.js  # MongoDB connection configuration
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT authentication
│   │   └── multer.middleware.js  # File upload handling
│   ├── models/            # Mongoose schemas
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/            # API routes
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── utils/             # Utility functions
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinaryFileUpload.js
│   ├── app.js             # Express app configuration
│   ├── constants.js       # Application constants
│   └── server.js          # Server entry point
├── .env                   # Environment variables (not in repo)
└── package.json
```

## 🗄 Database Models

### User Model
- **Fields:** username, email, fullName, avatar, coverImage, password, refreshToken, watchHistory
- **Features:** Password hashing with bcrypt, JWT token generation methods
- **Relations:** Referenced in Video, Comment, Tweet, Playlist, Like, Subscription

### Video Model
- **Fields:** videoFile, thumbnail, owner, title, description, duration, views, isPublished
- **Features:** Mongoose aggregate pagination plugin
- **Relations:** References User (owner)

### Comment Model
- **Fields:** content, video, owner
- **Relations:** References Video and User

### Tweet Model
- **Fields:** content, owner
- **Relations:** References User

### Playlist Model
- **Fields:** name, description, owner, videos[]
- **Relations:** References User (owner) and Video array

### Like Model
- **Fields:** comment, video, tweet, likedBy
- **Relations:** References Comment, Video, Tweet, and User

### Subscription Model
- **Fields:** subscriber, channel
- **Relations:** References User for both subscriber and channel

## 🚀 API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### User Routes (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user with avatar and cover image | ❌ |
| POST | `/login` | Login user | ❌ |
| POST | `/logout` | Logout user | ✅ |
| POST | `/generate-refresh-token` | Generate new access token | ❌ |
| POST | `/update-password` | Update user password | ✅ |
| POST | `/update-user` | Update user details | ✅ |
| POST | `/user-info` | Get current user information | ✅ |
| PATCH | `/update-avatar` | Update user avatar | ✅ |
| PATCH | `/update-coverimage` | Update user cover image | ✅ |
| GET | `/channel/:channel_name` | Get channel information | ✅ |
| GET | `/user/watch-history` | Get user watch history | ✅ |

### Video Routes (`/video`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/get-all-videos` | Get all published videos | ❌ |
| POST | `/get-video/:videoId` | Get specific video by ID | ❌ |
| POST | `/upload-video` | Upload a new video with thumbnail | ✅ |
| PATCH | `/watch-video/:videoId` | Increment video view count | ✅ |
| DELETE | `/delete-video/:videoId` | Delete a video | ✅ |
| PATCH | `/toggle-published-video/:videoId` | Toggle video published status | ✅ |
| PATCH | `/update-video-thumbnail/:videoId` | Update video thumbnail | ✅ |

### Comment Routes (`/comment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add-comment` | Add a comment to a video | ✅ |
| DELETE | `/delete-comment` | Delete a comment | ✅ |

### Tweet Routes (`/tweets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-tweet` | Create a new tweet | ✅ |
| GET | `/get-tweets` | Get user's tweets | ✅ |
| PATCH | `/update-tweet/:tweetId` | Update a tweet | ✅ |
| DELETE | `/delete-tweet/:tweetId` | Delete a tweet | ✅ |

### Playlist Routes (`/playlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-playlist` | Create a new playlist | ✅ |
| PATCH | `/addvideo/:videoId` | Add video to playlist | ✅ |
| DELETE | `/delete-video/:videoId` | Remove video from playlist | ✅ |
| PATCH | `/update-playlist/:playlistId` | Update playlist details | ✅ |
| GET | `/get-playlist` | Get user playlists | ✅ |
| GET | `/get-playlist-by-id/:playlistId` | Get specific playlist | ✅ |
| DELETE | `/delete-playlist/:playlistId` | Delete a playlist | ✅ |

### Like Routes (`/like`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/toggle-video-like/:videoId` | Like/unlike a video | ✅ |
| POST | `/toggle-comment-like/:commentId` | Like/unlike a comment | ✅ |
| POST | `/toggle-tweet-like/:tweetId` | Like/unlike a tweet | ✅ |
| GET | `/liked-videos` | Get all liked videos | ✅ |

### Dashboard Routes (`/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/channel-stats` | Get channel statistics | ✅ |
| POST | `/channel-videos` | Get channel videos | ✅ |

### Health Check Routes (`/health`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Check API health status | ❌ |

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ishwar-meena/Backend-YouTube
cd "Backend YouTube"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vidtube
# or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vidtube

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRE=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRE=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:8000
```

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
node src/server.js
```

5. **Verify installation**

Visit `http://localhost:8000/api/v1/health` to check if the server is running.


## 📖 Usage

### Register a New User

```bash
POST /api/v1/users/register
Content-Type: multipart/form-data

Body:
- username: johndoe
- email: john@example.com
- fullName: John Doe
- password: securePassword123
- avatar: [file]
- coverImage: [file] (optional)
```

### Login

```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response includes access token and refresh token stored in HTTP-only cookies.

### Upload a Video

```bash
POST /api/v1/video/upload-video
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Body:
- title: My Video Title
- description: Video description
- video: [video file]
- thumbnail: [image file]
```

### Get All Videos

```bash
GET /api/v1/video/get-all-videos
```

### Create a Comment

```bash
POST /api/v1/comment/add-comment
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "videoId": "video_object_id",
  "content": "Great video!"
}
```

## 🔒 Middleware

### Authentication Middleware (`auth.middleware.js`)
- **Function:** `verifyJWT`
- **Purpose:** Validates JWT tokens and protects routes
- **Usage:** Applied to routes requiring authentication
- **Implementation:** Extracts token from cookies or Authorization header

### File Upload Middleware (`multer.middleware.js`)
- **Function:** `upload`
- **Purpose:** Handles multipart/form-data file uploads
- **Storage:** Temporarily stores files in `public/temp/`
- **Usage:** Used for avatar, cover image, video, and thumbnail uploads

## 🛠 Utilities

### API Error Handler (`apiError.js`)
Custom error class for consistent error handling across the application.

### API Response Handler (`apiResponse.js`)
Standardized response format for API responses.

### Async Handler (`asyncHandler.js`)
Wrapper function to handle async/await errors in controllers.

### Cloudinary File Upload (`cloudinaryFileUpload.js`)
Utility to upload files to Cloudinary and delete local temporary files.

## 🔑 Key Features Explained

### JWT Authentication
- Access tokens for short-term authentication (1 day)
- Refresh tokens for generating new access tokens (10 days)
- Tokens stored in HTTP-only cookies for security

### File Management
- Files temporarily stored locally using Multer
- Uploaded to Cloudinary for permanent storage
- Local files cleaned up after successful upload

### CORS Configuration
- Configured to accept requests from localhost
- Whitelist-based origin validation

### Password Security
- Passwords hashed using bcrypt before storage
- Pre-save hook in User model handles hashing
- Password comparison method for authentication

## 📝 Notes

- The database name is set to `vidtube` in constants.js
- File size limits set to 12kb for JSON and URL-encoded data
- Cookie parser enabled for handling JWT tokens
- Mongoose aggregate pagination enabled for Video model
- All protected routes require valid JWT authentication

## 👨‍💻 Author

### [Hackerx]("https://www.hackerx.in")


---

For any questions or issues, please open an issue in the repository.
