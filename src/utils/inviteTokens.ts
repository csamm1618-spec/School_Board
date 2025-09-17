// Utility functions for generating and validating invite tokens

export const generateInviteToken = (): string => {
  // Generate a secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateInviteToken = (token: string): boolean => {
  // Basic validation - token should be 64 characters (32 bytes * 2 hex chars)
  return typeof token === 'string' && token.length === 64 && /^[a-f0-9]+$/.test(token);
};

export const createInviteLink = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite/${token}`;
};
