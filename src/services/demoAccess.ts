import { useState, useEffect } from 'react';

// Function to validate access code format
const isValidAccessCode = (code: string): boolean => {
  // Code should be 9 characters long and match our format (e.g., 20tusn242)
  return /^[0-9]{2}[a-z]{4}[0-9]{3}$/.test(code);
};

// Custom hook for demo access management
export const useDemoAccess = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user was previously authorized
    const storedAuth = localStorage.getItem('demoAccessAuthorized');
    if (storedAuth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const validateAccessCode = async (code: string): Promise<boolean> => {
    if (!isValidAccessCode(code)) {
      throw new Error('Invalid code format');
    }

    // Get the valid codes from environment variables
    const validCodes = process.env.VITE_DEMO_ACCESS_CODES?.split(',') || [];
    
    if (validCodes.includes(code)) {
      localStorage.setItem('demoAccessAuthorized', 'true');
      setIsAuthorized(true);
      return true;
    }
    
    return false;
  };

  const clearAccess = () => {
    localStorage.removeItem('demoAccessAuthorized');
    setIsAuthorized(false);
  };

  return {
    isAuthorized,
    validateAccessCode,
    clearAccess
  };
};

// Function to generate new valid access codes
export const generateAccessCodes = (count: number = 100): string[] => {
  const codes: string[] = [];
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  
  while (codes.length < count) {
    const numbers1 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const letters = Array(4).fill(null)
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
    const numbers2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const code = `${numbers1}${letters}${numbers2}`;
    if (!codes.includes(code)) {
      codes.push(code);
    }
  }
  
  return codes;
};

// For development/testing purposes
if (import.meta.env.DEV) {
  console.log('Generated demo codes for development:', generateAccessCodes(5));
} 