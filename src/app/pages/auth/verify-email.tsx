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
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  useEffect(() => {
    const run = async () => {
      const token = query.get('token');
      if (!token) {
        setStatus('error');
        error('Invalid link', 'Verification token is missing.');
        return;
      }
      try {
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
    run();
  }, [query, success, error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
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
          <p className="text-red-600">Verification failed. The link may be invalid or expired.</p>
        )}
      </div>
    </div>
  );
}


