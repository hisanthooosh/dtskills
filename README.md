
# 🎓 dtskills - Real-Time Learning Management System

**dtskills** is a full-stack MERN (MongoDB, Express, React, Node.js) EdTech platform designed to help colleges bridge the gap between academic curriculum and industry-ready digital skills. It features a robust Admin Dashboard for managing content and a seamless Student Classroom experience.


## 🚀 Features

### 👨‍💼 For Admins (Colleges & Instructors)
* **Comprehensive Dashboard:** View real-time analytics on student enrollment, revenue, and active courses.
* **Advanced Course Builder:** * Create courses with Modules and Topics.
    * **Draft & Publish System:** Save courses as drafts and publish only when ready.
    * **Quiz Builder:** Integrated quiz creation within topics.
    * **Preview Mode:** See exactly what students will see before publishing.
* **College & Batch Management:**
    * Register partner colleges.
    * **Auto-Generate Roll Numbers:** Create student batches automatically based on start/end roll number ranges.
* **Student Management:** Track student progress and payment status.

### 👨‍🎓 For Students
* **Modern Classroom Interface:** A distraction-free learning environment.
* **Structured Learning Flow:** * **Step 1:** Read Lecture Notes (with embedded resources).
    * **Step 2:** Take Quizzes to test knowledge.
* **My Learning:** Track enrolled courses and completion status.
* **Progress Tracking:** Visual progress bars and "Mark as Complete" functionality.

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite) - Fast and modern UI library.
* **Tailwind CSS** - For responsive and beautiful styling.
* **Lucide React** - Modern, crisp icons.
* **Axios** - For API communication.

### Backend
* **Node.js & Express.js** - Robust REST API architecture.
* **MongoDB & Mongoose** - Flexible NoSQL database for courses and users.
* **JWT (JSON Web Tokens)** - Secure authentication.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas URL)

### 2. Clone the Repository
```bash
git clone [https://github.com/yourusername/dtskills.git](https://github.com/yourusername/dtskills.git)
cd dtskills

```

### 3. Backend Setup (Server)

Navigate to the server folder and install dependencies.

```bash
cd server
npm install

```

**Configuration:**
Create a `.env` file in the `server` folder with the following credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dtskills
JWT_SECRET=your_super_secret_key_123
ADMIN_SECRET=doneswari_admin_2025

```

**Run the Server:**

```bash
npm run dev
# Server should be running on http://localhost:5000

```

### 4. Frontend Setup (Client)

Open a new terminal, navigate to the client folder, and install dependencies.

```bash
cd client
npm install

```

**Run the Client:**

```bash
npm run dev
# Frontend should be running on http://localhost:5173

```

---

## 📖 Usage Guide

### Logging In

* **Students:** Use the registration page to create an account or login.
* **Admin Access:** Access the admin dashboard via the specific route (e.g., `/admin`) or by using the configured Admin Secret.

### Creating a Course (Admin)

1. Go to **"Create New"** in the Admin Dashboard.
2. Fill in the Course Title, Description, and Price.
3. Add **Modules** (e.g., "Introduction", "Advanced Concepts").
4. Add **Topics** inside modules with Notes and Quiz questions.
5. Click **"Save Draft"** to save your work without showing it to students.
6. When ready, click **"Publish Course Live"**.

---

## 📂 Project Structure

```
dtskills/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Classroom, Login pages
│   │   ├── components/     # Reusable UI components
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Models (User, Course, College)
│   ├── routes/             # API Routes
│   ├── controllers/        # Logic for routes
│   └── ...

```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

## 📄 License

This project is licensed under the MIT License.

```

```
