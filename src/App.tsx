import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { verifyToken, selectIsInitialized, setInitialized } from './store/slices/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SMTPAccounts from './pages/SMTPAccounts';
import Recipients from './pages/Recipients';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import SingleEmails from './pages/SingleEmails';
import Layout from './components/Layout';
import TestConnection from './components/TestConnection';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// App content component that uses Redux hooks
function AppContent() {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    // Check for existing token on app startup
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, verify it and restore user session
      dispatch(verifyToken(token) as any);
    } else {
      // No token found, mark as initialized
      dispatch(setInitialized());
    }
  }, [dispatch]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="smtp-accounts" element={<SMTPAccounts />} />
                <Route path="recipients" element={<Recipients />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/new" element={<CreateCampaign />} />
                <Route path="single-emails" element={<SingleEmails />} />
              </Route>

              {/* Catch all route */}
              {/* Test route for development */}
              <Route path="/test" element={<TestConnection />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
