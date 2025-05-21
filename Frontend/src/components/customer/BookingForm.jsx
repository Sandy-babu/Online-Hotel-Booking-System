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

const BookingForm = ({ room, hotel, onBookingComplete, onBookingError }) => {
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
  const [bookingReference, setBookingReference] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

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
    
    // Validate room data
    if (!room || !room.id) {
      setError('Room information is missing');
      return;
    }
    
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
    
    // Validate room data again
    if (!room || !room.id) {
      setPaymentError('Room information is missing');
      setPaymentProcessing(false);
      return;
    }

    // Validate hotel data
    if (!hotel || !hotel.id) {
      setPaymentError('Hotel information is missing');
      setPaymentProcessing(false);
      return;
    }
    
    // Simple validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.nameOnCard) {
      setPaymentError('All payment fields are required');
      setPaymentProcessing(false);
      return;
    }
    
    // Validate card number format (simple check for demo purposes)
    const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
      setPaymentError('Invalid card number format');
      setPaymentProcessing(false);
      return;
    }

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
      setPaymentError('Expiry date should be in MM/YY format');
      setPaymentProcessing(false);
      return;
    }

    // Validate CVV (3-4 digits)
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      setPaymentError('CVV should be 3 or 4 digits');
      setPaymentProcessing(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      if (!token || !email) {
        setPaymentError('Authentication information is missing');
        setPaymentProcessing(false);
        return;
      }

      // Generate a unique booking reference number
      const timestamp = new Date().getTime().toString().slice(-6);
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const referenceNumber = `HB-${timestamp}-${randomDigits}`;
      
      setBookingReference(referenceNumber);

      // Create booking
      const bookingResponse = await axios.post(
        API_ENDPOINTS.BOOKING.CREATE,
        {
          hotelId: hotel.id,
          roomId: room.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          totalPrice,
          bookingReference: referenceNumber,
          specialRequests: specialRequests
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { email }
        }
      );
      
      if (bookingResponse.data && bookingResponse.data.id) {
        try {
          // Process payment
          const paymentResponse = await axios.post(
            API_ENDPOINTS.PAYMENT.PROCESS,
            {
              bookingReference: referenceNumber,
              cardNumber: cardNumber,
              expiryDate: paymentDetails.expiryDate,
              cvv: paymentDetails.cvv,
              nameOnCard: paymentDetails.nameOnCard,
              amount: totalPrice,
              paymentMethod: 'CREDIT_CARD',
              customerEmail: email
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              params: { email }
            }
          );
          
          if (paymentResponse.data && paymentResponse.data.paymentStatus === 'COMPLETED') {
            setBookingSuccess(true);
            setOpenPayment(false);
            if (onBookingComplete) {
              onBookingComplete();
            }
          } else {
            setPaymentError(paymentResponse.data?.message || 'Payment failed');
            if (onBookingError) {
              onBookingError(paymentResponse.data?.message || 'Payment failed');
            }
          }
        } catch (paymentErr) {
          console.error('Payment processing error:', paymentErr);
          setPaymentError(paymentErr.response?.data?.message || 'Payment failed. Please try again.');
          if (onBookingError) {
            onBookingError(paymentErr.response?.data?.message || 'Payment processing failed');
          }
        }
      } else {
        setPaymentError('Failed to create booking: Invalid response from server');
        if (onBookingError) {
          onBookingError('Failed to create booking: Invalid response from server');
        }
      }
    } catch (err) {
      console.error('Error processing booking/payment:', err);
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
      if (onBookingError) {
        onBookingError(err.response?.data?.message || 'Error processing booking');
      }
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
        <DialogTitle>Booking Confirmed!</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ color: 'success.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Your booking has been confirmed!
            </Typography>
            
            <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center', mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Booking Reference Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, mt: 1 }}>
                {bookingReference}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Please keep this reference number for your records
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Your room has been booked successfully. Payment has been processed.
              You can view your booking details in the bookings section.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBookingSuccess(false)}
            variant="contained" 
            color="primary"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingForm;