import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  InputAdornment,
  Badge
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  Sort,
  EventAvailable,
  EventBusy,
  History,
  CalendarToday,
  Person,
  Hotel as HotelIcon,
  MeetingRoom,
  CreditCard,
  Print,
  Email as EmailIcon,
  Message
} from '@mui/icons-material';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchManagerData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter, dateRangeFilter, selectedHotel, activeTab, sortOrder]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!email || !token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      // Fetch hotels managed by this manager
      const hotelsResponse = await axios.get(`/api/manager/hotels?email=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (Array.isArray(hotelsResponse.data)) {
        setHotels(hotelsResponse.data);
        
        // Fetch all bookings for all hotels managed by this manager
        const bookingsPromises = hotelsResponse.data.map(hotel => 
          axios.get(`/api/manager/hotels/${hotel.id}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        );
        
        const bookingsResponses = await Promise.all(bookingsPromises);
        
        // Combine all bookings into a single array
        const allBookings = bookingsResponses.flatMap(response => 
          Array.isArray(response.data) ? response.data : []
        );
        
        setBookings(allBookings);
        setFilteredBookings(allBookings);
      }
    } catch (error) {
      console.error('Error fetching manager data:', error);
      setError('Failed to load manager data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filter by hotel
    if (selectedHotel !== 'all') {
      filtered = filtered.filter(booking => booking.hotelId === selectedHotel);
    }
    
    // Filter by search query (guest name or booking ID)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.guestName?.toLowerCase().includes(lowerQuery) || 
        booking.id?.toString().includes(lowerQuery) ||
        booking.email?.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by date range
    const today = new Date();
    switch (dateRangeFilter) {
      case 'today':
        filtered = filtered.filter(booking => {
          const checkIn = parseISO(booking.checkIn);
          return format(checkIn, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        });
        break;
      case 'tomorrow':
        filtered = filtered.filter(booking => {
          const checkIn = parseISO(booking.checkIn);
          const tomorrow = addDays(today, 1);
          return format(checkIn, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
        });
        break;
      case 'this-week':
        const endOfWeek = addDays(today, 7);
        filtered = filtered.filter(booking => {
          const checkIn = parseISO(booking.checkIn);
          return isAfter(checkIn, today) && isBefore(checkIn, endOfWeek);
        });
        break;
      case 'past':
        filtered = filtered.filter(booking => {
          const checkOut = parseISO(booking.checkOut);
          return isBefore(checkOut, today);
        });
        break;
      default:
        break;
    }
    
    // Filter by tab
    switch (activeTab) {
      case 'new':
        filtered = filtered.filter(booking => booking.status === 'confirmed' && !booking.isViewed);
        break;
      case 'upcoming':
        filtered = filtered.filter(booking => {
          const checkIn = parseISO(booking.checkIn);
          return isAfter(checkIn, today) && booking.status === 'confirmed';
        });
        break;
      case 'today':
        filtered = filtered.filter(booking => {
          const checkIn = parseISO(booking.checkIn);
          return format(checkIn, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        });
        break;
      case 'cancelled':
        filtered = filtered.filter(booking => booking.status === 'cancelled');
        break;
      case 'completed':
        filtered = filtered.filter(booking => {
          const checkOut = parseISO(booking.checkOut);
          return isBefore(checkOut, today) && booking.status === 'confirmed';
        });
        break;
      default: // 'all'
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkIn);
      const dateB = new Date(b.checkIn);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredBookings(filtered);
  };

  const getHotelNameById = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : 'Unknown Hotel';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <Chip icon={<CheckCircle />} label="Confirmed" color="success" size="small" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Cancelled" color="error" size="small" />;
      case 'completed':
        return <Chip icon={<History />} label="Completed" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setOpenBookingDialog(true);
    
    // Mark booking as viewed if it's new
    if (!booking.isViewed) {
      markBookingAsViewed(booking.id);
    }
  };

  const markBookingAsViewed = async (bookingId) => {
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      // Update the booking status to viewed
      await axios.put(`/api/manager/bookings/${bookingId}/viewed`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { email }
      });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, isViewed: true } 
            : booking
        )
      );
    } catch (error) {
      console.error('Error marking booking as viewed:', error);
    }
  };

  const handleOpenMessageDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenMessageDialog(true);
  };

  const handleSendMessage = async () => {
    try {
      if (!message.trim()) {
        return;
      }
      
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/manager/bookings/${selectedBooking.id}/message`, 
        { message, recipientEmail: selectedBooking.email },
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { email }
        }
      );
      
      setSuccess('Message sent successfully!');
      setOpenMessageDialog(false);
      setMessage('');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to cancel this booking?');
      if (!confirmed) return;
      
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/manager/bookings/${bookingId}/cancel`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { email }
      });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      setSuccess('Booking cancelled successfully!');
      setOpenBookingDialog(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  // Count new/unviewed bookings for the badge
  const newBookingsCount = bookings.filter(booking => 
    booking.status === 'confirmed' && !booking.isViewed
  ).length;

  // Count today's check-ins
  const todayCheckInsCount = bookings.filter(booking => {
    const checkIn = parseISO(booking.checkIn);
    return format(checkIn, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && booking.status === 'confirmed';
  }).length;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw' }}>
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Booking Management
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/manager/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, borderRadius: 2 }}>
                  <Typography component="p" variant="h6" color="primary">
                    Total Bookings
                  </Typography>
                  <Typography component="p" variant="h4">
                    {bookings.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, borderRadius: 2 }}>
                  <Typography component="p" variant="h6" color="success.main">
                    Active Bookings
                  </Typography>
                  <Typography component="p" variant="h4">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, borderRadius: 2 }}>
                  <Typography component="p" variant="h6" color="warning.main">
                    Today's Check-ins
                  </Typography>
                  <Typography component="p" variant="h4">
                    {todayCheckInsCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, borderRadius: 2 }}>
                  <Typography component="p" variant="h6" color="error.main">
                    Cancelled Bookings
                  </Typography>
                  <Typography component="p" variant="h4">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Filters and Tabs */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  label="Search Guests or Booking ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl size="small" fullWidth>
                  <InputLabel id="hotel-select-label">Filter by Hotel</InputLabel>
                  <Select
                    labelId="hotel-select-label"
                    value={selectedHotel}
                    label="Filter by Hotel"
                    onChange={(e) => setSelectedHotel(e.target.value)}
                  >
                    <MenuItem value="all">All Hotels</MenuItem>
                    {hotels.map((hotel) => (
                      <MenuItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" fullWidth>
                  <InputLabel id="status-select-label">Filter by Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" fullWidth>
                  <InputLabel id="date-range-select-label">Filter by Date</InputLabel>
                  <Select
                    labelId="date-range-select-label"
                    value={dateRangeFilter}
                    label="Filter by Date"
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Dates</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="tomorrow">Tomorrow</MenuItem>
                    <MenuItem value="this-week">This Week</MenuItem>
                    <MenuItem value="past">Past Bookings</MenuItem>
                  </Select>
                </FormControl>
                
                <IconButton onClick={toggleSortOrder} sx={{ alignSelf: 'center' }}>
                  <Sort />
                </IconButton>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ width: '100%' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable" 
                  scrollButtons="auto"
                >
                  <Tab label="All Bookings" value="all" />
                  <Tab 
                    label={
                      <Badge badgeContent={newBookingsCount} color="error">
                        New Bookings
                      </Badge>
                    } 
                    value="new" 
                  />
                  <Tab label="Upcoming" value="upcoming" />
                  <Tab 
                    label={
                      <Badge badgeContent={todayCheckInsCount} color="warning">
                        Today's Check-ins
                      </Badge>
                    } 
                    value="today" 
                  />
                  <Tab label="Cancelled" value="cancelled" />
                  <Tab label="Completed" value="completed" />
                </Tabs>
              </Box>
            </Paper>
            
            {/* Bookings Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table aria-label="bookings table">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Booking ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Guest</TableCell>
                    <TableCell sx={{ color: 'white' }}>Hotel</TableCell>
                    <TableCell sx={{ color: 'white' }}>Room Type</TableCell>
                    <TableCell sx={{ color: 'white' }}>Check-in</TableCell>
                    <TableCell sx={{ color: 'white' }}>Check-out</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" sx={{ py: 3 }}>
                          No bookings found matching your filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow 
                        key={booking.id} 
                        hover
                        sx={{
                          bgcolor: !booking.isViewed ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                          '&:hover': { bgcolor: !booking.isViewed ? 'rgba(25, 118, 210, 0.12)' : '' }
                        }}
                      >
                        <TableCell>
                          {!booking.isViewed && (
                            <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', mr: 1 }} />
                          )}
                          {booking.id}
                        </TableCell>
                        <TableCell>{booking.guestName}</TableCell>
                        <TableCell>{getHotelNameById(booking.hotelId)}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell>{format(parseISO(booking.checkIn), 'PP')}</TableCell>
                        <TableCell>{format(parseISO(booking.checkOut), 'PP')}</TableCell>
                        <TableCell>{getStatusChip(booking.status)}</TableCell>
                        <TableCell>${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleViewBooking(booking)}
                              title="View Details"
                            >
                              <Search />
                            </IconButton>
                            
                            {booking.status === 'confirmed' && (
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleCancelBooking(booking.id)}
                                title="Cancel Booking"
                              >
                                <Cancel />
                              </IconButton>
                            )}
                            
                            <IconButton 
                              size="small" 
                              color="info" 
                              onClick={() => handleOpenMessageDialog(booking)}
                              title="Contact Guest"
                            >
                              <Message />
                            </IconButton>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => {/* Print functionality */}}
                              title="Print"
                            >
                              <Print />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
      
      {/* Booking Details Dialog */}
      <Dialog 
        open={openBookingDialog} 
        onClose={() => setOpenBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Booking Details: #{selectedBooking.id}</Typography>
              {getStatusChip(selectedBooking.status)}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" /> Guest Information
                    </Typography>
                    <Typography variant="body1">
                      <strong>Name:</strong> {selectedBooking.guestName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {selectedBooking.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {selectedBooking.phone || 'Not provided'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        startIcon={<EmailIcon />} 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          setOpenBookingDialog(false);
                          setOpenMessageDialog(true);
                        }}
                      >
                        Contact Guest
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HotelIcon fontSize="small" /> Accommodation Details
                    </Typography>
                    <Typography variant="body1">
                      <strong>Hotel:</strong> {getHotelNameById(selectedBooking.hotelId)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Room Type:</strong> {selectedBooking.roomType}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Check-in:</strong> {format(parseISO(selectedBooking.checkIn), 'PPP')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Check-out:</strong> {format(parseISO(selectedBooking.checkOut), 'PPP')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Nights:</strong> {Math.ceil((new Date(selectedBooking.checkOut) - new Date(selectedBooking.checkIn)) / (1000 * 60 * 60 * 24))}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard fontSize="small" /> Payment Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                          <strong>Total Amount:</strong> ${selectedBooking.totalPrice}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Payment Method:</strong> {selectedBooking.paymentMethod || 'Credit Card'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Payment Status:</strong> {selectedBooking.paymentStatus || 'Paid'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                          <strong>Booking Date:</strong> {selectedBooking.bookingDate ? format(parseISO(selectedBooking.bookingDate), 'PPP') : 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Special Requests:</strong> {selectedBooking.specialRequests || 'None'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenBookingDialog(false)}>Close</Button>
              {selectedBooking.status === 'confirmed' && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                >
                  Cancel Booking
                </Button>
              )}
              <Button 
                variant="contained"
                onClick={() => {/* Print functionality */}}
                startIcon={<Print />}
              >
                Print
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog
        open={openMessageDialog}
        onClose={() => setOpenMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contact Guest</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Send a message to {selectedBooking.guestName} regarding booking #{selectedBooking.id}
              </Typography>
              <TextField
                autoFocus
                label="Message"
                multiline
                rows={4}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingManagement;