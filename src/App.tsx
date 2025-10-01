import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import AuthSuccess from './pages/AuthSuccess';
import { Home } from './pages/Home';
import { P2P } from './pages/P2P';
import Mining from './pages/Mining';
import { TransactionHistory } from './pages/TransactionHistory';
import { Finance } from './pages/Finance';
import { Gift } from './pages/Gift';
import { MyPage } from './pages/MyPage';
import { useUserStore } from './stores/userStore';
import ErrorBoundary from './components/ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { initialize, setToken } = useUserStore();

  // Initialize authentication state on app startup
  useEffect(() => {
    // Check for token in URL parameters (from social login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const loginSuccess = urlParams.get('login');
    
    if (token && loginSuccess === 'success') {
      console.log('Social login token received, logging in automatically');
      setToken(token);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    initialize();
  }, [initialize, setToken]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/wallet" replace />} />
              <Route path="wallet" element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              } />
              <Route path="wallet/transactions" element={
                <ErrorBoundary>
                  <TransactionHistory />
                </ErrorBoundary>
              } />
              <Route path="p2p" element={
                <ErrorBoundary>
                  <P2P />
                </ErrorBoundary>
              } />
              <Route path="mining" element={
                <ErrorBoundary>
                  <Mining />
                </ErrorBoundary>
              } />
              <Route path="finance" element={
                <ErrorBoundary>
                  <Finance />
                </ErrorBoundary>
              } />
              <Route path="gift" element={
                <ErrorBoundary>
                  <Gift />
                </ErrorBoundary>
              } />
              <Route path="mypage" element={
                <ErrorBoundary>
                  <MyPage />
                </ErrorBoundary>
              } />
            </Route>
            

            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
