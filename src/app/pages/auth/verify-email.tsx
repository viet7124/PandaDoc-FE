import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { verifyEmail } from './services/authAPI';
import { useToast } from '../../contexts/ToastContext';

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const { success, error } = useToast();
  const query = useQuery();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'awaiting'>('idle');
  const [email, setEmail] = useState<string>('');
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const token = query.get('token');
    const emailParam = query.get('email') || '';
    
    if (!token) {
      // No token means we are on the "Check your inbox" screen after registration
      setEmail(emailParam);
      setStatus('awaiting');
      return;
    }

    // Prevent multiple verification attempts
    if (hasAttempted) {
      return;
    }

    const verify = async () => {
      try {
        setHasAttempted(true);
        setStatus('verifying');
        await verifyEmail(token);
        setStatus('success');
        success('Email verified', 'Your email has been successfully verified.');
      } catch (e) {
        setStatus('error');
        const message = e instanceof Error ? e.message : 'Verification failed. The link may be invalid or expired.';
        error('Verification failed', message);
      }
    };
    verify();
  }, [query, success, error, hasAttempted]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        {status === 'awaiting' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
            <p className="text-gray-700">We have sent a confirmation link to{email ? ` ${email}` : ' your email'}.</p>
            <p className="text-gray-500 mt-2">Please check your inbox and click the link to activate your account.</p>
          </>
        )}
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <p className="text-green-700">Your email has been verified. You may close this window.</p>
        )}
        {status === 'error' && (
          <div>
            <p className="text-red-600">Verification failed. The link may be invalid or expired.</p>
            <p className="text-gray-600 mt-2">Please register again to receive a new verification email.</p>
            <button 
              onClick={() => window.location.href = '/register'}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


