# 🚀 DevTracker API - Postman Testing Guide

## Base URL
```
http://localhost:3000
```

---

## 📋 Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Project Routes](#project-routes)
3. [Task Routes](#task-routes)

---

## 🔐 Authentication Routes

### 1. Register User
**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "userId": "6957d776a06237e23de632b2"
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "6957d776a06237e23de632b2"
}
```

**⚠️ IMPORTANT:** Copy the `token` from this response! You'll need it for all protected routes.

---

## 📁 Project Routes

**All project routes require authentication!** Add the token to the Authorization header.

### 1. Get All Projects (for logged-in user)
**GET** `/api/projects`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:** None

**Expected Response:**
```json
[
  {
    "_id": "69569889374060e0ff7c5421",
    "name": "My Project",
    "description": "Project description",
    "status": "active",
    "owner": "6957d776a06237e23de632b2",
    "__v": 0
  }
]
```

---

### 2. Create Project
**POST** `/api/projects`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "name": "My New Project",
  "description": "This is a new project description",
  "status": "active"
}
```

**Expected Response:**
```json
{
  "_id": "69569889374060e0ff7c5421",
  "name": "My New Project",
  "description": "This is a new project description",
  "status": "active",
  "owner": "6957d776a06237e23de632b2",
  "__v": 0
}
```

---

### 3. Update Project
**PATCH** `/api/projects/:id`

**Replace `:id` with the actual project ID**

**Example:** `PATCH /api/projects/69569889374060e0ff7c5421`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

**Expected Response:**
```json
{
  "_id": "69569889374060e0ff7c5421",
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed",
  "owner": "6957d776a06237e23de632b2",
  "__v": 0
}
```

---

### 4. Delete Project
**DELETE** `/api/projects/:id`

**Replace `:id` with the actual project ID**

**Example:** `DELETE /api/projects/69569889374060e0ff7c5421`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:** None

**Expected Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## ✅ Task Routes

**All task routes require authentication!** Add the token to the Authorization header.

### 1. Get Tasks by Project
**GET** `/api/tasks/project/:projectId`

**Replace `:projectId` with the actual project ID**

**Example:** `GET /api/tasks/project/69569889374060e0ff7c5421`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:** None

**Expected Response:**
```json
[
  {
    "_id": "6957d776a06237e23de632b2",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "projectId": "69569889374060e0ff7c5421",
    "__v": 0
  }
]
```

---

### 2. Create Task
**POST** `/api/tasks`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "title": "New Task",
  "description": "Task description here",
  "status": "todo",
  "projectId": "69569889374060e0ff7c5421"
}
```

**Expected Response:**
```json
{
  "_id": "6957d776a06237e23de632b2",
  "title": "New Task",
  "description": "Task description here",
  "status": "todo",
  "projectId": "69569889374060e0ff7c5421",
  "__v": 0
}
```

---

### 3. Update Task
**PATCH** `/api/tasks/:taskid`

**Replace `:taskid` with the actual task ID**

**Example:** `PATCH /api/tasks/6957d776a06237e23de632b2`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "inprogress"
}
```

**Note:** Don't include `projectId` in the update body - it will be ignored.

**Expected Response:**
```json
{
  "_id": "6957d776a06237e23de632b2",
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "inprogress",
  "projectId": "69569889374060e0ff7c5421",
  "__v": 0
}
```

---

### 4. Delete Task
**DELETE** `/api/tasks/:taskid`

**Replace `:taskid` with the actual task ID**

**Example:** `DELETE /api/tasks/6957d776a06237e23de632b2`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:** None

**Expected Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

## 🎯 Step-by-Step Testing Workflow

### Step 1: Start Your Server
```bash
npm run dev
```

Make sure you see: `Server is running on http://localhost:3000`

### Step 2: Register a User
1. Open Postman
2. Create a new request
3. Set method to **POST**
4. URL: `http://localhost:3000/api/auth/register`
5. Go to **Headers** tab, add:
   - Key: `Content-Type`, Value: `application/json`
6. Go to **Body** tab, select **raw** and **JSON**, paste:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "test123"
   }
   ```
7. Click **Send**
8. You should get a success message with `userId`

### Step 3: Login to Get Token
1. Create a new request
2. Method: **POST**
3. URL: `http://localhost:3000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```
6. Click **Send**
7. **COPY THE TOKEN** from the response!

### Step 4: Create a Project
1. Create a new request
2. Method: **POST**
3. URL: `http://localhost:3000/api/projects`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN_HERE` (paste your token)
5. Body (raw JSON):
   ```json
   {
     "name": "My First Project",
     "description": "This is my first project",
     "status": "active"
   }
   ```
6. Click **Send**
7. **COPY THE PROJECT ID** from the response!

### Step 5: Create a Task
1. Create a new request
2. Method: **POST**
3. URL: `http://localhost:3000/api/tasks`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN_HERE`
5. Body (raw JSON):
   ```json
   {
     "title": "My First Task",
     "description": "This is my first task",
     "status": "todo",
     "projectId": "PASTE_PROJECT_ID_HERE"
   }
   ```
6. Click **Send**
7. **COPY THE TASK ID** from the response!

### Step 6: Test Other Routes
- Get all projects: `GET /api/projects` (with token)
- Get tasks by project: `GET /api/tasks/project/PROJECT_ID` (with token)
- Update task: `PATCH /api/tasks/TASK_ID` (with token)
- Update project: `PATCH /api/projects/PROJECT_ID` (with token)
- Delete task: `DELETE /api/tasks/TASK_ID` (with token)
- Delete project: `DELETE /api/projects/PROJECT_ID` (with token)

---

## 🔧 Postman Tips

### Setting Up Environment Variables (Recommended)
1. Click the **Environments** icon (eye icon) in Postman
2. Click **+** to create a new environment
3. Name it "DevTracker Local"
4. Add variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, you'll set it after login)
5. In your requests, use: `{{base_url}}/api/auth/login`
6. After login, copy the token and set it in the environment variable
7. In protected routes, use: `Authorization: Bearer {{token}}`

### Quick Token Setup
After logging in, you can:
1. Copy the token from the response
2. In Postman, click the **Environments** icon
3. Set the `token` variable
4. All your requests will automatically use it!

---

## ❌ Common Errors

### 401 Unauthorized
- **Problem:** Missing or invalid token
- **Solution:** Make sure you:
  1. Logged in and got a token
  2. Added `Authorization: Bearer YOUR_TOKEN` header
  3. Token hasn't expired (tokens expire after 1 hour)

### 404 Not Found
- **Problem:** Wrong URL or ID doesn't exist
- **Solution:** Check:
  1. URL is correct (note: `/api/tasks` not `/api/task`)
  2. ID exists in database
  3. Server is running

### 400 Bad Request
- **Problem:** Missing required fields or validation error
- **Solution:** Check:
  1. All required fields are in the body
  2. Data types are correct (strings, not numbers)
  3. Email format is valid

### 500 Server Error
- **Problem:** Server-side error
- **Solution:** Check your server console for error messages

---

## 📝 Status Values

### Project Status:
- `active`
- `completed`
- `archived`

### Task Status:
- `todo`
- `inprogress`
- `done`

---

Happy Testing! 🎉






