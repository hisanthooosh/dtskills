import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
