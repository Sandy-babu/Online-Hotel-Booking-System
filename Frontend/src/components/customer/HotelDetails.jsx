import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Star,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import BookingForm from './BookingForm';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          setError('User email not found. Please log in again.');
          return;
        }
        
        const response = await axios.get(`${API_ENDPOINTS.HOTEL.GET_BY_ID(id)}`, {
          params: { email }
        });
        
        // Ensure amenities is always an array
        const hotelData = {
          ...response.data,
          amenities: Array.isArray(response.data.amenities) 
            ? response.data.amenities 
            : response.data.amenities ? [response.data.amenities] : []
        };
        setHotel(hotelData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    if (newValue === 1 && !selectedRoom) {
      setError('Please select a room first');
      return;
    }
    setTabValue(newValue);
  };

  const handleRoomSelect = (room) => {
    if (!room || !room.id) {
      setError('Invalid room selection');
      return;
    }
    setSelectedRoom({
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      available: room.available,
      hotelId: hotel.id
    });
    setTabValue(1); // Switch to booking tab
  };

  const handleBookingComplete = () => {
    setSelectedRoom(null); // Clear the selected room
    setTabValue(0); // Switch back to details tab
    navigate('/customer/bookings');
  };

  const handleBookingError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!hotel) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>Hotel not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', minWidth: '100vw', width: '100vw', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: '#f7fafd', p: 0, m: 0, pt: 4, px: 8 }}>
      <Container maxWidth={false} disableGutters sx={{ width: '100vw', p: 0, m: 0, pb: 12 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/customer/hotels')}
            sx={{ mb: 2 }}
          >
            Back to Hotels
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            {hotel.name}
          </Typography>
          
          {hotel.image && (
            <Box sx={{ mb: 4, width: '100%', height: '400px', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
              <img
                src={hotel.image}
                alt={hotel.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">{hotel.address}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Phone sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">{hotel.contact}</Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Details" />
                  <Tab label="Book Room" />
                </Tabs>

                {tabValue === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography paragraph>
                      {hotel.description}
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.isArray(hotel.amenities) && hotel.amenities.map((amenity, index) => (
                        <Chip
                          key={index}
                          label={amenity}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Available Rooms
                    </Typography>
                    <Grid container spacing={2}>
                      {hotel.rooms?.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: room.available ? 'pointer' : 'not-allowed',
                              opacity: room.available ? 1 : 0.5,
                              '&:hover': {
                                borderColor: room.available ? 'primary.main' : undefined,
                              },
                            }}
                            onClick={() => room.available && handleRoomSelect(room)}
                          >
                            <CardContent>
                              <Typography variant="h6">
                                Room {room.roomNumber}
                              </Typography>
                              <Typography color="textSecondary">
                                Type: {room.type}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                ${room.price}/night
                              </Typography>
                              <Chip
                                label={room.available ? 'Available' : 'Not Available'}
                                color={room.available ? 'success' : 'error'}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box sx={{ mt: 2 }}>
                    {selectedRoom ? (
                      <BookingForm
                        room={selectedRoom}
                        hotel={hotel}
                        onBookingComplete={handleBookingComplete}
                        onBookingError={handleBookingError}
                      />
                    ) : (
                      <Alert severity="info">
                        Please select a room from the Details tab to proceed with booking.
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hotel Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{hotel.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{hotel.address}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{hotel.contact}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HotelDetails; 