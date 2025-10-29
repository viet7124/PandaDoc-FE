import React, { useState } from 'react';
import { login } from '../pages/auth/services/authAPI';

export const LoginTester: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setTestResult('Testing login...');
    
    try {
      // Test with admin credentials
      const response = await login('admin_user', 'admin123');
      
      setTestResult(`
🔐 LOGIN TEST RESULTS:
====================
Response Type: ${typeof response}
Response Keys: ${Object.keys(response).join(', ')}

Full Response:
${JSON.stringify(response, null, 2)}

Token Found: ${response.token ? 'YES' : 'NO'}
Token Value: ${response.token ? response.token.substring(0, 50) + '...' : 'null'}

User ID: ${response.id || 'null'}
Username: ${response.username || 'null'}
Email: ${response.email || 'null'}
Roles: ${response.roles ? JSON.stringify(response.roles) : 'null'}
      `);
      
    } catch (error: any) {
      setTestResult(`
❌ LOGIN TEST FAILED:
===================
Error: ${error.message}
Response: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data'}
Status: ${error.response?.status || 'No status'}
      `);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-2">Login API Tester</h3>
      
      <button
        onClick={testLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 mb-3"
      >
        {loading ? 'Testing...' : 'Test Login API'}
      </button>
      
      <div className="text-xs bg-gray-100 p-2 rounded font-mono whitespace-pre-wrap">
        {testResult || 'Click "Test Login API" to see results'}
      </div>
    </div>
  );
};
