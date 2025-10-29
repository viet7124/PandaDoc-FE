import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

export default function Footer() {
  const [open, setOpen] = useState(false);
  const { error, success } = useToast();
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

  const handleOpen = () => {
    if (!contactEmail) {
      error('Contact unavailable', 'Contact email is not configured. Please set VITE_CONTACT_EMAIL.');
      return;
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '');
    const emailAddr = String(formData.get('email') || '');
    const subject = String(formData.get('subject') || '');
    const message = String(formData.get('message') || '');

    if (!contactEmail) {
      error('Contact unavailable', 'Contact email is not configured.');
      return;
    }

    const mailto = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent('[Contact] ' + subject)}&body=${encodeURIComponent(`From: ${name} <${emailAddr}>\n\n${message}`)}`;
    window.location.href = mailto;
    success('Opening email app', 'Your default mail app will compose this message.');
    setOpen(false);
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input name="name" type="text" required className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
                <input name="email" type="email" required className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input name="subject" type="text" required className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" rows={5} required className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
