import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">1.1. Information You Provide:</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Account Registration:</strong> Email address, name, username, and encrypted password.</li>
                <li><strong>Seller Information:</strong> Business or personal name and encrypted bank account number for payouts.</li>
                <li><strong>Google Login:</strong> We collect your name, email, and profile picture as permitted by Google. We do not access your Gmail, Drive, or other personal data.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">1.2. Information Collected Automatically:</h3>
              <p className="mb-6">We automatically log your IP address, browser type, and access times for security and analytics purposes.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.1. To Operate the Service:</h3>
              <p className="mb-4">To create and manage accounts, process transactions, facilitate payments to Sellers, and send order confirmations.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.2. To Improve the Service:</h3>
              <p className="mb-4">To analyze usage trends, identify popular templates, diagnose technical issues, and prevent fraud.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.3. Our Commitment:</h3>
              <p className="mb-6">We will <strong>never</strong> sell or rent your personal data to third parties for marketing purposes.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Share Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1. Payment Processor:</h3>
              <p className="mb-4">We share your name, email, and transaction amount to process payments. We do not store or have access to your full credit card details.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2. Infrastructure Providers:</h3>
              <p className="mb-4">Your data is stored on secure servers managed by our trusted partners, who are bound by strict data protection agreements.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3. Legal Compliance:</h3>
              <p className="mb-6">We may disclose your information if required by law or a competent legal authority in Vietnam.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">4.1. Encryption:</h3>
              <p className="mb-4">We use HTTPS (SSL/TLS) for all data transmission. Passwords and bank account numbers are encrypted in our database.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">4.2. Access Control:</h3>
              <p className="mb-4">Access to personal data is restricted to authorized personnel on a need-to-know basis for performing their duties.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">4.3. Your Role:</h3>
              <p className="mb-6">You are responsible for using a strong password and protecting your account from unauthorized access.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Data Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">5.1. Access and Correction:</h3>
              <p className="mb-4">You can view and edit your personal information in your account settings.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">5.2. Deletion:</h3>
              <p className="mb-4">You have the right to delete your account at any time. Your data will be permanently erased from our systems within 30 days.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">5.3. Data Portability:</h3>
              <p className="mb-6">You may request a copy of your data by emailing <a href="mailto:PandaDocs6204@gmail.com" className="text-green-600 hover:text-green-700 underline">PandaDocs6204@gmail.com</a>.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Children Under 16</h2>
              <p className="mb-6">Our service is not intended for children under the age of 16. We will immediately delete any account found to be in violation of this policy.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Changes to This Policy</h2>
              <p className="mb-6">We will notify you of any significant changes to this policy via email or an on-platform notification at least 30 days before they take effect.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Us</h2>
              <p className="mb-6">
                Email: <a href="mailto:PandaDocs6204@gmail.com" className="text-green-600 hover:text-green-700 underline">PandaDocs6204@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
