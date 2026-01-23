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

import AdminManageAdmins from './pages/AdminManageAdmins';
import SubmitAicteId from './pages/SubmitAicteId';
import VerifyCertificate from './pages/VerifyCertificate';

import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import Contact from './pages/Contact';




function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT DASHBOARD */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyLearning />} />
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* CLASSROOM */}
        <Route path="/classroom/:id" element={<Classroom />} />
        <Route
          path="/submit-aicte/:courseId"
          element={<SubmitAicteId />}
        />


        {/* HOD */}
        <Route path="/hod-login" element={<HodLogin />} />
        <Route path="/hod-dashboard" element={<HodDashboard />} />

        {/* ADMIN LOGIN (CRITICAL FIX) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* SUPER ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute allowedRole={['super_admin', 'course_admin']}>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-admins"
          element={
            <AdminProtectedRoute allowedRole="super_admin">
              <AdminManageAdmins />
            </AdminProtectedRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<Contact />} />


        {/* COURSE ADMIN */}
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />


      </Routes>
    </Router>
  );
}

export default App;
