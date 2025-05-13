const db = require('./../config/db'); // Adjust the path to your db.js file

// Fetch all hotels
const getHotels = async (req, res) => {
  try {
    const [hotels] = await db.query('SELECT * FROM hotels');
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels', error });
  }
};

// Fetch a single hotel by ID
const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (hotel.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel', error });
  }
};

module.exports = { getHotels, getHotelById };