import React from 'react';
import { getAuthState, clearAuthData } from '../utils/authUtils';

export const AuthDebugger: React.FC = () => {
  const authState = getAuthState();

  const handleClearAuth = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Auth Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Token:</span>{' '}
          <span className={authState.token ? 'text-green-600' : 'text-red-600'}>
            {authState.token ? `${authState.token.substring(0, 20)}...` : 'None'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">User:</span>{' '}
          <span className={authState.user ? 'text-green-600' : 'text-red-600'}>
            {authState.user?.username || 'None'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Roles:</span>{' '}
          <span className={authState.roles.length > 0 ? 'text-green-600' : 'text-red-600'}>
            {authState.roles.join(', ') || 'None'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Authenticated:</span>{' '}
          <span className={authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {authState.isAuthenticated ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleClearAuth}
        className="mt-3 w-full bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600"
      >
        Clear Auth Data
      </button>
    </div>
  );
};
