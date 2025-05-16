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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const RoomManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: '',
    price: '',
    available: true,
  });
  const [editRoomForm, setEditRoomForm] = useState({
    roomNumber: '',
    type: '',
    price: '',
    available: true,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms();
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      const response = await axios.get(`${API_ENDPOINTS.MANAGER.HOTEL.VIEW}?email=${email}`);
      setHotels(response.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Error fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      const response = await axios.get(`${API_ENDPOINTS.MANAGER.ROOM.VIEW}?email=${email}&hotelId=${selectedHotel}`);
      setRooms(response.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditRoomForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRoom = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('userEmail');
      await axios.post(`${API_ENDPOINTS.MANAGER.ROOM.ADD}?email=${email}&hotelId=${selectedHotel}`, roomForm);
      setSuccess('Room added successfully!');
      setRoomForm({
        roomNumber: '',
        type: '',
        price: '',
        available: true,
      });
      fetchRooms();
    } catch (err) {
      console.error('Error adding room:', err);
      setError(err.response?.data || 'Error adding room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom) {
      setError('No room selected for editing');
      return;
    }

    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!email || !token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.put(
        API_ENDPOINTS.MANAGER.ROOM.UPDATE(editingRoom.roomNumber),
        {
          roomNumber: editingRoom.roomNumber,
          type: editRoomForm.type,
          price: editRoomForm.price,
          available: editRoomForm.available
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          params: { email }
        }
      );

      if (response.data) {
        setRooms(rooms.map(room => 
          room.roomNumber === editingRoom.roomNumber ? response.data : room
        ));
        setOpenDialog(false);
        setEditingRoom(null);
        setEditRoomForm({
          roomNumber: '',
          type: '',
          price: '',
          available: true
        });
        setSuccess('Room updated successfully');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setError(error.response?.data?.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!email || !token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.delete(
        API_ENDPOINTS.MANAGER.ROOM.DELETE(roomNumber),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { email }
        }
      );

      if (response.data) {
        setRooms(rooms.filter(room => room.roomNumber !== roomNumber));
        setSuccess('Room deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      setError(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const openEditDialog = (room) => {
    setEditingRoom(room);
    setEditRoomForm({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      available: room.available,
    });
    setOpenDialog(true);
  };

  const closeEditDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
    setEditRoomForm({
      roomNumber: '',
      type: '',
      price: '',
      available: true
    });
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
            Room Management
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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

          {selectedHotel && (
            <>
              <Card sx={{ mb: 4, width: '100%', boxSizing: 'border-box' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Add New Room
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Room Number"
                        name="roomNumber"
                        value={roomForm.roomNumber}
                        onChange={handleInputChange}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Room Type</InputLabel>
                        <Select
                          name="type"
                          value={roomForm.type}
                          onChange={handleInputChange}
                          label="Room Type"
                          required
                        >
                          <MenuItem value="Standard">Standard</MenuItem>
                          <MenuItem value="Deluxe">Deluxe</MenuItem>
                          <MenuItem value="Suite">Suite</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={roomForm.price}
                        onChange={handleInputChange}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Availability</InputLabel>
                        <Select
                          name="available"
                          value={roomForm.available}
                          onChange={handleInputChange}
                          label="Availability"
                        >
                          <MenuItem value={true}>Available</MenuItem>
                          <MenuItem value={false}>Not Available</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleAddRoom}
                        disabled={loading || !roomForm.roomNumber || !roomForm.type || !roomForm.price}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Add Room'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {rooms.map((room) => (
                  <Grid item xs={12} md={6} lg={4} key={room.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            Room {room.roomNumber}
                          </Typography>
                          <Box>
                            <IconButton onClick={() => openEditDialog(room)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteRoom(room.roomNumber)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography color="textSecondary" gutterBottom>
                          Type: {room.type}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Price: ${room.price}
                        </Typography>
                        <Typography variant="body2" color={room.available ? 'success.main' : 'error.main'}>
                          Status: {room.available ? 'Available' : 'Not Available'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>

        <Dialog open={openDialog} onClose={closeEditDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNumber"
                  value={editRoomForm.roomNumber}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  required
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    name="type"
                    value={editRoomForm.type}
                    onChange={handleEditInputChange}
                    label="Room Type"
                    required
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Deluxe">Deluxe</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={editRoomForm.price}
                  onChange={handleEditInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    name="available"
                    value={editRoomForm.available}
                    onChange={handleEditInputChange}
                    label="Availability"
                  >
                    <MenuItem value={true}>Available</MenuItem>
                    <MenuItem value={false}>Not Available</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button
              onClick={handleEditRoom}
              variant="contained"
              disabled={loading || !editRoomForm.type || !editRoomForm.price}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default RoomManagement; 