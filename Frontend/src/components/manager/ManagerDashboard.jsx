import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Update these endpoints as per your API config
const API_ENDPOINTS = {
  MANAGER_HOTELS: 'http://localhost:9000/manager/hotels',
  MANAGER_BOOKINGS: 'http://localhost:9000/manager/bookings',
};

const ManagerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerBookings();
  }, []);

  const fetchManagerBookings = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      // 1. Fetch manager's hotels
      const hotelsRes = await axios.get('http://localhost:9000/manager/hotel/view', { params: { email } });
      const hotels = hotelsRes.data;

      // 2. For each hotel, fetch its bookings
      let allBookings = [];
      for (const hotel of hotels) {
        const bookingsRes = await axios.get(`http://localhost:9000/customer/booking/hotel/${hotel.id}`);
        // Add hotel name to each booking for display
        bookingsRes.data.forEach(b => allBookings.push({ ...b, hotelName: hotel.name }));
      }
      setBookings(allBookings);
    } catch (err) {
      console.error('Error fetching manager bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manager Dashboard
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking Reference</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking.reference}>
                  <TableCell>{booking.reference}</TableCell>
                  <TableCell>{booking.hotelName || booking.hotelId}</TableCell>
                  <TableCell>{booking.roomName || booking.roomId}</TableCell>
                  <TableCell>{booking.customerName || booking.customerEmail}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ManagerDashboard; 