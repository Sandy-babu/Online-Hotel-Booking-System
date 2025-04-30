import { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Link,
  Fade,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Hotel, AdminPanelSettings, Person } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    setShowLoginForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      switch(formData.role) {
        case 'admin':
          response = await axios.post(API_ENDPOINTS.ADMIN.LOGIN, {
            email: formData.email,
            password: formData.password
          });
          break;
        case 'hotel_manager':
          response = await axios.post(API_ENDPOINTS.MANAGER.LOGIN, {
            email: formData.email,
            password: formData.password
          });
          break;
        case 'customer':
          response = await axios.post(API_ENDPOINTS.CUSTOMER.LOGIN, {
            email: formData.email,
            password: formData.password
          });
          break;
        default:
          throw new Error('Invalid role');
      }

      console.log('Login Response:', response.data);

      // Check if the response indicates successful login
      if (response.data === 'Login successful!') {
        // Store role and email in localStorage
        localStorage.setItem('role', formData.role);
        localStorage.setItem('email', formData.email);
        
        // Redirect based on role after successful login
        switch(formData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'hotel_manager':
            navigate('/manager/dashboard');
            break;
          case 'customer':
            navigate('/customer/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        // Handle error messages from the backend
        setError(response.data);
      }
    } catch (err) {
      console.log('Login Error:', err.response?.data || err);
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || 'Invalid credentials');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred. Please try again.');
      }
    }
  };

  const RoleCard = ({ role, icon, title }) => (
    <Card 
      sx={{ 
        height: 120,
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        minHeight: 120,
        maxHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: formData.role === role ? '2px solid #2196f3' : 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        mx: 'auto',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
          border: '2px solid #2196f3'
        }
      }}
    >
      <CardActionArea 
        onClick={() => handleRoleSelect(role)}
        sx={{ 
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
      >
        <Box sx={{ 
          display: 'inline-flex', 
          p: 1, 
          borderRadius: '50%',
          bgcolor: formData.role === role ? 'primary.light' : 'grey.100',
          mb: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'primary.light'
          }
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
          {title}
        </Typography>
      </CardActionArea>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: `linear-gradient(rgba(30, 41, 59, 0.5), rgba(30, 41, 59, 0.5)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat`,
      backgroundAttachment: 'fixed',
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            mt: 2,
            fontWeight: 700,
            color: 'primary.main'
          }}>
            Online Hotel Booking System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {showLoginForm ? `Sign in as ${formData.role}` : 'Please select your role to continue'}
          </Typography>
        </Box>

        {!showLoginForm ? (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', mb: 4 }}>
            <RoleCard
              role="admin"
              icon={<AdminPanelSettings sx={{ fontSize: 40, color: formData.role === 'admin' ? 'primary.main' : 'grey.600' }} />}
              title="Admin"
            />
            <RoleCard
              role="hotel_manager"
              icon={<Hotel sx={{ fontSize: 40, color: formData.role === 'hotel_manager' ? 'primary.main' : 'grey.600' }} />}
              title="Hotel Manager"
            />
            <RoleCard
              role="customer"
              icon={<Person sx={{ fontSize: 40, color: formData.role === 'customer' ? 'primary.main' : 'grey.600' }} />}
              title="Customer"
            />
          </Box>
        ) : (
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              mt: 3,
              maxWidth: '340px',
              mx: 'auto',
              width: '100%'
            }}
          >
            {error && (
              <Typography color="error" align="center" gutterBottom>
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                }
              }}
            >
              Sign In
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => {
                setShowLoginForm(false);
                setFormData(prev => ({ ...prev, email: '', password: '' }));
              }}
              sx={{ 
                mt: 1,
                mb: 2,
                py: 1.5,
                borderRadius: '8px',
              }}
            >
              Back to Role Selection
            </Button>
          </Box>
        )}

        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => navigate('/register')}
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              '&:hover': {
                color: 'primary.dark',
              }
            }}
          >
            Register here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;