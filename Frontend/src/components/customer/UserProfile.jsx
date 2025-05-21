import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  PhotoCamera
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: 'https://source.unsplash.com/random/200x200/?portrait'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const email = localStorage.getItem('userEmail');
        if (!email) {
          navigate('/login');
          return;
        }
        // Make the real API call
        const response = await axios.get(API_ENDPOINTS.CUSTOMER.PROFILE, {
          params: { email }
        });
        const userData = response.data;
        setProfile(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          profilePicture: userData.profilePicture || 'https://source.unsplash.com/random/200x200/?portrait'
        });
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - revert form data to current profile data
      setFormData({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        profilePicture: profile.profilePicture
      });
    }
    setEditMode(!editMode);
  };
  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      const email = localStorage.getItem('userEmail');

      // Validate profile picture if it's being updated
      if (formData.profilePicture && formData.profilePicture !== profile.profilePicture) {
        // Check if it's a valid base64 image
        if (!formData.profilePicture.startsWith('data:image/')) {
          setError('Invalid image format. Please upload a valid image.');
          setLoading(false);
          return;
        }

        // Check if the image is too large (max 1MB)
        if (formData.profilePicture.length > 1000000) {
          setError('Image is too large. Please choose an image smaller than 1MB.');
          setLoading(false);
          return;
        }
      }

      const response = await axios.put(API_ENDPOINTS.CUSTOMER.UPDATE_PROFILE, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        profilePicture: formData.profilePicture
      }, {
        params: { email }
      });
      
      if (response.data === "Profile updated successfully!") {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        // Refetch profile to update UI
        const profileResponse = await axios.get(API_ENDPOINTS.CUSTOMER.PROFILE, { params: { email } });
        setProfile(profileResponse.data);
        setFormData({
          name: profileResponse.data.name,
          email: profileResponse.data.email,
          phoneNumber: profileResponse.data.phoneNumber,
          profilePicture: profileResponse.data.profilePicture || 'https://source.unsplash.com/random/200x200/?portrait'
        });
      } else {
        setError(response.data || 'Failed to update profile. Please try again.');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      setLoading(true);
      setError('');
      const email = localStorage.getItem('userEmail');
      await axios.put(API_ENDPOINTS.CUSTOMER.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        params: { email }
      });
      setSuccess('Password updated successfully!');
      setChangePasswordOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', minWidth: '100vw', height: '100vh', width: '100vw', p: 0, m: 0, pt: 4, px: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', p: 0, m: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              My Profile
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Avatar
                    src={profile.profilePicture}
                    sx={{ 
                      width: { xs: 120, md: 160 }, 
                      height: { xs: 120, md: 160 },
                      borderRadius: 2,
                      boxShadow: 3
                    }}
                  />
                  {editMode && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Change Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData(prev => ({
                                  ...prev,
                                  profilePicture: event.target.result
                                }));
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={editMode ? formData.name : profile.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle />
                            </InputAdornment>
                          ),
                        }}
                        variant={editMode ? "outlined" : "filled"}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={editMode ? formData.email : profile.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                        variant={editMode ? "outlined" : "filled"}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={editMode ? formData.phoneNumber : profile.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                        variant={editMode ? "outlined" : "filled"}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => setChangePasswordOpen(true)}
                  sx={{ mr: 2.5 }}
                >
                  Change Password
                </Button>
                <Box>
                  {editMode ? (
                    <>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleEditToggle}
                        startIcon={<Cancel />}
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleProfileUpdate}
                        startIcon={<Save />}
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleEditToggle}
                      startIcon={<Edit />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
        
        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Current Password"
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                fullWidth
                margin="dense"
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                fullWidth
                margin="dense"
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordUpdate} variant="contained" color="primary">
              Update Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserProfile;