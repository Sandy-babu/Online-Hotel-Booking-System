import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const HotelSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    name: '',
    address: '',
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const email = localStorage.getItem('userEmail');
      
      const response = await axios.get(API_ENDPOINTS.CUSTOMER.HOTELS.SEARCH, {
        params: {
          ...searchParams,
          email,
        },
      });

      setHotels(response.data);
      setSuccess('Hotels found successfully!');
    } catch (err) {
      setError(err.response?.data || 'Error searching hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHotelClick = (hotelId) => {
    navigate(`/customer/hotels/${hotelId}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw', mx: 0, py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 4, md: 8 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Search Hotels
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Hotel Name"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={searchParams.address}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {hotels.map((hotel) => (
              <Grid item xs={12} sm={6} md={4} key={hotel.id} sx={{ display: 'flex', justifyContent: 'center', width: 270, maxWidth: 270, minWidth: 270, p: 0 }}>
                <Card
                  sx={{
                    width: 270,
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: 4,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 8 },
                    cursor: 'pointer',
                    overflow: 'hidden',
                    flex: '1 0 auto',
                  }}
                  onClick={() => handleHotelClick(hotel.id)}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 180,
                      overflow: 'hidden',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={hotel.image || `https://source.unsplash.com/random/400x180/?hotel,${hotel.name}`}
                      alt={hotel.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        margin: 0,
                        padding: 0,
                      }}
                      draggable={false}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 0,
                      overflow: 'hidden',
                      p: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                        noWrap
                      >
                        {hotel.name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom noWrap>
                        {hotel.address}
                      </Typography>
                      <Typography
                        variant="body2"
                        paragraph
                        sx={{
                          minHeight: 40,
                          maxHeight: 40,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {hotel.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        Contact: {hotel.contact}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          minHeight: 20,
                          maxHeight: 20,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        Amenities: {hotel.amenities}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, borderRadius: 2, fontWeight: 700, minWidth: 0, maxWidth: '100%' }}
                    >
                      View Details & Book
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HotelSearch; 