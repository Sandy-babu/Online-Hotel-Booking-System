import { useEffect, useState, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { 
   
  Hotel, 
  Person,
  Logout,
 
 
 
  Visibility,
  VisibilityOff,
  
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [openCreateManager, setOpenCreateManager] = useState(false);
  const [openCreateAdmin, setOpenCreateAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (!userData.role) {
        navigate('/login');
        return;
      }
      setUserRole(userData.role);
      setUserEmail(userData.email);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = formRef.current;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.SIGNUP, {
        username,
        email,
        password,
        confirmPassword
      });

      // Check if the response contains an error message
      if (response.data === 'Email is already registered.' || 
          response.data === 'Username is already taken.' ||
          response.data === 'Password and Confirm Password do not match.') {
        setError(response.data);
        return;
      }

      if (response.data === 'Admin registered successfully.') {
        setSuccess('Admin account created successfully!');
        form.reset();
        
        setTimeout(() => {
          setOpenCreateAdmin(false);
          setSuccess('');
        }, 2000);
      } else {
        setError('Failed to create admin account. Please try again.');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err.response?.data || 'Failed to create admin account');
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = formRef.current;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.CREATE_MANAGER, {
        username,
        email,
        password,
        confirmPassword
      });

      // Check if the response contains an error message
      if (response.data === 'Email is already registered.' || 
          response.data === 'Username is already taken.' ||
          response.data === 'Password and Confirm Password do not match.') {
        setError(response.data);
        return;
      }

      if (response.data === 'Manager created successfully by Admin.') {
        setSuccess('Manager account created successfully!');
        form.reset();
        
        setTimeout(() => {
          setOpenCreateManager(false);
          setSuccess('');
        }, 2000);
      } else {
        setError('Failed to create manager account. Please try again.');
      }
    } catch (err) {
      console.error('Error creating manager:', err);
      setError(err.response?.data || 'Failed to create manager account');
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'admin':
        return <AdminPanelSettings sx={{ fontSize: 40 }} />;
      case 'hotel_manager':
        return <Hotel sx={{ fontSize: 40 }} />;
      case 'customer':
        return <Person sx={{ fontSize: 40 }} />;
      default:
        return <Person sx={{ fontSize: 40 }} />;
    }
  };

  const getRoleTitle = () => {
    switch(userRole) {
      case 'admin':
        return 'Administrator';
      case 'hotel_manager':
        return 'Hotel Manager';
      case 'customer':
        return 'Customer';
      default:
        return 'User';
    }
  };

  /*const getDashboardContent = () => {
    switch(userRole) {
      case 'admin':
        return [
          { 
            title: 'Create Admin', 
            icon: <AdminPanelSettings />, 
            description: 'Create a new administrator account',
            action: () => setOpenCreateAdmin(true)
          },
          { 
            title: 'Create Manager', 
            icon: <AddIcon />, 
            description: 'Create a new hotel manager account',
            action: () => setOpenCreateManager(true)
          },
          { 
            title: 'View All Hotels', 
            icon: <HotelIcon />, 
            description: 'View all hotels in the system',
            action: () => navigate('/manager/hotels')
          }
        ];
      case 'hotel_manager':
        return [
          { 
            title: 'Manage Hotels', 
            icon: <HotelIcon />, 
            description: 'Manage your hotel details',
            action: () => navigate('/manager/hotels')
          },
          { 
            title: 'Manage Rooms', 
            icon: <HotelIcon />, 
            description: 'Manage hotel rooms',
            action: () => navigate('/manager/rooms')
          },
          { 
            title: 'Bookings', 
            icon: <PeopleIcon />, 
            description: 'View and manage hotel bookings' 
          },
          { 
            title: 'Reports', 
            icon: <SettingsIcon />, 
            description: 'View hotel performance reports' 
          }
        ];
      case 'customer':
        return [
          { 
            title: 'Search Hotels', 
            icon: <HotelIcon />, 
            description: 'Search and view available hotels',
            action: () => navigate('/customer/hotels')
          },
          { 
            title: 'Filter Rooms', 
            icon: <HotelIcon />, 
            description: 'Search and filter available rooms',
            action: () => navigate('/customer/rooms')
          },
          { 
            title: 'My Bookings', 
            icon: <PeopleIcon />, 
            description: 'View your current and past bookings' 
          },
          { 
            title: 'Profile', 
            icon: <SettingsIcon />, 
            description: 'Manage your account settings' 
          }
        ];
      default:
        return [];
    }
  }; */

  const getDashboardContent = () => {
  switch(userRole) {
    case 'admin':
      return [
        { 
          title: 'Create Admin', 
          icon: <AdminPanelSettings />, 
          description: 'Create a new administrator account',
          action: () => setOpenCreateAdmin(true)
        },
        { 
          title: 'Create Manager', 
          icon: <AddIcon />, 
          description: 'Create a new hotel manager account',
          action: () => setOpenCreateManager(true)
        },
        {
          title: 'All Bookings',
          icon: <PeopleIcon />,
          description: 'View all bookings for all hotels',
          action: () => navigate('/admin/BookingManagement')
        },
        // Add more admin actions as needed
      ];
    case 'hotel_manager':
      return [
        { 
          title: 'My Hotel', 
          icon: <HotelIcon />, 
          description: 'Manage your hotel details and rooms',
          action: () => navigate('/manager/hotels')
        },
        { 
          title: 'Bookings', 
          icon: <PeopleIcon />, 
          description: 'View and manage hotel bookings',
          action: () => navigate('/manager/bookings')
        },
        /*{ 
          title: 'Reports', 
          icon: <SettingsIcon />, 
          description: 'View hotel performance reports',
          action: () => navigate('/manager/reports')
        }*/
      ];
    case 'customer':
      return [
        { 
          title: 'Browse Hotels', 
          icon: <HotelIcon />, 
          description: 'Search and book hotel rooms',
          action: () => navigate('/customer/hotels')
        },
        { 
          title: 'My Bookings', 
          icon: <PeopleIcon />, 
          description: 'View your current and past bookings',
          action: () => navigate('/customer/bookings')
        },
        { 
          title: 'Profile', 
          icon: <SettingsIcon />, 
          description: 'Manage your account settings',
          action: () => console.log('Profile action') // You can implement this later
        }
      ];
    default:
      return [];
  }
};

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: `linear-gradient(rgba(30, 41, 59, 0.5), rgba(30, 41, 59, 0.5)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat`,
      backgroundAttachment: 'fixed',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {getRoleIcon()}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                  {getRoleTitle()} Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userEmail}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Logout
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quick Actions
          </Typography>

          <Grid container spacing={3}>
            {getDashboardContent().map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 2
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" component="h2">
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={item.action}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {item.title.startsWith('Create') ? 'Create' : 'View Details'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Create Admin Dialog */}
          <Dialog 
            open={openCreateAdmin} 
            onClose={() => {
              setOpenCreateAdmin(false);
              setError('');
              setSuccess('');
              if (formRef.current) {
                formRef.current.reset();
              }
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create New Admin Account</DialogTitle>
            <form ref={formRef} onSubmit={handleCreateAdmin}>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => {
                    setOpenCreateAdmin(false);
                    setError('');
                    setSuccess('');
                    if (formRef.current) {
                      formRef.current.reset();
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  Create Admin
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Create Manager Dialog */}
          <Dialog 
            open={openCreateManager} 
            onClose={() => {
              setOpenCreateManager(false);
              setError('');
              setSuccess('');
              if (formRef.current) {
                formRef.current.reset();
              }
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create New Manager Account</DialogTitle>
            <form ref={formRef} onSubmit={handleCreateManager}>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => {
                    setOpenCreateManager(false);
                    setError('');
                    setSuccess('');
                    if (formRef.current) {
                      formRef.current.reset();
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  Create Manager
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 