import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const featuredHotels = [
  {
    name: 'Grand Palace Hotel',
    image: 'https://source.unsplash.com/random/400x200/?hotel,luxury',
    location: 'New York, USA',
    price: 320,
    rating: 4.8
  },
  {
    name: 'Seaside Resort',
    image: 'https://source.unsplash.com/random/400x200/?hotel,beach',
    location: 'Malibu, USA',
    price: 210,
    rating: 4.6
  },
  {
    name: 'Mountain View Inn',
    image: 'https://source.unsplash.com/random/400x200/?hotel,mountain',
    location: 'Aspen, USA',
    price: 180,
    rating: 4.7
  }
];

const Homepage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/customer/hotels?search=${encodeURIComponent(search)}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', pt: 0, width: '100vw', mx: 0 }}>
      {/* Hero Section */}
      <Box sx={{
        bgcolor: 'primary.main',
        color: '#fff',
        py: { xs: 6, md: 10 },
        px: 2,
        textAlign: 'center',
        backgroundImage: 'linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)',
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        mb: 6,
        width: '100vw',
        mx: 0
      }}>
        <Container maxWidth={false} sx={{ px: 0 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: 1 }}>
            Find Your Perfect Stay
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 400 }}>
            Discover and book the best hotels at unbeatable prices.
          </Typography>
          <form onSubmit={handleSearch}>
            <TextField
              variant="outlined"
              placeholder="Search hotels, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 2, width: { xs: '100%', sm: 400 }, boxShadow: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ ml: 2, py: 1.5, px: 4, fontWeight: 700, borderRadius: 2, fontSize: 18 }}>
              Search
            </Button>
          </form>
        </Container>
      </Box>
      {/* Featured Hotels */}
      <Box sx={{ width: '100vw', mx: 0 }}>
        <Container maxWidth={false} sx={{ mt: 2, mb: 8, px: { xs: 1, sm: 4, md: 8 } }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'primary.main', textAlign: 'center' }}>
            Featured Hotels
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {featuredHotels.map((hotel, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ borderRadius: 4, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, height: '100%', minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={hotel.image}
                    alt={hotel.name}
                    sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{hotel.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{hotel.location}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>${hotel.price}/night</Typography>
                      <Typography variant="body2" color="secondary" sx={{ fontWeight: 600 }}>⭐ {hotel.rating}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                      onClick={() => navigate('/customer/hotels')}
                    >
                      View Hotels
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ px: 6, py: 2, fontWeight: 700, fontSize: 20, borderRadius: 3, boxShadow: 3 }}
              onClick={() => navigate('/customer/hotels')}
            >
              Browse All Hotels
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage; 