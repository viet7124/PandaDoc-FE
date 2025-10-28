import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from './services/authAPI';
import { useToast } from '../../contexts/ToastContext';

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const query = useQuery();

  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  useEffect(() => {
    const t = query.get('token') || '';
    setToken(t);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      error('Invalid link', 'This reset link is invalid or expired.');
      return;
    }
    if (!password || password !== confirmPassword) {
      error('Password mismatch', 'Please confirm your new password correctly.');
      return;
    }
    try {
      setIsSubmitting(true);
      await resetPassword(token, password);
      setDone(true);
      success('Password updated', 'You can now sign in with your new password.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Link is invalid or expired. Please try again.';
      error('Reset failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Updating…' : 'Update'}
          </button>
        </form>

        {done && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            Password updated successfully.
            <button
              className="ml-2 text-green-700 underline"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


