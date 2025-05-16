import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import HotelIcon from '@mui/icons-material/Hotel';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import BookOnlineIcon from '@mui/icons-material/BookOnline';

const Layout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="primary" elevation={3}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HotelIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" component={Link} to="/" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 700, letterSpacing: 1 }}>
              StayEase
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/" startIcon={<HomeIcon />}>Home</Button>
            <Button color="inherit" component={Link} to="/customer/hotels" startIcon={<HotelIcon />}>Browse Hotels</Button>
            <Button color="inherit" component={Link} to="/customer/bookings" startIcon={<BookOnlineIcon />}>My Bookings</Button>
            <Button color="inherit" component={Link} to="/customer/profile" startIcon={<AccountCircle />}>Profile</Button>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} disableGutters sx={{ flex: 1, px: 0, py: 0 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ bgcolor: 'primary.main', color: '#fff', py: 3, mt: 6 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} StayEase. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <MuiLink href="#" color="inherit" underline="hover">Contact</MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">Instagram</MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">Facebook</MuiLink>
            <MuiLink href="#" color="inherit" underline="hover">Twitter</MuiLink>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 