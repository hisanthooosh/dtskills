import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children, allowedRole }) {
  const admin = JSON.parse(localStorage.getItem('admin'));

  // 1️⃣ Not logged in → kick out
  if (!admin) {
    return <Navigate to="/admin-login" />;
  }

  // 2️⃣ Logged in but wrong role → kick out
  if (allowedRole && admin.role !== allowedRole) {
    return <Navigate to="/admin-login" />;
  }

  // 3️⃣ Allowed → show page
  return children;
}
