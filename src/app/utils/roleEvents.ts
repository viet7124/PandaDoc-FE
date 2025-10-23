/**
 * Custom event utilities for role changes
 * Helps components react to user role updates (e.g., becoming a seller)
 */

export const ROLE_CHANGE_EVENT = 'userRoleChanged';

/**
 * Dispatch a custom event when user roles change
 * This allows components to react to role changes without full page reload
 */
export const dispatchRoleChangeEvent = (): void => {
  const event = new CustomEvent(ROLE_CHANGE_EVENT);
  window.dispatchEvent(event);
};

/**
 * Add listener for role change events
 * @param callback - Function to call when roles change
 * @returns Cleanup function to remove the listener
 */
export const addRoleChangeListener = (callback: () => void): (() => void) => {
  window.addEventListener(ROLE_CHANGE_EVENT, callback);
  
  return () => {
    window.removeEventListener(ROLE_CHANGE_EVENT, callback);
  };
};

