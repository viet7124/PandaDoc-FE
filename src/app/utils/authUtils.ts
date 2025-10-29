// Authentication utility functions

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  token: string | null;
  user: UserData | null;
  roles: string[];
  isAuthenticated: boolean;
}

/**
 * Get current authentication state from localStorage
 */
export const getAuthState = (): AuthState => {
  // Prefer sessionStorage (non-remembered logins) first, then fallback to localStorage
  const token = sessionStorage.getItem('token') ?? localStorage.getItem('token');
  const userString = sessionStorage.getItem('user') ?? localStorage.getItem('user');
  const rolesString = sessionStorage.getItem('userRoles') ?? localStorage.getItem('userRoles');
  
  let user: UserData | null = null;
  let roles: string[] = [];
  
  try {
    user = userString ? JSON.parse(userString) : null;
    roles = rolesString ? JSON.parse(rolesString) : [];
  } catch (error) {
    console.error('Error parsing auth data from localStorage:', error);
  }
  
  return {
    token,
    user,
    roles,
    isAuthenticated: !!token && !!user
  };
};

/**
 * Set authentication data in localStorage
 */
export const setAuthData = (token: string, user: UserData, roles: string[], remember: boolean = true): void => {
  // Choose storage based on remember flag
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  // Clear previous data from the other storage to avoid ambiguity
  otherStorage.removeItem('token');
  otherStorage.removeItem('user');
  otherStorage.removeItem('userRoles');
  otherStorage.removeItem('username');
  otherStorage.removeItem('email');

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
  storage.setItem('userRoles', JSON.stringify(roles));
  storage.setItem('username', user.username);
  storage.setItem('email', user.email);
  
  console.log('✅ Auth data stored:', { 
    token: token.substring(0, 20) + '...', 
    username: user.username, 
    roles 
  });
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userRoles');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('email');
  
  console.log('✅ Auth data cleared');
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const { roles } = getAuthState();
  return roles.includes(role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (allowedRoles: string[]): boolean => {
  const { roles } = getAuthState();
  return allowedRoles.some(role => roles.includes(role));
};

// Password policy validation
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` };
  }
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecial) {
    const missing: string[] = [];
    if (!hasUppercase) missing.push('an uppercase letter');
    if (!hasLowercase) missing.push('a lowercase letter');
    if (!hasDigit) missing.push('a number');
    if (!hasSpecial) missing.push('a special character');
    return { valid: false, error: `Password must include ${missing.join(', ')}` };
  }

  return { valid: true };
};

/**
 * Validate JWT token format and expiration
 */
export const validateToken = (token: string): boolean => {
  try {
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: not a valid JWT');
      return false;
    }
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      console.error('Token has expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get authorization headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const { token } = getAuthState();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  if (!validateToken(token)) {
    clearAuthData();
    throw new Error('Invalid or expired token');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};
