import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInDays } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const BookingForm = ({ room, hotel, onBookingComplete }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openPayment, setOpenPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate total price when dates or guests change
  React.useEffect(() => {
    if (checkIn && checkOut && room) {
      const days = differenceInDays(checkOut, checkIn);
      if (days > 0) {
        setTotalPrice(room.price * days);
      } else {
        setTotalPrice(0);
      }
    }
  }, [checkIn, checkOut, room]);

  const handleBookNow = async () => {
    setError('');
    
    // Validation
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }
    
    const days = differenceInDays(checkOut, checkIn);
    if (days <= 0) {
      setError('Check-out date must be after check-in date');
      return;
    }
    
    setOpenPayment(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processBooking = async () => {
    setPaymentError('');
    setPaymentProcessing(true);
    
    // Simple validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.nameOnCard) {
      setPaymentError('All payment fields are required');
      setPaymentProcessing(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      // Create booking
      const bookingResponse = await axios.post(
        API_ENDPOINTS.BOOKINGS.CREATE,
        {
          hotelId: hotel.id,
          roomId: room.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          totalPrice
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { email }
        }
      );
      
      // Process payment
      const paymentResponse = await axios.post(
        API_ENDPOINTS.PAYMENTS.PROCESS,
        {
          bookingId: bookingResponse.data.id,
          ...paymentDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setBookingSuccess(true);
      setOpenPayment(false);
      if (onBookingComplete) {
        onBookingComplete(bookingResponse.data);
      }
      
    } catch (err) {
      console.error('Error processing booking/payment:', err);
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Book Room {room.roomNumber}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in Date"
                  value={checkIn}
                  onChange={setCheckIn}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOut}
                  onChange={setCheckOut}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={checkIn || new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Number of Guests</InputLabel>
                <Select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  label="Number of Guests"
                >
                  {[1, 2, 3, 4].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Total Price: ${totalPrice}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleBookNow}
                disabled={loading || !checkIn || !checkOut}
              >
                {loading ? <CircularProgress size={24} /> : 'Book Now'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)}>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentChange}
                placeholder="1234 5678 9012 3456"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                placeholder="MM/YY"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                placeholder="123"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name on Card"
                name="nameOnCard"
                value={paymentDetails.nameOnCard}
                onChange={handlePaymentChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayment(false)}>Cancel</Button>
          <Button
            onClick={processBooking}
            variant="contained"
            color="primary"
            disabled={paymentProcessing}
          >
            {paymentProcessing ? <CircularProgress size={24} /> : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={bookingSuccess} onClose={() => setBookingSuccess(false)}>
        <DialogTitle>Booking Successful!</DialogTitle>
        <DialogContent>
          <Typography>
            Your room has been booked successfully. You can view your booking details in the bookings section.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingSuccess(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingForm; 