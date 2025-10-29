import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { dispatchRoleChangeEvent } from '../../utils/roleEvents';
import { setAuthData, type UserData } from '../../utils/authUtils';

export default function OAuth2Redirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuth2Callback = () => {
      try {
        setLoading(true);
        
        console.log('🔍 OAuth2Redirect component loaded');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 All search params:', Object.fromEntries(searchParams.entries()));
        
        // Get the token and user info from URL parameters (sent by backend)
        const token = searchParams.get('token');
        const userId = searchParams.get('id');
        const username = searchParams.get('username');
        const email = searchParams.get('email');
        const roles = searchParams.get('roles');

        console.log('🔍 OAuth2 callback received:', { token, userId, username, email, roles });
        
        // Debug: Log current localStorage state
        console.log('Current localStorage state:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user'),
          userRoles: localStorage.getItem('userRoles')
        });

        // Check if we already processed this token (prevent loop)
        const existingToken = localStorage.getItem('token');
        if (existingToken && existingToken === token) {
          console.log('Token already processed, redirecting to home to prevent loop');
          navigate('/home');
          return;
        }

        if (!token) {
          console.error('No token received from backend');
          console.log('Available URL parameters:', {
            token: searchParams.get('token'),
            id: searchParams.get('id'),
            username: searchParams.get('username'),
            email: searchParams.get('email'),
            roles: searchParams.get('roles'),
            code: searchParams.get('code'),
            state: searchParams.get('state'),
            error: searchParams.get('error')
          });
          toast.error('Login Failed', 'No authentication token received');
          navigate('/login');
          return;
        }

        // Handle roles - provide default if not available
        const userRoles = roles ? JSON.parse(roles) : ['ROLE_USER'];
        
        // Create user data with all required fields
        const userData: UserData = {
          id: userId ? parseInt(userId) : 1, // Default to 1 if no ID provided
          username: username || 'Google User',
          email: email || '',
          roles: userRoles
        };
        
        // Store authentication data using utility function (remember by default for OAuth2)
        setAuthData(token, userData, userRoles, true);

        // Debug: Log final localStorage state
        console.log('Final localStorage state after OAuth2:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user'),
          userRoles: localStorage.getItem('userRoles')
        });

        // Notify components about role change
        dispatchRoleChangeEvent();

        const roleLabel: string = userRoles.includes('ROLE_ADMIN')
          ? 'Admin'
          : userRoles.includes('ROLE_SELLER')
            ? 'Seller'
            : 'User';
        const title: string = `Welcome back, ${userData.username}!`;
        const message: string = userRoles.includes('ROLE_ADMIN')
          ? 'You are signed in as Admin. Use the Admin menu to manage the platform.'
          : userRoles.includes('ROLE_SELLER')
            ? 'You are signed in as Seller. Visit your Profile to manage your store.'
            : 'You are signed in. Explore top templates or continue where you left off.';
        toast.success(title, `${message} (${roleLabel})`, 7000);
        
        // Clear URL parameters to prevent loop
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect to appropriate page based on user role
        if (userRoles.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else if (userRoles.includes('ROLE_SELLER')) {
          navigate('/home');
        } else {
          navigate('/home');
        }

      } catch (error) {
        console.error('OAuth2 callback error:', error);
        toast.error('Login Failed', 'An error occurred during authentication. Please try again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleOAuth2Callback();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Login</h2>
          <p className="text-gray-600">Please wait while we complete your Google authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
