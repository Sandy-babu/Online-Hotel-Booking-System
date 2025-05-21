# StayEase - Hotel Booking Platform

## 1. Title
StayEase - A Comprehensive Hotel Booking Management System

## 2. Description

### 2.1 Overview
StayEase is a full-stack web application that revolutionizes the hotel booking experience. Built with React and Spring Boot, it provides a seamless platform for customers to book hotels, managers to manage their properties, and administrators to oversee the entire system. The platform features a modern, responsive design with Material-UI components and implements secure authentication, real-time notifications, and comprehensive booking management.

### 2.2 Key Features

#### Customer Features
- **User Authentication & Profile Management**
  - Secure login and registration
  - Profile management with personal information
  - Profile picture upload and management
  - Password change functionality

- **Hotel Search & Booking**
  - Advanced hotel search with filters (location, price range)
  - Detailed hotel information with images
  - Room availability checking
  - Real-time booking system
  - Secure payment processing
  - Booking confirmation with reference numbers

- **Booking Management**
  - View all bookings (upcoming, past, cancelled)
  - Detailed booking information
  - Booking cancellation functionality
  - Special requests submission
  - Email notifications for booking status

#### Hotel Manager Features
- **Hotel Management**
  - Add, edit, and delete hotel properties
  - Upload and manage hotel images
  - Set hotel details (name, address, contact)
  - Manage amenities and facilities

- **Room Management**
  - Add, edit, and delete rooms
  - Set room types and prices
  - Manage room availability
  - Configure room amenities

- **Booking Management**
  - View all bookings for managed hotels
  - Filter bookings by status and date
  - Process booking cancellations
  - View booking statistics
  - Real-time booking notifications

- **Reporting**
  - Generate occupancy reports
  - View revenue analytics
  - Track booking trends
  - Monitor hotel performance

#### Admin Features
- **User Management**
  - Create and manage admin accounts
  - Create and manage hotel manager accounts
  - View and manage all user accounts
  - Monitor user activities

- **System Oversight**
  - View all bookings across all hotels
  - Monitor system-wide statistics
  - Access comprehensive reports
  - Manage system settings

- **Booking Management**
  - View and manage all bookings
  - Filter and search bookings
  - Process booking cancellations
  - Monitor booking trends

#### Technical Features
- **Security**
  - JWT-based authentication
  - Role-based access control
  - Secure password hashing
  - Protected API endpoints

- **Real-time Updates**
  - Booking status notifications
  - Email notifications
  - Real-time booking updates
  - Instant payment confirmations

- **Data Management**
  - Efficient database operations
  - Image storage and management
  - Booking data enrichment
  - Comprehensive error handling

- **User Interface**
  - Responsive Material-UI design
  - Intuitive navigation
  - Modern dashboard layouts
  - Interactive booking forms
  - Real-time search and filtering
  - Detailed booking views
  - Comprehensive admin controls

#### Payment Processing
- Secure credit card processing
- Payment validation
- Booking reference generation
- Payment confirmation
- Refund handling for cancellations

#### Notification System
- Real-time booking notifications
- Email confirmations
- Status update notifications
- Payment confirmations
- Cancellation notifications

## 3. Technical Implementation Details

### 3.1 Authentication & Authorization
- **JWT Implementation**
  - Token-based authentication using JWT (JSON Web Tokens)
  - Token storage in localStorage with secure handling
  - Automatic token refresh mechanism
  - Token expiration handling
  - Protected route implementation using React Router

- **Role-Based Access Control**
  - User roles: ADMIN, HOTEL_MANAGER, CUSTOMER
  - Role-specific route protection
  - Role-based component rendering
  - Permission-based API access

### 3.2 Database Schema
- **User Table**
  ```sql
  CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture MEDIUMBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- **Hotel Table**
  ```sql
  CREATE TABLE hotels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact VARCHAR(255),
    manager_id BIGINT,
    image MEDIUMBLOB,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
  );
  ```

- **Room Table**
  ```sql
  CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT true,
    amenities TEXT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
  );
  ```

- **Booking Table**
  ```sql
  CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    booking_reference VARCHAR(100) UNIQUE,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
  );
  ```

### 3.3 API Endpoints

#### Authentication Endpoints
```java
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
```

#### Customer Endpoints
```java
GET /customer/hotels
GET /customer/hotels/{id}
GET /customer/rooms
GET /customer/bookings
POST /customer/booking/create
PUT /customer/booking/{id}/cancel
GET /customer/profile
PUT /customer/profile/update
```

#### Manager Endpoints
```java
GET /manager/hotel/view
POST /manager/hotel/create
PUT /manager/hotel/update
DELETE /manager/hotel/delete
GET /manager/rooms
POST /manager/room/create
PUT /manager/room/update
DELETE /manager/room/delete
GET /manager/bookings
```

#### Admin Endpoints
```java
GET /admin/users
POST /admin/user/create
PUT /admin/user/update
DELETE /admin/user/delete
GET /customer/booking/admin/all
```

### 3.4 Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── admin/
│   │   ├── BookingManagement.jsx
│   │   └── UserManagement.jsx
│   ├── customer/
│   │   ├── BookingForm.jsx
│   │   ├── HotelDetails.jsx
│   │   ├── HotelSearch.jsx
│   │   └── UserProfile.jsx
│   ├── manager/
│   │   ├── BookingManagement.jsx
│   │   ├── HotelManagement.jsx
│   │   └── RoomManagement.jsx
│   └── common/
│       ├── Layout.jsx
│       ├── Login.jsx
│       └── Register.jsx
├── config/
│   ├── api.js
│   └── theme.js
└── utils/
    ├── auth.js
    └── validation.js
```

### 3.5 Security Implementation

#### Password Security
- BCrypt password hashing
- Password strength validation
- Secure password reset flow
- Session management

#### API Security
- CORS configuration
- Request rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### 3.6 Image Handling
- Base64 encoding for profile pictures
- MEDIUMBLOB storage for hotel images
- Image compression and optimization
- Secure image upload validation

### 3.7 State Management
- React Context for global state
- Local state management with useState
- API state management with axios
- Form state management

### 3.8 Error Handling
- Global error boundary
- API error interceptors
- Form validation
- User-friendly error messages
- Error logging

### 3.9 Testing
- Unit tests for components
- Integration tests for API endpoints
- End-to-end testing
- Performance testing

### 3.10 Deployment
- Frontend: React build optimization
- Backend: Spring Boot deployment
- Database: MySQL configuration
- Environment variables management
- SSL/TLS configuration 