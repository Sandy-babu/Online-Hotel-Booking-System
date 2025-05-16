const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_booking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return false;
    }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
    try {
        // Drop existing tables in reverse order to handle foreign key constraints
        await pool.query('DROP TABLE IF EXISTS bookings');
        await pool.query('DROP TABLE IF EXISTS rooms');
        await pool.query('DROP TABLE IF EXISTS hotels');
        await pool.query('DROP TABLE IF EXISTS users');

        // Create users table first (no foreign key dependencies)
        await pool.query(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        // Create hotels table
        await pool.query(`
            CREATE TABLE hotels (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Hotels table created successfully');

        // Create rooms table (depends on hotels)
        await pool.query(`
            CREATE TABLE rooms (
                id INT PRIMARY KEY AUTO_INCREMENT,
                hotel_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
            )
        `);
        console.log('Rooms table created successfully');

        // Create bookings table (depends on users, hotels, and rooms)
        await pool.query(`
            CREATE TABLE bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                hotel_id INT NOT NULL,
                room_id INT NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests INT NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
                payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
                FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
            )
        `);
        console.log('Bookings table created successfully');

        // Insert some sample data
        await pool.query(`
            INSERT INTO hotels (name, location, description, price) VALUES
            ('Grand Hotel', 'New York', 'Luxury hotel in downtown', 299.99),
            ('Seaside Resort', 'Miami', 'Beachfront resort with ocean view', 399.99)
        `);

        await pool.query(`
            INSERT INTO rooms (hotel_id, type, price, available) VALUES
            (1, 'Deluxe', 299.99, true),
            (1, 'Suite', 499.99, true),
            (2, 'Ocean View', 399.99, true),
            (2, 'Presidential Suite', 799.99, true)
        `);

        console.log('Sample data inserted successfully');
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
};

// Initialize database on startup
testConnection()
    .then(success => {
        if (success) {
            initializeDatabase()
                .catch(error => {
                    console.error('Failed to initialize database:', error);
                    process.exit(1);
                });
        } else {
            console.error('Failed to connect to database');
            process.exit(1);
        }
    });

module.exports = pool;