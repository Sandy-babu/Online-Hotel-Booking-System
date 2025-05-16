const express = require('express');
const { getHotels, getHotelById } = require('../controllers/hotelController');
const db = require('../config/db'); // Ensure the database connection is imported

const router = express.Router();

// Define the addHotel function
const addHotel = async (req, res) => {
    const { name, location, price_per_night, amenities } = req.body;
    try {
      // Test the database connection
      await db.getConnection();
  
      // Insert the hotel into the database
      await db.query(
        'INSERT INTO hotels (name, location, price_per_night, amenities) VALUES (?, ?, ?, ?)',
        [name, location, price_per_night, amenities]
      );
      res.status(201).json({ message: 'Hotel added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding hotel', error });
    }
  };

// Define routes
router.get('/hotels', getHotels); // Get all hotels
router.get('/hotels/:id', getHotelById); // Get a specific hotel by ID
router.post('/hotels', (req, res, next) => {
    console.log('POST /hotels route hit');
    next();
  }, addHotel);

module.exports = router;