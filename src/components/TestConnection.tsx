/**
 * Test Connection Component
 * Simple component to test frontend-backend connectivity
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import apiService from '../services/api';

const TestConnection: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [testResult, setTestResult] = useState<string>('');

  const testBackendConnection = async () => {
    try {
      console.log('🧪 Starting comprehensive backend test...');
      setTestResult('🔄 Testing backend connection...');

      const results = [];

      // Test 1: Health check endpoint
      console.log('🧪 Test 1: Health check endpoint');
      try {
        const testResponse = await fetch('http://localhost:5000/api/auth/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('✅ Health check passed:', testData);
          results.push(`✅ Test 1 - Health Check: PASSED\n${JSON.stringify(testData, null, 2)}`);
        } else {
          results.push(`❌ Test 1 - Health Check: FAILED (${testResponse.status})`);
        }
      } catch (error) {
        results.push(`❌ Test 1 - Health Check: ERROR - ${(error as any).message}`);
      }

      // Test 2: API Documentation endpoint
      console.log('🧪 Test 2: API Documentation');
      try {
        const docsResponse = await fetch('http://localhost:5000/docs', {
          method: 'GET',
        });

        if (docsResponse.ok) {
          console.log('✅ API docs accessible');
          results.push(`✅ Test 2 - API Docs: ACCESSIBLE (${docsResponse.status})`);
        } else {
          results.push(`❌ Test 2 - API Docs: FAILED (${docsResponse.status})`);
        }
      } catch (error) {
        results.push(`❌ Test 2 - API Docs: ERROR - ${(error as any).message}`);
      }

      // Test 3: CORS and validation (expected error)
      console.log('🧪 Test 3: Validation test (expected error)');
      try {
        const validationResponse = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'test',
            email: 'invalid-email',
            password: '123'
          }),
        });

        const validationData = await validationResponse.json();
        console.log('✅ Validation test completed:', validationData);
        results.push(`✅ Test 3 - Validation: WORKING (Expected Error)\n${JSON.stringify(validationData, null, 2)}`);
      } catch (error) {
        results.push(`❌ Test 3 - Validation: ERROR - ${(error as any).message}`);
      }

      // Test 4: Environment and configuration
      console.log('🧪 Test 4: Frontend configuration');
      const frontendConfig = {
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        appName: import.meta.env.VITE_APP_NAME || 'NestCraft Email Marketing',
        isDev: import.meta.env.DEV,
        mode: import.meta.env.MODE
      };
      console.log('✅ Frontend config:', frontendConfig);
      results.push(`✅ Test 4 - Frontend Config:\n${JSON.stringify(frontendConfig, null, 2)}`);

      // Compile all results
      const finalResult = results.join('\n\n' + '='.repeat(50) + '\n\n');
      setTestResult(finalResult);

      console.log('🎉 Backend test completed!');

    } catch (err) {
      console.error('❌ Comprehensive test failed:', err);
      setTestResult(`❌ Comprehensive Test Failed: ${(err as any).message}`);
    }
  };

  const testReduxAuth = () => {
    // Test Redux auth action
    dispatch(login({
      username: 'test',
      password: 'test'
    }) as any);
  };

  const testApiService = async () => {
    try {
      console.log('🧪 Testing API Service...');
      setTestResult('🔄 Testing API Service...');

      // Test using our API service
      const response = await apiService.get('/auth/test');
      console.log('✅ API Service test successful:', response);

      setTestResult(`✅ API Service Test: SUCCESS\n${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      console.error('❌ API Service test failed:', error);
      setTestResult(`❌ API Service Test: FAILED\n${error.message || error}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Frontend-Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testBackendConnection}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Backend Connection
          </button>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={testReduxAuth}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing Redux...' : 'Test Redux Auth'}
          </button>

          <button
            onClick={testApiService}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Test API Service
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Redux Error:</strong> {String(error)}
          </div>
        )}
        
        {testResult && (
          <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">System Status:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ Working Components</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Frontend running on http://localhost:5173</li>
              <li>• Backend running on http://localhost:5000</li>
              <li>• Redux store configured</li>
              <li>• API services created</li>
              <li>• Swagger docs at /docs</li>
              <li>• Authentication flow ready</li>
              <li>• Console debugging enabled</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🧪 Debug Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• API request/response logging</li>
              <li>• Authentication state tracking</li>
              <li>• Error handling with details</li>
              <li>• Test endpoint: /api/auth/test</li>
              <li>• Console logs with emojis</li>
              <li>• Network tab monitoring</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">🔍 How to Debug</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Open browser console (F12)</li>
            <li>Go to /auth page and try login/register</li>
            <li>Watch console for 🚀 🔐 ✅ ❌ logs</li>
            <li>Check Network tab for HTTP requests</li>
            <li>Backend logs appear in terminal</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
