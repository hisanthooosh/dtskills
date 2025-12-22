import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import MyLearning from './pages/dashboard/MyLearning';
import CourseCatalog from './pages/dashboard/CourseCatalog';
import Classroom from './pages/dashboard/Classroom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- DASHBOARD ROUTES --- */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* This 'index' means: Show MyLearning when URL is exactly /dashboard */}
          <Route index element={<MyLearning />} />
          
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="classroom/:courseId" element={<Classroom />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;