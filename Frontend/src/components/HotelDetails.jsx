import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  Tabs,
  Tab,
  Paper,
  Rating,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import { 
  LocationOn, 
  EventAvailable, 
  Person, 
  Info,
  Hotel as HotelIcon,
  CheckCircleOutline,
  CreditCard
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { differenceInDays, format } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Booking form state
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  
  // Payment dialog state
  const [openPayment, setOpenPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  
  // Confirmation dialog state
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(API_ENDPOINTS.CUSTOMER.HOTELS.DETAILS(id), {
          params: { email }
        });
        setHotel(response.data);
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError('Failed to load hotel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    // Calculate total price when room, check-in, or check-out changes
    if (selectedRoom && checkIn && checkOut) {
      const days = differenceInDays(checkOut, checkIn);
      if (days > 0) {
        const price = selectedRoom.price * days;
        setTotalPrice(price);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [selectedRoom, checkIn, checkOut]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRoomSelect = (room) => {
    setSelectedRoomNumber(room.roomNumber);
    setSelectedRoom(room);
  };
  
  const isRoomSelected = (roomNumber) => {
    return selectedRoomNumber === roomNumber;
  };
  
  const handleBookNow = async () => {
    setBookingError('');
    
    // Validation
    if (!selectedRoom) {
      setBookingError('Please select a room');
      return;
    }
    
    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }
    
    const days = differenceInDays(checkOut, checkIn);
    if (days <= 0) {
      setBookingError('Check-out date must be after check-in date');
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

  const processPayment = async () => {
    setPaymentError('');
    setPaymentProcessing(true);
    
    // Simple validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.nameOnCard) {
      setPaymentError('All payment fields are required');
      setPaymentProcessing(false);
      return;
    }

    // Validate card number format (simple check for demo purposes)
    if (!/^\d{13,19}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
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
      // First create a booking
      const token = localStorage.getItem('token');
      const bookingResponse = await axios.post(
        'http://localhost:9000/bookings', 
        {
          hotelId: hotel.id,
          roomId: selectedRoom.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          totalPrice
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Generate a unique booking reference number
      const timestamp = new Date().getTime().toString().slice(-6);
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const referenceNumber = `HB-${timestamp}-${randomDigits}`;
      
      setBookingReference(referenceNumber);
      
      // Then process payment
      const paymentResponse = await axios.post(
        'http://localhost:9000/payments',
        {
          bookingId: bookingResponse.data.booking.id,
          bookingReference: referenceNumber,
          ...paymentDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setPaymentSuccess(paymentResponse.data);
      setBookingDetails({
        ...bookingResponse.data.booking,
        bookingReference: referenceNumber
      });
      
      // Close payment dialog and open confirmation
      setOpenPayment(false);
      setOpenConfirmation(true);
      
    } catch (err) {
      console.error('Error processing booking/payment:', err);
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const viewMyBookings = () => {
    setOpenConfirmation(false);
    navigate('/customer/bookings');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!hotel) {
    return (
      <Container maxWidth="md" sx={{ my: 5 }}>
        <Alert severity="info">Hotel not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw', mx: 0, py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 4, md: 8 } }}>
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/customer/hotels')}
            sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}
          >
            Back to Hotels
          </Button>
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={5} lg={4}>
              <CardMedia
                component="img"
                height="400"
                image={hotel.image}
                alt={hotel.name}
                sx={{ borderRadius: 4, boxShadow: 3, objectFit: 'cover', width: '100%', minHeight: 300, maxHeight: 400 }}
              />
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
              <Paper elevation={4} sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#fff', boxShadow: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
                  {hotel.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body1">{hotel.address}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Rating value={hotel.rating} precision={0.1} readOnly />
                  <Typography variant="body1" sx={{ ml: 1, fontWeight: 600 }}>
                    {hotel.rating}/5
                  </Typography>
                </Box>
                <Typography variant="h5" component="p" color="primary" sx={{ fontWeight: 700, mb: 3, fontSize: 28 }}>
                  Starting from <span style={{ color: '#1976d2' }}>${hotel.price}</span>/night
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  {hotel.description}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  size="large"
                  sx={{ borderRadius: 3, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                  onClick={() => setTabValue(1)}
                >
                  Book Now
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ width: '100%', mb: 4 }}>
          <Paper sx={{ borderRadius: 3, boxShadow: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': { height: 4, borderRadius: 2, bgcolor: 'primary.main' },
                '& .MuiTab-root': { fontWeight: 700, fontSize: 18 }
              }}
            >
              <Tab icon={<Info />} label="INFORMATION" />
              <Tab icon={<HotelIcon />} label="ROOMS" />
            </Tabs>
            
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    About this Hotel
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: 18 }}>
                    {hotel.description}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: 16 }}>
                    Located in {hotel.location}, this {hotel.rating}-star hotel offers an excellent base for exploring the area. 
                    With comfortable rooms, friendly staff, and great amenities, your stay is guaranteed to be pleasant.
                  </Typography>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {(hotel.amenities || '').split(',').map((amenity, idx) => (
                      <Typography key={idx} variant="body1" sx={{ mr: 2 }}>
                        • {amenity.trim()}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Available Rooms
                  </Typography>
                  
                  {bookingError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {bookingError}
                    </Alert>
                  )}
                  
                  {bookingSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {bookingSuccess}
                    </Alert>
                  )}
                  
                  <Box sx={{ mb: 4, p: 2, bgcolor: '#f0f6fa', borderRadius: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Check-in Date"
                            value={checkIn}
                            onChange={(newValue) => setCheckIn(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={new Date()}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Check-out Date"
                            value={checkOut}
                            onChange={(newValue) => setCheckOut(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={checkIn || new Date()}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Number of Guests"
                          type="number"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person />
                              </InputAdornment>
                            ),
                            inputProps: { min: 1, max: 10 }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {hotel.rooms.map((room) => (
                      <Grid item key={room.roomNumber} xs={12} sm={6} md={6} lg={4}>
                        <Card
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: isRoomSelected(room.roomNumber) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            boxShadow: isRoomSelected(room.roomNumber) ? '0 0 16px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                            borderRadius: 4,
                            transition: 'box-shadow 0.2s, border 0.2s',
                            '&:hover': {
                              boxShadow: '0 0 24px rgba(25, 118, 210, 0.25)',
                              border: '2px solid #1976d2',
                            },
                            minHeight: 320,
                            mb: 2
                          }}
                        >
                          <CardMedia
                            component="img"
                            sx={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                            image={`https://source.unsplash.com/random/400x180/?hotel,room,${room.type}`}
                            alt={room.type}
                            onError={e => { e.target.src = '/fallback-room.jpg'; }}
                          />
                          <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {room.type} Room
                              </Typography>
                              <Typography variant="h6" component="span" color="primary" sx={{ fontWeight: 700, fontSize: 22 }}>
                                ${room.price}/night
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1, fontSize: 15 }}>
                              Comfortable {room.type.toLowerCase()} room with all basic amenities. 
                              Perfect for {room.type === 'Standard' ? 'solo travelers or couples' : 
                                room.type === 'Deluxe' ? 'travelers looking for extra comfort' : 'families or luxury travelers'}.
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                              <Typography variant="body2" sx={{ fontSize: 15 }}>
                                ✓ Free WiFi • ✓ {room.type === 'Suite' ? 'King' : 'Queen'} Bed • 
                                ✓ {room.type === 'Standard' ? '250' : room.type === 'Deluxe' ? '300' : '400'} sq ft
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventAvailable color={room.available ? 'success' : 'error'} />
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: room.available ? 'success.main' : 'error.main' }}>
                                  {room.available ? 'Available' : 'Not available'}
                                </Typography>
                              </Box>
                              <Button 
                                variant={isRoomSelected(room.roomNumber) ? "contained" : "outlined"} 
                                color="primary"
                                onClick={() => handleRoomSelect(room)}
                                disabled={!room.available}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 3, py: 1 }}
                              >
                                {isRoomSelected(room.roomNumber) ? "Selected" : "Select"}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {selectedRoom && checkIn && checkOut && totalPrice > 0 && (
                    <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: 2 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Booking Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}><Typography variant="body1">Room Type:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">{selectedRoom.type}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">Check-in:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">{checkIn && format(checkIn, 'PPP')}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">Check-out:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">{checkOut && format(checkOut, 'PPP')}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">Number of nights:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">{differenceInDays(checkOut, checkIn)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">Price per night:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1">${selectedRoom.price}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Price:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>${totalPrice}</Typography></Grid>
                      </Grid>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        size="large"
                        sx={{ mt: 3, borderRadius: 2, fontWeight: 700, fontSize: 18, py: 1.5, boxShadow: 2 }}
                        onClick={handleBookNow}
                        disabled={!selectedRoom.available}
                      >
                        Book Now
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
        
        {/* Payment Dialog */}
        <Dialog 
          open={openPayment} 
          onClose={() => !paymentProcessing && setOpenPayment(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Payment Information</DialogTitle>
          <DialogContent>
            {paymentError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {paymentError}
              </Alert>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name on Card"
                    name="nameOnCard"
                    value={paymentDetails.nameOnCard}
                    onChange={handlePaymentChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handlePaymentChange}
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard />
                        </InputAdornment>
                      ),
                    }}
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
                    type="password"
                    placeholder="123"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Room Type:</Typography>
                  <Typography variant="body1">{selectedRoom?.type}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Total Amount:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${totalPrice}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenPayment(false)}
              disabled={paymentProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={processPayment}
              variant="contained" 
              color="primary"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? <CircularProgress size={24} /> : 'Pay Now'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Booking Confirmation Dialog */}
        <Dialog
          open={openConfirmation}
          onClose={() => setOpenConfirmation(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              
              <Typography variant="h5" gutterBottom>
                Booking Confirmed!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Your booking has been successfully confirmed and payment has been processed.
              </Typography>
              
              {bookingDetails && (
                <Paper elevation={3} sx={{ p: 3, my: 3, textAlign: 'left', bgcolor: '#f9f9f9' }}>
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Booking Reference Number
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, mt: 1 }}>
                      {bookingDetails.bookingReference}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                      Please keep this reference number for your records
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Booking Details:
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Booking ID:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{bookingDetails.id}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Hotel:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{bookingDetails.hotelName}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Room Type:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{bookingDetails.roomType}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Check-in:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{format(new Date(bookingDetails.checkIn), 'PPP')}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Check-out:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{format(new Date(bookingDetails.checkOut), 'PPP')}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Total Amount:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${bookingDetails.totalPrice}</Typography>
                    </Grid>
                    
                    {paymentSuccess && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2">Payment Reference:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">{paymentSuccess.receiptNumber}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={viewMyBookings}
                >
                  View My Bookings
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default HotelDetails;