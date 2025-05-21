import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: '',
    contact: '',
    description: '',
    amenities: '',
    image: null
  });
  const [editHotelForm, setEditHotelForm] = useState({
    name: '',
    address: '',
    contact: '',
    description: '',
    amenities: '',
    image: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setError('');
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('User email not found. Please log in again.');
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('Fetching hotels for email:', email);
      const response = await axios.get(`${API_ENDPOINTS.MANAGER.HOTEL.VIEW}?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response data:', response.data);
      
      if (Array.isArray(response.data)) {
        // Process the hotels data to ensure image data is properly handled
        const processedHotels = response.data.map(hotel => ({
          ...hotel,
          image: hotel.image || null // Ensure image is either the base64 string or null
        }));
        setHotels(processedHotels);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else if (error.response.status === 404) {
          setError(error.response.data || 'Manager not found');
        } else {
          setError(error.response.data || 'Error fetching hotels');
        }
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHotelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditHotelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image loaded successfully');
        // Store the complete base64 string including the data URL prefix
        setHotelForm(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image loaded successfully');
        // Store the complete base64 string including the data URL prefix
        setEditHotelForm(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      if (!email || !token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      const id = Math.floor(100 + Math.random() * 900).toString();
      
      // Prepare the hotel data
      const hotelData = {
        id,
        name: hotelForm.name,
        address: hotelForm.address,
        contact: hotelForm.contact,
        description: hotelForm.description,
        amenities: hotelForm.amenities,
        image: hotelForm.image // This will be the complete base64 string
      };

      console.log('Sending hotel data with image:', hotelData.image ? 'Image data present' : 'No image');

      const response = await axios.post(
        `${API_ENDPOINTS.MANAGER.HOTEL.ADD}?email=${email}`,
        hotelData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Hotel added successfully:', response.data);
      setHotels([...hotels, response.data]);
      setOpenDialog(false);
      setHotelForm({
        name: '',
        address: '',
        contact: '',
        description: '',
        amenities: '',
        image: null
      });
      fetchHotels();
    } catch (error) {
      console.error('Error adding hotel:', error);
      setError(error.response?.data || 'Error adding hotel');
    }
  };

  const handleEditHotel = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      if (!email || !token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      // Prepare the hotel data
      const hotelData = {
        name: editHotelForm.name,
        address: editHotelForm.address,
        contact: editHotelForm.contact,
        description: editHotelForm.description,
        amenities: editHotelForm.amenities,
        image: editHotelForm.image // This will be the complete base64 string
      };

      console.log('Sending updated hotel data with image:', hotelData.image ? 'Image data present' : 'No image');

      const response = await axios.put(
        `${API_ENDPOINTS.MANAGER.HOTEL.UPDATE_BY_ID(editingHotel.id)}?email=${email}`,
        hotelData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Hotel updated successfully:', response.data);
      
      // Update the hotels list with the edited hotel data
      setHotels(hotels.map(hotel => 
        hotel.id === editingHotel.id ? {
          ...hotel,
          ...hotelData,
          id: editingHotel.id // Preserve the original ID
        } : hotel
      ));
      
      setOpenDialog(false);
      setEditingHotel(null);
      setEditHotelForm({
        name: '',
        address: '',
        contact: '',
        description: '',
        amenities: '',
        image: null
      });
      
      // Show success message
      setSuccess('Hotel updated successfully!');
      
      // Refresh the hotel list after a short delay
      setTimeout(() => {
        fetchHotels();
      }, 1000);
    } catch (error) {
      console.error('Error updating hotel:', error);
      setError(error.response?.data || 'Error updating hotel');
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      if (!email || !token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      await axios.delete(
        `${API_ENDPOINTS.MANAGER.HOTEL.DELETE_BY_ID(hotelId)}?email=${email}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setError(error.response?.data || 'Error deleting hotel');
    }
  };

  const openEditDialog = (hotel) => {
    setEditingHotel(hotel);
    setEditHotelForm({
      name: hotel.name,
      address: hotel.address,
      contact: hotel.contact,
      description: hotel.description,
      amenities: hotel.amenities,
      image: hotel.image
    });
    setOpenDialog(true);
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: '100vw',
        minHeight: '100vh',
        px: 0,
        py: 0,
        m: 0,
        bgcolor: '#f5f7fa'
      }}
    >
      <Box
        sx={{
          width: { xs: '98vw', sm: '95vw', md: '90vw', lg: '80vw' },
          mx: 'auto',
          my: 4,
          p: { xs: 1, sm: 2, md: 3 },
          border: '1.5px solid #e0e0e0',
          borderRadius: 3,
          boxShadow: 2,
          bgcolor: '#fff',
          minHeight: '80vh'
        }}
      >
        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Hotel Management
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === 'string' ? error : 'An error occurred'}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {typeof success === 'string' ? success : 'Operation successful'}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Card sx={{ mb: 4, width: '100%', boxSizing: 'border-box' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Add New Hotel
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Hotel Name"
                        name="name"
                        value={hotelForm.name}
                        onChange={handleInputChange}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={hotelForm.address}
                        onChange={handleInputChange}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact"
                        name="contact"
                        value={hotelForm.contact}
                        onChange={handleInputChange}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Amenities"
                        name="amenities"
                        value={hotelForm.amenities}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={hotelForm.description}
                        onChange={handleInputChange}
                        variant="outlined"
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <input
                        accept="image/*"
                        type="file"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="hotel-image-upload"
                      />
                      <label htmlFor="hotel-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                        >
                          Upload Hotel Image
                        </Button>
                      </label>
                      {hotelForm.image && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <img
                            src={hotelForm.image}
                            alt="Hotel preview"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleAddHotel}
                        disabled={loading || !hotelForm.name || !hotelForm.address || !hotelForm.contact}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Add Hotel'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {hotels.map((hotel) => (
                  <Grid item xs={12} md={6} lg={4} key={hotel.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            {hotel.name}
                          </Typography>
                          <Box>
                            <IconButton onClick={() => openEditDialog(hotel)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteHotel(hotel.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        {hotel.image && (
                          <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                            />
                          </Box>
                        )}
                        <Typography color="textSecondary" gutterBottom>
                          {hotel.address}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {hotel.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Contact: {hotel.contact}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Amenities: {hotel.amenities}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate(`/manager/rooms?hotelId=${hotel.id}`)}
                          sx={{ mt: 2 }}
                        >
                          Manage Rooms
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Hotel</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hotel Name"
                  name="name"
                  value={editHotelForm.name}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editHotelForm.address}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact"
                  name="contact"
                  value={editHotelForm.contact}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amenities"
                  name="amenities"
                  value={editHotelForm.amenities}
                  onChange={handleEditInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={editHotelForm.description}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleEditImageChange}
                  style={{ display: 'none' }}
                  id="edit-hotel-image-upload"
                />
                <label htmlFor="edit-hotel-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Hotel Image
                  </Button>
                </label>
                {editHotelForm.image && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={editHotelForm.image}
                      alt="Hotel preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleEditHotel}
              variant="contained"
              disabled={loading || !editHotelForm.name || !editHotelForm.address || !editHotelForm.contact}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default HotelManagement; 