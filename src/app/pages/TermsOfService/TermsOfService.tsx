import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Definitions</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>"PandaDocs"</strong> (or "we", "us"): Refers to the PandaDocs platform.</li>
                <li><strong>"User":</strong> Any individual who creates an account on the platform, including Buyers and Sellers.</li>
                <li><strong>"Buyer":</strong> A User who purchases a license to use a Template from PandaDocs.</li>
                <li><strong>"Seller":</strong> A User who submits original Templates to PandaDocs for the purpose of selling the intellectual property rights to PandaDocs.</li>
                <li><strong>"Template":</strong> A digital product offered for sale on the PandaDocs platform.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Terms for Sellers (Content Suppliers)</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.1. Submission Process:</h3>
              <p className="mb-4">Sellers may submit their original Templates for review by the PandaDocs administration. By submitting a Template, you warrant that you are the sole creator and owner of the content and that it does not infringe on any third-party rights.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.2. Review and Acquisition:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The PandaDocs team will review each submitted Template for quality, relevance, and originality.</li>
                <li>If the Template is approved, PandaDocs will move it to a "Payout" status, indicating our intent to purchase it.</li>
                <li>PandaDocs determines a one-time purchase price (the "Buyout Fee") for each approved Template.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.3. Payment:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Upon approval, PandaDocs will process the Buyout Fee payment to the Seller via manual bank transfer within 7-14 business days.</li>
                <li>The Seller will be notified through the platform once the payment has been completed.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">2.4. Irrevocable Transfer of Intellectual Property (CRITICAL):</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Upon successful payment of the Buyout Fee, the Seller agrees to permanently and irrevocably transfer all ownership and intellectual property rights of the Template to PandaDocs.</strong></li>
                  <li>This transfer grants PandaDocs the exclusive, worldwide, perpetual right to edit, modify, rebrand, resell, and otherwise use the Template for any commercial purpose without any further compensation, credit, or attribution to the Seller.</li>
                  <li>After the transaction is complete, the Seller retains no rights, ownership, or claims over the submitted Template. The Template becomes the sole property of PandaDocs.</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Terms for Buyers</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1. Purchase of License:</h3>
              <p className="mb-4">When you purchase a Template, you are buying it directly from PandaDocs. You are granted a license to use the Template under the terms outlined below.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2. Permitted Uses:</h3>
              <p className="mb-4">You may use the purchased Template for personal and commercial projects, and modify it as needed.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3. Prohibited Uses:</h3>
              <p className="mb-4">You may <strong>not</strong>: (a) resell or redistribute the original Template file; (b) share the file with others; or (c) claim authorship of the original design.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">3.4. Refund Policy:</h3>
              <p className="mb-6">A full refund may be requested within 7 days of purchase only if the file is technically faulty, corrupted, or significantly different from its description. Refunds are not provided for "change of mind."</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Intellectual Property Ownership</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">4.1. Platform IP:</h3>
              <p className="mb-4">The PandaDocs logo, brand, website code, and design are the exclusive property of PandaDocs.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">4.2. Template IP:</h3>
              <p className="mb-6"><strong>All Templates available for sale on the platform are the exclusive property of PandaDocs</strong>, having been acquired through a full rights transfer from their original creators.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Disclaimer of Liability</h2>
              <p className="mb-6">PandaDocs provides the service on an "as-is" basis. Our maximum liability to you shall not exceed the total amount you have paid to us in the preceding 12 months.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Governing Law and Dispute Resolution</h2>
              <p className="mb-6">These Terms are governed by the laws of Vietnam. Any disputes shall first be addressed through good-faith negotiation by contacting <a href="mailto:PandaDocs6204@gmail.com" className="text-green-600 hover:text-green-700 underline">PandaDocs6204@gmail.com</a>.</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Contact Information</h2>
              <p className="mb-6">
                <strong>General Support:</strong> <a href="mailto:PandaDocs6204@gmail.com" className="text-green-600 hover:text-green-700 underline">PandaDocs6204@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
