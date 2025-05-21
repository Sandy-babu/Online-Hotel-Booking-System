const express = require('express');
const router = express.Router();

// Get user's bookings
router.get('/user', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // TODO: Implement database query to get user's bookings
    // For now, return mock data
    const mockBookings = [
      {
        id: 1,
        hotelName: "Grand Hotel",
        roomType: "Deluxe Room",
        checkIn: "2024-03-20",
        checkOut: "2024-03-25",
        guests: 2,
        totalPrice: 500,
        status: "confirmed",
        bookingReference: "BK123456"
      }
    ];
    
    res.json(mockBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Create booking
router.post('/create', async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests, totalPrice, bookingReference, specialRequests } = req.body;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // TODO: Implement database query to create booking
    // For now, return success
    res.json({ 
      id: Math.floor(Math.random() * 1000),
      status: 'confirmed',
      bookingReference
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // TODO: Implement database query to cancel booking
    // For now, return success
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router; 