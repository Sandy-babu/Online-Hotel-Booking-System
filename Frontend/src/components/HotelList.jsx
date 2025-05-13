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

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:9000/hotels');
        setHotels(response.data);
        setFilteredHotels(response.data);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError('Failed to load hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const applyFilters = () => {
    let filtered = [...hotels];
    
    // Filter by location
    if (location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Filter by price
    filtered = filtered.filter(hotel => 
      hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
    );
    
    setFilteredHotels(filtered);
  };

  const viewHotelDetails = (hotelId) => {
    navigate(`/customer/hotel/${hotelId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Find Your Perfect Stay
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Location"
              variant="outlined"
              value={location}
              onChange={handleLocationChange}
              placeholder="City, region, or landmark"
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
              max={500}
              step={10}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={applyFilters}
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
        <Grid container spacing={4}>
          {filteredHotels.map((hotel) => (
            <Grid item key={hotel.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={hotel.image}
                  alt={hotel.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {hotel.name}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="span" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      ${hotel.price}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {hotel.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={hotel.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {hotel.rating}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {hotel.description}
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => viewHotelDetails(hotel.id)}
                    sx={{ mt: 'auto' }}
                  >
                    View Rooms
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HotelList;