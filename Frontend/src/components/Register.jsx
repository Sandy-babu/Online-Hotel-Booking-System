import { useState, useEffect } from 'react';
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
  CardContent,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Hotel, AdminPanelSettings, Person } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'admin');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    if (!isAdmin && (role === 'admin' || role === 'hotel_manager')) {
      setError('Only admins can create admin or hotel manager accounts');
      return;
    }
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      let response;
      switch(formData.role) {
        case 'admin':
          response = await axios.post(API_ENDPOINTS.ADMIN.SIGNUP, {
            username: formData.username,
            email: formData.email,
            password: formData.password
          });
          break;
        case 'hotel_manager':
          if (!isAdmin) {
            throw new Error('Only admins can create manager accounts');
          }
          response = await axios.post(API_ENDPOINTS.ADMIN.CREATE_MANAGER, {
            username: formData.username,
            email: formData.email,
            password: formData.password
          });
          break;
        case 'customer':
          response = await axios.post(API_ENDPOINTS.CUSTOMER.SIGNUP, {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          });
          break;
        default:
          throw new Error('Invalid role');
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const RoleCard = ({ role, icon, title, disabled }) => (
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        mx: 'auto',
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-5px)',
          boxShadow: disabled ? 'none' : '0 8px 16px rgba(0, 0, 0, 0.12)',
          border: disabled ? 'none' : '2px solid #2196f3'
        }
      }}
    >
      <CardActionArea 
        onClick={() => !disabled && handleRoleSelect(role)}
        sx={{ 
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
        disabled={disabled}
      >
        <Box sx={{ 
          display: 'inline-flex', 
          p: 1, 
          borderRadius: '50%',
          bgcolor: formData.role === role ? 'primary.light' : 'grey.100',
          mb: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: disabled ? 'grey.100' : 'primary.light'
          }
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
          {title}
        </Typography>
        {disabled && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Admin access required
          </Typography>
        )}
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
            Create your account to get started
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', mb: 4 }}>
          <RoleCard
            role="admin"
            icon={<AdminPanelSettings sx={{ fontSize: 40, color: formData.role === 'admin' ? 'primary.main' : 'grey.600' }} />}
            title="Admin"
            disabled={!isAdmin}
          />
          <RoleCard
            role="hotel_manager"
            icon={<Hotel sx={{ fontSize: 40, color: formData.role === 'hotel_manager' ? 'primary.main' : 'grey.600' }} />}
            title="Hotel Manager"
            disabled={!isAdmin}
          />
          <RoleCard
            role="customer"
            icon={<Person sx={{ fontSize: 40, color: formData.role === 'customer' ? 'primary.main' : 'grey.600' }} />}
            title="Customer"
          />
        </Box>

        {error && (
          <Typography color="error" align="center" gutterBottom>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, maxWidth: '340px', mx: 'auto', width: '100%' }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
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

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            Create Account
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/login')}
              sx={{ 
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  color: 'primary.dark',
                }
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;