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
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  EventAvailable, 
  EventBusy, 
  LocationOn,
  HotelOutlined,
  Receipt,
  CalendarToday,
  History,
  Upcoming,
  FilterList,
  Sort
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, isBefore, isAfter, parseISO } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(API_ENDPOINTS.BOOKING.GET_USER_BOOKINGS, {
          params: { email }
        });
        setBookings(response.data);
        setFilteredBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [cancelSuccess]);

  useEffect(() => {
    filterBookings(activeTab);
  }, [bookings, activeTab, sortOrder]);

  const handleCancelBooking = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const response = await axios.put(API_ENDPOINTS.BOOKING.CANCEL(selectedBookingId), {}, {
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
      case 'completed':
        return { 
          label: 'Completed', 
          color: 'info',
          icon: <History />
        };
      default:
        return { 
          label: status, 
          color: 'default',
          icon: null
        };
    }
  };

  const filterBookings = (tabValue) => {
    const today = new Date();
    let filtered;
    
    switch(tabValue) {
      case 'upcoming':
        filtered = bookings.filter(booking =>
          isAfter(parseISO(booking.checkIn), today) && booking.status?.toLowerCase() !== 'cancelled'
        );
        break;
      case 'past':
        filtered = bookings.filter(booking =>
          isBefore(parseISO(booking.checkOut), today) && booking.status?.toLowerCase() !== 'cancelled'
        );
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status?.toLowerCase() === 'cancelled');
        break;
      default: // 'all'
        filtered = bookings.filter(booking => booking.status?.toLowerCase() !== 'cancelled');
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkIn);
      const dateB = new Date(b.checkIn);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredBookings(filtered);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Count upcoming bookings for badge
  const upcomingCount = bookings.filter(booking => 
    isAfter(parseISO(booking.checkIn), new Date()) && booking.status !== 'cancelled'
  ).length;

  const handleViewHotel = (booking) => {
    const hotelId = booking.hotelId || (booking.hotel && booking.hotel.id);
    if (!hotelId) {
      setError('Hotel information is not available');
      return;
    }
    navigate(`/customer/hotels/${hotelId}`);
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
          <Alert severity="success" sx={{ mb: 2 }}>{cancelSuccess}</Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="All" value="all" />
            <Tab 
              label={
                <Badge badgeContent={upcomingCount} color="primary">
                  Upcoming
                </Badge>
              } 
              value="upcoming" 
            />
            <Tab label="Past" value="past" />
            <Tab label="Cancelled" value="cancelled" />
          </Tabs>
        </Box>
        
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}>
            <IconButton onClick={toggleSortOrder}>
              <Sort />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Alert severity="info">No bookings found</Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredBookings.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <HotelOutlined sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" component="div">
                            {booking.hotel?.name || 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {booking.hotel?.address || 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Receipt sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            Room: {booking.room?.type || 'N/A'}{booking.room?.roomNumber ? ` (No. ${booking.room.roomNumber})` : ''}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {format(parseISO(booking.checkIn), 'MMM dd, yyyy')} - {format(parseISO(booking.checkOut), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            Guests: {booking.guests}
                          </Typography>
                          <Typography variant="body2">
                            Total: ${booking.totalPrice}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <Chip
                            {...getStatusChipProps(booking.status)}
                            sx={{ mb: 2 }}
                          />
                          
                          <Box>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/customer/bookings/${booking.bookingReference}`)}
                              sx={{ mb: 1, width: '100%' }}
                            >
                              View Details
                            </Button>
                            
                            {booking.status === 'confirmed' && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => openCancelDialog(booking.id)}
                                sx={{ width: '100%' }}
                              >
                                Cancel Booking
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
        >
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Typography>
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

export default Bookings;