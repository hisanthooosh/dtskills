import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children, allowedRole }) {
  const admin = JSON.parse(localStorage.getItem('admin'));
  const token = localStorage.getItem('adminToken');

  if (!admin || !token) {
    return <Navigate to="/admin-login" replace />;
  }

  // Allow single role OR array of roles
  if (Array.isArray(allowedRole)) {
    if (!allowedRole.includes(admin.role)) {
      return <Navigate to="/admin-login" replace />;
    }
  } else {
    if (admin.role !== allowedRole) {
      return <Navigate to="/admin-login" replace />;
    }
  }

  return children;
}
