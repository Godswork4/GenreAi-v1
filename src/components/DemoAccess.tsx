import React, { useState } from 'react';
import { useDemoAccess } from '../services/demoAccess';

interface DemoAccessProps {
  onAccessGranted: () => void;
}

export const DemoAccess: React.FC<DemoAccessProps> = ({ onAccessGranted }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { validateAccessCode } = useDemoAccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await validateAccessCode(accessCode.toLowerCase());
      if (isValid) {
        onAccessGranted();
      } else {
        setError('Invalid access code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code format');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter Demo Access Code
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your demo access code to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="accessCode" className="sr-only">
              Access Code
            </label>
            <input
              id="accessCode"
              name="accessCode"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your access code (e.g., 20tusn242)"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Continue to Demo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 