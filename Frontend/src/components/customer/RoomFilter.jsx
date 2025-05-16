import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const RoomFilter = () => {
  const [filterParams, setFilterParams] = useState({
    name: '',
    type: '',
    available: '',
    minPrice: '',
    maxPrice: '',
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFilter = async () => {
    try {
      setLoading(true);
      setError('');
      const email = localStorage.getItem('userEmail');
      
      const response = await axios.get(API_ENDPOINTS.CUSTOMER.HOTELS.ROOMS_FILTER, {
        params: {
          ...filterParams,
          email,
        },
      });

      setRooms(response.data);
      setSuccess('Rooms found successfully!');
    } catch (err) {
      setError(err.response?.data || 'Error filtering rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', width: '100vw', mx: 0, py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 4, md: 8 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Filter Rooms
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Hotel Name"
              name="name"
              value={filterParams.name}
              onChange={handleInputChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                name="type"
                value={filterParams.type}
                onChange={handleInputChange}
                label="Room Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                name="available"
                value={filterParams.available}
                onChange={handleInputChange}
                label="Availability"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Available</MenuItem>
                <MenuItem value="false">Not Available</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Price Range</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Price"
                  name="minPrice"
                  type="number"
                  value={filterParams.minPrice}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Price"
                  name="maxPrice"
                  type="number"
                  value={filterParams.maxPrice}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFilter}
              disabled={loading || !filterParams.name}
              sx={{ height: '56px', mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Filter Rooms'}
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card sx={{ borderRadius: 4, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, height: '100%', minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Room {room.roomNumber}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Type: {room.type}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Price: ${room.price}
                    </Typography>
                    <Typography variant="body2" color={room.available ? 'success.main' : 'error.main'}>
                      Status: {room.available ? 'Available' : 'Not Available'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default RoomFilter; 