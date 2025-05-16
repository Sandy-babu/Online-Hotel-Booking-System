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
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(API_ENDPOINTS.CUSTOMER.HOTELS.DETAILS(id), {
          params: { email }
        });
        setHotel(response.data);
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setTabValue(1); // Switch to booking tab
  };

  const handleBookingComplete = () => {
    navigate('/customer/bookings');
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                    {hotel.amenities?.map((amenity, index) => (
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
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                          onClick={() => handleRoomSelect(room)}
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

              {tabValue === 1 && selectedRoom && (
                <Box sx={{ mt: 2 }}>
                  <BookingForm
                    room={selectedRoom}
                    hotel={hotel}
                    onBookingComplete={handleBookingComplete}
                  />
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
  );
};

export default HotelDetails; 