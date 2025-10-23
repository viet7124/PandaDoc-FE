import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userRolesString = localStorage.getItem('userRoles');
  
  // Parse user roles from localStorage
  let userRoles: string[] = [];
  try {
    userRoles = userRolesString ? JSON.parse(userRolesString) : [];
  } catch (error) {
    console.error('Error parsing user roles:', error);
    userRoles = [];
  }

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

  // Authenticated but wrong role
  if (!hasAllowedRole) {
    // If admin trying to access user pages, redirect to admin
    if (userRoles.includes('ROLE_ADMIN')) {
      return <Navigate to="/admin" replace />;
    }
    // If user trying to access admin pages, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

