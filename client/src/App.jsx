import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Dashboard Components
import DashboardLayout from './pages/dashboard/DashboardLayout';
import MyLearning from './pages/dashboard/MyLearning';
import CourseCatalog from './pages/dashboard/CourseCatalog';
import Classroom from './pages/dashboard/Classroom';
import Profile from './pages/dashboard/Profile';
import HodLogin from './pages/hod/HodLogin';
import HodDashboard from './pages/hod/HodDashboard';


import AdminProtectedRoute from './routes/AdminProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminCourses from './pages/AdminCourses';




function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyLearning />} />
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Classroom */}
        <Route path="/classroom/:id" element={<Classroom />} />

        {/* HOD */}
        <Route path="/hod-login" element={<HodLogin />} />
        <Route path="/hod-dashboard" element={<HodDashboard />} />

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute allowedRole="super_admin">
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <AdminProtectedRoute allowedRole="course_admin">
              <AdminCourses />
            </AdminProtectedRoute>
          }
        />

      </Routes>

    </Router>
  );
}

export default App;