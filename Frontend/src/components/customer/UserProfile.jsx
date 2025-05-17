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
        
        // This would typically be an API call
        // For now, we'll use localStorage data and mock additional fields
        const userStr = localStorage.getItem('user');
        const email = localStorage.getItem('userEmail');
        
        if (!userStr || !email) {
          navigate('/login');
          return;
        }
        
        const userData = JSON.parse(userStr);
        
        // Mock data for now - in a real app this would come from an API
        const mockUserProfile = {
          id: '1',
          username: userData.username || 'user1',
          name: userData.name || 'John Doe',
          email: email,
          phoneNumber: userData.phoneNumber || '+1 (555) 123-4567',
          profilePicture: userData.profilePicture || 'https://source.unsplash.com/random/200x200/?portrait'
        };
        
        setProfile(mockUserProfile);
        setFormData({
          name: mockUserProfile.name,
          email: mockUserProfile.email,
          phoneNumber: mockUserProfile.phoneNumber,
          profilePicture: mockUserProfile.profilePicture
        });
        
      } catch (err) {
        console.error('Error fetching user profile:', err);
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
      
      // In a real app, make an API call to update the profile
      // For this demo, we'll just update the local state
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the profile state
      setProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePicture: formData.profilePicture
      }));
      
      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedUserData = {
          ...userData,
          name: formData.name
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        localStorage.setItem('userEmail', formData.email);
      }
      
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    try {
      // Validation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      setLoading(true);
      
      // In a real app, make an API call to update the password
      // For this demo, we'll just simulate a successful update
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccess('Password updated successfully!');
      setChangePasswordOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              My Profile
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/customer/dashboard')} 
              sx={{ borderRadius: 2 }}
            >
              Back to Dashboard
            </Button>
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