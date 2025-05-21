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
  TextField, 
  Slider, 
  InputAdornment, 
  Paper, 
  Rating,
  CircularProgress
} from '@mui/material';
import { Search, LocationOn, AttachMoney } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  
  const navigate = useNavigate();

  console.log('HotelList component rendered');

  useEffect(() => {
    console.log('HotelList useEffect triggered');
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError('');
        const email = localStorage.getItem('userEmail');
        console.log('Fetching hotels with email:', email);
        if (!email) {
          setError('Please login to view hotels');
          return;
        }
        const response = await axios.get(API_ENDPOINTS.HOTEL.GET_ALL, {
          params: { email }
        });
        console.log('Initial hotels fetch response:', response.data);
        if (response.data) {
          setHotels(response.data);
          setFilteredHotels(response.data);
        }
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError(err.response?.data || 'Failed to load hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleLocationChange = (e) => {
    console.log('Location changed:', e.target.value);
    setLocation(e.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    console.log('Price range changed:', newValue);
    setPriceRange(newValue);
  };

  const handleSearchClick = () => {
    console.log('Search button clicked');
    console.log('Current location:', location);
    console.log('Current price range:', priceRange);
    applyFilters();
  };

  const applyFilters = async () => {
    console.log('applyFilters function called');
    try {
      setLoading(true);
      setError('');
      const email = localStorage.getItem('userEmail');
      console.log('Search initiated with email:', email);
      
      if (!email) {
        setError('Please login to search hotels');
        return;
      }

      // If no search term is provided, show all hotels
      if (!location.trim()) {
        console.log('No search term provided, showing all hotels');
        setFilteredHotels(hotels);
        setLoading(false);
        return;
      }

      const searchTerm = location.trim();
      const params = { email };
      if (searchTerm) {
        params.name = searchTerm;
        params.address = searchTerm;
      }
      console.log('Making API call to search hotels with:', params);

      const response = await axios.get(API_ENDPOINTS.HOTEL.SEARCH, {
        params
      });

      console.log('Search API response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setFilteredHotels(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error searching hotels:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        setError('Please login to search hotels');
      } else if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError('Failed to search hotels. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const viewHotelDetails = (hotelId) => {
    navigate(`/customer/hotels/${hotelId}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw', mx: 0, py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 4, md: 8 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Find Your Perfect Stay
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Location or Hotel Name"
                variant="outlined"
                value={location}
                onChange={handleLocationChange}
                placeholder="City, region, or hotel name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={10}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSearchClick}
                startIcon={<Search />}
                sx={{ py: 1.5 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            {error}
          </Typography>
        ) : filteredHotels.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ my: 4 }}>
            No hotels found matching your criteria. Please try a different search.
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {filteredHotels.map((hotel) => (
              <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                <Card sx={{ borderRadius: 4, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, height: '100%', minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={hotel.image || `https://source.unsplash.com/random/400x180/?hotel,${hotel.name}`}
                    alt={hotel.name}
                    sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{hotel.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{hotel.address}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>${hotel.price || 'Contact for price'}/night</Typography>
                      <Rating value={hotel.rating || 0} precision={0.1} readOnly size="small" sx={{ mt: 1 }} />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                      onClick={() => viewHotelDetails(hotel.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HotelList;