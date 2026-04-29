# Coding Platform JKLU

A comprehensive coding platform and Learning Management System (LMS) built with the MERN stack. Designed specifically for educational institutions to manage programming classes, host coding contests, conduct labs, and foster competitive programming skills among students.

## 🚀 Features

### For Students
- **Interactive Code Editor:** Integrated Monaco Editor with multi-language support to write, run, and submit code directly from the browser.
- **Contests & Labs:** Participate in active coding contests and lab assignments.
- **Leaderboard & Rankings:** Real-time leaderboards to track performance during contests.
- **Gamification:** Earn badges and track your problem-solving statistics (e.g., solved problems, streaks).
- **Dynamic Profile:** View comprehensive insights into your past submissions, current ranking, and points.
- **Notifications:** Receive email and SMS alerts (via Nodemailer & Twilio) for upcoming contests or important updates.

### For Teaching Assistants (TAs) & Instructors
- **Dashboard:** Specialized TA dashboard to manage classes and labs.
- **Contest Management:** Create, update, and manage coding contests.
- **Performance Tracking:** Access final leaderboards for completed contests and export reports in CSV or PDF formats.
- **Problem Bank:** Manage the repository of coding problems, including test cases and constraints.

## 🛠️ Technology Stack

**Frontend:**
- **React.js** (v18)
- **Vite** for fast, optimized builds
- **Tailwind CSS** (v4) for responsive, utility-first styling
- **React Router** for navigation
- **React Hook Form** for robust form handling
- **Monaco Editor** (`@monaco-editor/react`) for the in-browser code editor
- **Axios** for API communication

**Backend:**
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** for data modeling
- **JWT (JSON Web Tokens)** & **Bcrypt** for secure authentication and authorization
- **Node-Cron** for scheduling automated tasks (e.g., ending contests automatically)
- **Nodemailer** & **Twilio** for email and SMS notifications

## 📁 Project Structure

```text
coding_platform_jklu/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/                # React components, pages, context, and styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
└── server/                 # Express Backend
    ├── code-editor/        # Code execution engine integration
    ├── controllers/        # Request handlers (logic)
    ├── database/           # MongoDB connection setup
    ├── middlewares/        # Custom middlewares (auth, error handling)
    ├── models/             # Mongoose schemas (User, Problem, Contest, Submission, etc.)
    ├── routes/             # API endpoints definitions
    ├── utils/              # Helper functions and utilities
    ├── automation/         # Automated scripts (e.g., chron jobs)
    ├── app.js              # Express app configuration
    ├── server.js           # Entry point for backend server
    └── package.json        # Backend dependencies
```

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

## 🚀 Installation & Local Setup

**1. Clone the repository:**
```bash
git clone https://github.com/Aman018-gif/coding_platform_jklu.git
cd coding_platform_jklu
```

**2. Setup Backend:**
```bash
cd server
npm install
```

**3. Setup Frontend:**
```bash
cd ../client
npm install
```

## 🔑 Environment Variables

To run this project locally, you will need to set up environment variables in your backend. Create a `.env` or `config.env` file in the `server` directory and configure the following keys:

```env
# Server Configuration
PORT=4000

# Database Connection
DATABASE_URI=<your_mongodb_connection_string>

# Authentication
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Services (Nodemailer)
EMAIL_USERNAME=<your_email>
EMAIL_PASSWORD=<your_email_password>
EMAIL_HOST=<smtp_host>
EMAIL_PORT=<smtp_port>

```
*(Note: Create a similar `.env` file in the `client` directory if the frontend requires specific VITE_ variables like `VITE_API_URL`)*

## 🏃 Running the Application

You need to start both the server and the client in separate terminal windows.

**Start the Backend Server:**
```bash
cd server
npm run dev
```
*(Runs on `http://localhost:5000` by default)*

**Start the Frontend Client:**
```bash
cd client
npm run dev
```
*(Runs on `http://localhost:5173` by default)*

