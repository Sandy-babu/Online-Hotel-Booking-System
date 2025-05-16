import { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  EventAvailable, 
  EventBusy, 
  LocationOn,
  HotelOutlined,
  Receipt,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(API_ENDPOINTS.BOOKINGS.GET_USER_BOOKINGS, {
          params: { email }
        });
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [cancelSuccess]);

  const handleCancelBooking = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const response = await axios.put(API_ENDPOINTS.BOOKINGS.CANCEL(selectedBookingId), {}, {
        params: { email }
      });
      
      setCancelSuccess('Booking cancelled successfully');
      setCancelDialogOpen(false);
      
      // Update the booking status in the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      setTimeout(() => {
        setCancelSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setCancelDialogOpen(false);
    }
  };

  const openCancelDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const getStatusChipProps = (status) => {
    switch(status) {
      case 'confirmed':
        return { 
          label: 'Confirmed', 
          color: 'success',
          icon: <EventAvailable />
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'error',
          icon: <EventBusy />
        };
      default:
        return { 
          label: status, 
          color: 'default',
          icon: null
        };
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw', mx: 0, py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 4, md: 8 } }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            My Bookings
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/customer/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        {cancelSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {cancelSuccess}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3 }}>
            {error}
          </Alert>
        ) : bookings.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              You don't have any bookings yet
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/customer/hotels')}
            >
              Browse Hotels
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {bookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <Card sx={{ borderRadius: 4, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, height: '100%', minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Booking #{booking.id}</Typography>
                      <Typography variant="body2" color="text.secondary">Hotel: {booking.hotelName}</Typography>
                      <Typography variant="body2" color="text.secondary">Room: {booking.roomType}</Typography>
                      <Typography variant="body2" color="text.secondary">Check-in: {format(new Date(booking.checkIn), 'PP')}</Typography>
                      <Typography variant="body2" color="text.secondary">Check-out: {format(new Date(booking.checkOut), 'PP')}</Typography>
                      <Typography variant="body2" color="text.secondary">Total: ${booking.totalPrice}</Typography>
                      <Box sx={{ mt: 1 }}>{getStatusChipProps(booking.status).icon} <Typography variant="body2" component="span" sx={{ ml: 1 }}>{getStatusChipProps(booking.status).label}</Typography></Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => openCancelDialog(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate(`/customer/hotel/${booking.hotelId}`)}
                      >
                        View Hotel
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Cancel Booking Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
        >
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              No, Keep Booking
            </Button>
            <Button 
              onClick={handleCancelBooking}
              color="error" 
              variant="contained"
            >
              Yes, Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Bookings;