import { useState } from 'react';
import { requestPasswordReset } from './services/authAPI';
import { useToast } from '../../contexts/ToastContext';

export default function ForgotPassword() {
  const { success, error } = useToast();
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Invalid email', 'Please enter your email address');
      return;
    }
    try {
      setIsSubmitting(true);
      await requestPasswordReset(email.trim());
      setSubmitted(true);
      success('Request sent', 'If your email exists, you will receive a reset link.');
    } catch {
      // Backend always returns success per spec; still show generic success
      setSubmitted(true);
      success('Request sent', 'If your email exists, you will receive a reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Sending…' : 'Send'}
          </button>
        </form>

        {submitted && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium mb-2">Request submitted successfully!</p>
                <p className="mb-2">If the email exists, you will receive instructions shortly. This may take a few minutes.</p>
                <p className="text-green-600 font-medium">
                  💡 Don't see the email? Please check your spam/junk folder.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


