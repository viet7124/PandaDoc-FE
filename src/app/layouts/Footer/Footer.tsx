import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { getAuthState } from '../../utils/authUtils';
import { submitSuggestion } from '../../services/supportAPI';

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleOpen = () => {
    const { isAuthenticated } = getAuthState();
    if (!isAuthenticated) {
      toast.error('Sign in required', 'Please sign in to contact PandaDocs support.');
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const subject = String(formData.get('subject') || '');
    const message = String(formData.get('message') || '');

    if (!message.trim()) {
      toast.error('Message required', 'Please enter a message before sending.');
      return;
    }

    const finalMessage = subject.trim()
      ? `${subject.trim()}\n\n${message.trim()}`
      : message.trim();

    try {
      setIsSubmitting(true);
      await submitSuggestion(finalMessage);
      toast.success('Message sent', 'Thanks for contacting PandaDocs! Our team will follow up soon.');
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error('Error submitting support request:', err);
      toast.error('Submission failed', 'Unable to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#2C373B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="font-krub text-2xl lg:text-3xl font-bold mb-4">
              PandaDocs
            </h3>
            <p className="font-krub text-xl lg:text-2xl font-bold mb-8">
              Professional study template for Vietnamese students
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">About</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="font-krub text-xl hover:text-green-400 transition-colors">About us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><button onClick={handleOpen} className="font-krub text-left text-xl hover:text-green-400 transition-colors">Contact</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="font-krub text-xl hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="font-krub text-xl hover:text-green-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white mt-16 pt-8">
          <p className="font-krub text-lg lg:text-xl font-bold text-center">
            © 2025 PandaDocs. All rights reserved.
          </p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Contact PandaDocs</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input name="name" type="text" required placeholder="Enter your name" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-500 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
                <input name="email" type="email" required placeholder="name@example.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-500 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input name="subject" type="text" required placeholder="How can we help?" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-500 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" rows={6} required placeholder="Write your message here..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-500 text-black min-h-[140px]" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
