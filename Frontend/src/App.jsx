import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import HotelSearch from './components/customer/HotelSearch';
import RoomFilter from './components/customer/RoomFilter';
import HotelManagement from './components/manager/HotelManagement';
import RoomManagement from './components/manager/RoomManagement';
import BookingManagement from './components/manager/BookingManagement';
import HotelList from './components/HotelList';
import HotelDetails from './components/HotelDetails';
import Bookings from './components/Bookings';
import Reports from './components/Reports';
import theme from './theme';
import Layout from './components/customer/Layout';
import Homepage from './components/customer/Homepage';
import UserProfile from './components/customer/UserProfile';
import NotificationProvider from './components/NotificationProvider';

// Auth guard component to protect routes
const ProtectedRoute = ({ children, requiredRole }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
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
              <Route 
                path="/manager/hotels" 
                element={
                  <ProtectedRoute requiredRole="hotel_manager">
                    <HotelManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/rooms" 
                element={
                  <ProtectedRoute requiredRole="hotel_manager">
                    <RoomManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/bookings" 
                element={
                  <ProtectedRoute requiredRole="hotel_manager">
                    <BookingManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/reports" 
                element={
                  <ProtectedRoute requiredRole="hotel_manager">
                    <Reports />
                  </ProtectedRoute>
                } 
              />

              {/* Customer website routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Homepage />} />
                <Route 
                  path="/customer/profile" 
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customer/hotels" 
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <HotelSearch />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customer/rooms" 
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <RoomFilter />
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
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </Box>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;