import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import LibrarianPage from './pages/LibrarianPage';
import MemberPage from './pages/MemberPage';
import Header from './components/Header';
import ReturnbookPage from './pages/ReturnbookPage';
import BorrowhistoryPage from './pages/BorrowhistoryPage';
import BookManagement from './pages/BookManagement';
import LibrarianManagement from './pages/LibrarianManagement';

const App = () => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { isAuthenticated: false, role: null, username: '', loginStatus: false };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    if (!auth.loginStatus) return;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/users/validate_token', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuth((prevState) => ({
            ...prevState,
            isAuthenticated: true,
            role: data.role,
            username: data.username,
            loginStatus: false,
          }));
        } else {
          setAuth((prevState) => ({
            ...prevState,
            isAuthenticated: false,
            role: null,
            username: '',
            loginStatus: false,
          }));
        }
      } catch (error) {
        console.error('Error during token validation:', error);
        setAuth((prevState) => ({
          ...prevState,
          isAuthenticated: false,
          role: null,
          username: '',
          loginStatus: false,
        }));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();//called when auth.loginStatus changed
  }, [auth.loginStatus]);

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, role: null, username: '', loginStatus: false });
    localStorage.removeItem('auth');
  };

  const ConditionalHeader = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

    if (isAuthPage) {
      return (
        <Box sx={{ backgroundColor: 'primary.main', padding: 2, textAlign: 'center' }}>
          <Typography variant="h3" color="white">
            Welcome to Online Library Portal
          </Typography>
          <Typography variant="subtitle1" color="white">
            Open the door to endless learning
          </Typography>
        </Box>
      );
    }

    return (
      <Header
        role={auth.role}
        username={loading ? '...' : auth.username}
        onLogout={handleLogout}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const ProtectedRoute = ({ children }) => {
    return auth.isAuthenticated ? children : <Navigate to="/" />;
  };

  const RedirectIfAuthenticated = ({ children }) => {
    return auth.isAuthenticated ?(<Navigate to={auth.role === 'Admin' ? '/admin' : auth.role === 'Librarian' ? '/librarian' : '/member'} />) : (children);
  };

  return (
    <Router>
      <ConditionalHeader />
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated>
              <LoginPage setAuth={(data) => setAuth({ ...data, loginStatus: true })} />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <SignupPage setAuth={(data) => setAuth({ ...data, loginStatus: true })} />
            </RedirectIfAuthenticated>
          }
        />
        {auth.isAuthenticated && (
          <>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian"
              element={
                <ProtectedRoute>
                  <LibrarianPage onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member"
              element={
                <ProtectedRoute>
                  <MemberPage onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-update-delete-librarian"
              element={
                <ProtectedRoute>
                  <LibrarianManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-update-delete-book"
              element={
                <ProtectedRoute>
                  <BookManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/borrow-history"
              element={
                <ProtectedRoute>
                  <BorrowhistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/create-update-delete-book"
              element={
                <ProtectedRoute>
                  <BookManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/borrow-history"
              element={
                <ProtectedRoute>
                  <BorrowhistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/return-book"
              element={
                <ProtectedRoute>
                  <ReturnbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/borrow-history"
              element={
                <ProtectedRoute>
                  <BorrowhistoryPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
