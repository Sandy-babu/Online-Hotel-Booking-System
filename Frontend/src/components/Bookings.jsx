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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:9000/bookings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [cancelSuccess]);

  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:9000/bookings/${selectedBookingId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Grid container spacing={3}>
          {bookings.map((booking) => {
            const statusProps = getStatusChipProps(booking.status);
            
            return (
              <Grid item key={booking.id} xs={12}>
                <Card 
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: booking.status === 'cancelled' ? '1px solid #ffcdd2' : 'none',
                    bgcolor: booking.status === 'cancelled' ? '#ffebee' : 'white'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Booking #{booking.id}
                      </Typography>
                      
                      <Chip
                        label={statusProps.label}
                        color={statusProps.color}
                        icon={statusProps.icon}
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                          <HotelOutlined sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {booking.hotelName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.roomType} Room
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Location information would appear here
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                          <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="subtitle2">
                              Check-in: {format(new Date(booking.checkIn), 'PP')}
                            </Typography>
                            <Typography variant="subtitle2">
                              Check-out: {format(new Date(booking.checkOut), 'PP')}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Receipt sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle2">
                            Total Amount: ${booking.totalPrice}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
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
            );
          })}
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
  );
};

export default Bookings;