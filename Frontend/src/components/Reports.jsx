import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('');
  const [hotels, setHotels] = useState([]);
  const [reportData, setReportData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageRating: 0,
    recentBookings: []
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchReportData();
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      const response = await axios.get(`${API_ENDPOINTS.MANAGER.HOTEL.VIEW}?email=${email}`);
      setHotels(response.data);
      if (response.data.length > 0) {
        setSelectedHotel(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      // Replace with your actual API endpoint for reports
      const response = await axios.get(`${API_ENDPOINTS.MANAGER.REPORTS}?email=${email}&hotelId=${selectedHotel}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Hotel Reports
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

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Hotel</InputLabel>
        <Select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          label="Select Hotel"
        >
          {hotels.map((hotel) => (
            <MenuItem key={hotel.id} value={hotel.id}>
              {hotel.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4">
                {reportData.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${reportData.totalRevenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Occupancy Rate
              </Typography>
              <Typography variant="h4">
                {reportData.occupancyRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h4">
                {reportData.averageRating.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Bookings
        </Typography>
        {reportData.recentBookings.map((booking) => (
          <Box key={booking.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Booking #{booking.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Check-in: {new Date(booking.checkIn).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Check-out: {new Date(booking.checkOut).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Amount: ${booking.totalPrice}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default Reports; 