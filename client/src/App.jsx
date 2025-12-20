import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import CourseCatalog from './pages/dashboard/CourseCatalog';
import MyLearning from './pages/dashboard/MyLearning';
import Classroom from './pages/dashboard/Classroom';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
           {/* This is the default view (My Courses) */}
           <Route index element={<MyLearning />} /> 
           <Route path="courses" element={<CourseCatalog />} />
           <Route path="classroom/:courseId" element={<Classroom />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;