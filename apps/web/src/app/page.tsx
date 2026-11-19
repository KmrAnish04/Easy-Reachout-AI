'use client';

import { useEffect, useState } from 'react';

type HealthStatus = 'loading' | 'ok' | 'error';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3001/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'ok') {
        setHealthStatus('ok');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      setHealthStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'API server is unreachable',
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Easy Reachout AI
        </h1>
        
        <p className="text-xl text-gray-600">
          Your personal job hunt organizer
        </p>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            System Status
          </h2>
          
          <div className="flex items-center justify-center space-x-3">
            <span className="text-gray-700">API Server:</span>
            
            {healthStatus === 'loading' && (
              <span className="text-blue-600 font-medium">Checking...</span>
            )}
            
            {healthStatus === 'ok' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Connected
              </span>
            )}
            
            {healthStatus === 'error' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ✗ Disconnected
              </span>
            )}
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600">
              Error: {errorMessage}
            </p>
          )}

          <button
            onClick={checkHealth}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Check Again
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Milestone 1: Project Setup Complete ✓
        </p>
      </div>
    </main>
  );
}
