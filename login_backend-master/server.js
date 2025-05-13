const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express(); // Initialize app first
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
const hotelRoutes = require('./routes/hotelRoutes');
const auth = require('./middlewares/auth');
const authenticateToken = require('./middlewares/auth');


const PORT = 9000;
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key



const db = require('./config/db'); // Adjust the path to your db.js file

db.getConnection()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

module.exports = authenticateToken;
const users = []; // Temporary in-memory storage for users
// code starts here for the booking system

//This implementation provides a complete flow for customers to:
// Browse available hotels
// Filter hotels by location and price
// View hotel details and available rooms
// Book rooms by selecting dates and number of guests
// Make payments for bookings
// View and manage their bookings



// Bookings storage
const bookings = [];

// Get all hotels
app.get('/hotels', (req, res) => {
  // Filter by location and price if provided in query parameters
  const { location, minPrice, maxPrice } = req.query;
  let filteredHotels = [...hotels];

  if (location) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (minPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price >= Number(minPrice));
  }

  if (maxPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price <= Number(maxPrice));
  }

  res.json(filteredHotels);
});

// Get hotel by ID
app.get('/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === parseInt(req.params.id));
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  res.json(hotel);
});

// Book a room
app.post('/bookings', authenticateToken, async (req, res) => {
  const { hotelId, roomId, checkIn, checkOut, guests, totalPrice } = req.body;
  
  
  // Find hotel and room
  const hotel = hotels.find(h => h.id === parseInt(hotelId));
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  
  const room = hotel.rooms.find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  if (!room.available) {
    return res.status(400).json({ message: 'Room is not available' });
  }
  
  // Create booking
  const booking = {
    id: bookings.length + 1,
    userId: req.user.email,
    hotelId: parseInt(hotelId),
    roomId: parseInt(roomId),
    hotelName: hotel.name,
    roomType: room.type,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status: 'confirmed',
    bookingDate: new Date().toISOString()
  };
  
  // Mark room as unavailable
  room.available = false;
  
  // Save booking
  bookings.push(booking);
  
  res.status(201).json({ message: 'Booking confirmed', booking });
});

// Process payment
app.post('/payments', authenticateToken, async (req, res) => {
  const { bookingId, cardNumber, expiryDate, cvv, nameOnCard } = req.body;

  // Example: Fetch booking details from the database
  const [booking] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [bookingId, req.user.id]);

  if (booking.length === 0) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Simulate payment processing
  await db.query('UPDATE bookings SET payment_status = ? WHERE id = ?', ['paid', bookingId]);

  res.json({ 
    message: 'Payment successful',
    receiptNumber: `RCPT-${Date.now()}`,
    paymentDate: new Date().toISOString(),
    amount: booking[0].total_price
  });
});

// Get user bookings
app.get('/bookings', authenticateToken, (req, res) => {
  const userBookings = bookings.filter(booking => booking.userId === req.user.email);
  res.json(userBookings);
});

// Cancel booking
app.put('/bookings/:id/cancel', authenticateToken, (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.email);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  booking.status = 'cancelled';
  
  // Make the room available again
  const hotel = hotels.find(h => h.id === booking.hotelId);
  if (hotel) {
    const room = hotel.rooms.find(r => r.id === booking.roomId);
    if (room) {
      room.available = true;
    }
  }
  
  res.json({ message: 'Booking cancelled successfully', booking });
});

//code ends here for the booking system

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Use hotel routes
app.use('/api', hotelRoutes);




// Signup Route
app.post('/customer/signup', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  // Check if the user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user
  users.push({ email, password: hashedPassword });

  // Return success response
  res.status(201).json({ message: 'User registered successfully' });
});

// Login Route
app.post('/customer/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  // Find the user
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token
  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });

  // Return the token
  res.json({ token });
});




// Public route (no authentication required)
app.get('/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

// Protected route (authentication required)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Example: Protecting a payments route
app.post('/payments', authenticateToken, (req, res) => {
  const { bookingId, cardNumber, expiryDate, cvv, nameOnCard } = req.body;

  // Simulate payment processing
  res.json({ message: 'Payment processed successfully' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:9000`);
});