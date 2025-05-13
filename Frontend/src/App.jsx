import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import HotelList from './components/HotelList';
import HotelDetails from './components/HotelDetails';
import Bookings from './components/Bookings';
import theme from './theme';

// Auth guard component to protect routes
const ProtectedRoute = ({ children, requiredRole }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager routes */}
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute requiredRole="hotel_manager">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Customer routes */}
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/hotels" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <HotelList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/hotel/:id" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <HotelDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/bookings" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Bookings />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;