import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Alert, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError('');
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(API_ENDPOINTS.BOOKING.GET_BY_ID(id), {
          params: { email }
        });
        setBooking(response.data);
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, cancelSuccess]);

  const handleCancelBooking = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      await axios.put(API_ENDPOINTS.BOOKING.CANCEL(id), {}, {
        params: { email }
      });
      setCancelSuccess('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
      setTimeout(() => setCancelSuccess(''), 5000);
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
  }

  if (!booking) {
    return <Container><Alert severity="info" sx={{ mt: 4 }}>Booking not found</Alert></Container>;
  }

  return (
    <Box sx={{ minHeight: '100vh', minWidth: '100vw', height: '100vh', width: '100vw', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: '#f7fafd', p: 0, m: 0, pt: 4, px: 8 }}>
      <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', p: 0, m: 0 }}>
        <Button variant="outlined" onClick={() => navigate('/customer/bookings')} sx={{ mb: 2 }}>Back to Bookings</Button>
        <Typography variant="h4" gutterBottom>Booking Details</Typography>
        {cancelSuccess && <Alert severity="success" sx={{ mb: 2 }}>{cancelSuccess}</Alert>}
        <Box sx={{ mb: 2 }}>
          <Chip label={booking.status} color={booking.status === 'cancelled' ? 'error' : 'success'} sx={{ mb: 2 }} />
          <Typography variant="body1"><b>Booking Reference:</b> {booking.bookingReference}</Typography>
          <Typography variant="body1"><b>Hotel:</b> {booking.hotel?.name || 'N/A'}</Typography>
          <Typography variant="body1"><b>Room:</b> {booking.room?.type || 'N/A'}</Typography>
          <Typography variant="body1"><b>Check-in:</b> {booking.checkIn}</Typography>
          <Typography variant="body1"><b>Check-out:</b> {booking.checkOut}</Typography>
          <Typography variant="body1"><b>Guests:</b> {booking.guests}</Typography>
          <Typography variant="body1"><b>Total Price:</b> ${booking.totalPrice}</Typography>
          <Typography variant="body1"><b>Special Requests:</b> {booking.specialRequests || 'None'}</Typography>
        </Box>
        {booking.status !== 'cancelled' && (
          <Button variant="contained" color="error" onClick={() => setCancelDialogOpen(true)} sx={{ mt: 2 }}>
            Cancel Booking
          </Button>
        )}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel this booking? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Booking</Button>
            <Button onClick={handleCancelBooking} color="error">Yes, Cancel Booking</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingDetails; 