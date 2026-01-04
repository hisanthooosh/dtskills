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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* This directs /dashboard to My Learning automatically */}
          <Route index element={<MyLearning />} />

          {/* This matches the Sidebar Link: /dashboard/my-learning */}
          <Route path="my-learning" element={<MyLearning />} />

          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --- 👇 FIX: SUPPORT BOTH LOWERCASE AND UPPERCASE PATHS 👇 --- */}
        <Route path="/classroom/:id" element={<Classroom />} />
        <Route path="/Classroom/:id" element={<Classroom />} />
        <Route path="/hod-login" element={<HodLogin />} />
        <Route path="/hod-dashboard" element={<HodDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;