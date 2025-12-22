import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import MyLearning from './pages/dashboard/MyLearning';
import CourseCatalog from './pages/dashboard/CourseCatalog';
import Classroom from './pages/dashboard/Classroom';
import Profile from './pages/dashboard/Profile'; // Make sure this file exists!

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* This renders MyLearning when you visit /dashboard */}
          <Route index element={<Navigate to="/dashboard/my-learning" replace />} />
          
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="profile" element={<Profile />} />
          <Route path="classroom/:courseId" element={<Classroom />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;