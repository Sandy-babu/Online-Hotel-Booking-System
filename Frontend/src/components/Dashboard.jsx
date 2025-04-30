import { useEffect, useState } from 'react';
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
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AdminPanelSettings, 
  Hotel, 
  Person,
  Logout,
  Hotel as HotelIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (!role) {
      navigate('/login');
    } else {
      setUserRole(role);
      setUserEmail(email);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
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

  const getDashboardContent = () => {
    switch(userRole) {
      case 'admin':
        return [
          { title: 'Manage Hotels', icon: <HotelIcon />, description: 'View and manage all hotels in the system' },
          { title: 'Manage Users', icon: <PeopleIcon />, description: 'Manage all user accounts and permissions' },
          { title: 'System Settings', icon: <SettingsIcon />, description: 'Configure system-wide settings' }
        ];
      case 'hotel_manager':
        return [
          { title: 'My Hotel', icon: <HotelIcon />, description: 'Manage your hotel details and rooms' },
          { title: 'Bookings', icon: <PeopleIcon />, description: 'View and manage hotel bookings' },
          { title: 'Reports', icon: <SettingsIcon />, description: 'View hotel performance reports' }
        ];
      case 'customer':
        return [
          { title: 'Book a Room', icon: <HotelIcon />, description: 'Search and book hotel rooms' },
          { title: 'My Bookings', icon: <PeopleIcon />, description: 'View your current and past bookings' },
          { title: 'Profile', icon: <SettingsIcon />, description: 'Manage your account settings' }
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
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 