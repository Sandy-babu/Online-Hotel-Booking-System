# Online Hotel Booking System Documentation

## Introduction

The Online Hotel Booking System is a comprehensive web application that provides a platform for hotel booking management. It consists of a React frontend and a Spring Boot backend, offering different interfaces for customers, hotel managers, and administrators.

## System Architecture

### Frontend
- Built with React 18 and Vite
- Material UI 7.1.0 for UI components
- React Router 7.6.0 for navigation
- Axios for API communication
- Date-fns for date management

### Backend
- Spring Boot application
- JWT-based authentication and authorization
- BCrypt password encoding
- RESTful API design
- CORS configuration for frontend-backend communication

## Features

### User Management
- Role-based authentication (Customer, Hotel Manager, Admin)
- User registration and login
- Profile management
- Password change functionality

### Customer Features
- Browse hotels and rooms
- Search and filter hotels/rooms based on various criteria
- View hotel and room details
- Make and manage bookings
- View booking history with past/upcoming filtering
- Cancel bookings
- Receive notifications

### Hotel Manager Features
- Manage hotels (add, edit, delete)
- Manage rooms (add, edit, delete)
- View and manage bookings
- Dashboard with booking statistics
- Process booking cancellations
- Communicate with guests
- Generate reports

### Admin Features
- User management
- System oversight
- Create and manage hotel managers

### Notification System
- Real-time notifications
- Notification center with read/unread status
- Email notifications (configurable)
- Booking status updates

## Component Structure

### Frontend Components

#### Core Components
- `App.jsx` - Main application component
- `Login.jsx` - Authentication component
- `Register.jsx` - User registration component
- `Dashboard.jsx` - User dashboard based on role
- `NotificationProvider.jsx` - Global notification system

#### Customer Components
- `Homepage.jsx` - Landing page for customers
- `Layout.jsx` - Layout wrapper for customer pages
- `UserProfile.jsx` - Customer profile management
- `HotelSearch.jsx` - Search and filter hotels
- `RoomFilter.jsx` - Search and filter rooms
- `HotelDetails.jsx` - Detailed hotel information
- `BookingForm.jsx` - Form for making bookings
- `Bookings.jsx` - Manage and view bookings

#### Manager Components
- `HotelManagement.jsx` - Add/edit/delete hotels
- `RoomManagement.jsx` - Add/edit/delete rooms
- `BookingManagement.jsx` - Manage customer bookings

### Backend Structure

#### Configuration
- `SecurityConfig.java` - Security and authentication configuration
- `WebConfig.java` - Web MVC configuration

#### Controllers
- Authentication controllers
- Customer controllers
- Hotel management controllers
- Booking controllers

#### Services
- User services
- Hotel services
- Booking services
- Notification services

#### Repositories
- JPA repositories for data access

#### Security
- JWT handling
- Authentication filters

## API Endpoints

### Authentication
- `/customer/signup` - Register new customer (POST)
- `/customer/login` - Customer login (POST)
- `/manager/login` - Hotel manager login (POST)
- `/admin/login` - Admin login (POST)

### Customer APIs
- `/customer/hotels` - Get all hotels (GET)
- `/customer/hotels/search` - Search hotels (GET)
- `/customer/hotels/rooms` - Get all rooms (GET)
- `/customer/hotels/rooms/filter` - Filter rooms (GET)
- `/customer/hotels/{id}` - Get hotel details (GET)

### Manager APIs
- `/manager/hotel/add` - Add new hotel (POST)
- `/manager/hotel/view` - View managed hotels (GET)
- `/manager/hotel/update/by-id/**` - Update hotel (PUT)
- `/manager/hotel/delete/by-id/**` - Delete hotel (DELETE)
- `/manager/room/add` - Add room (POST)
- `/manager/room/view` - View rooms (GET)
- `/manager/room/update/**` - Update room (PUT)
- `/manager/room/delete/**` - Delete room (DELETE)

## Security Implementation

- Stateless JWT-based authentication
- CORS configuration for development (localhost:5173)
- Role-based access control
- Password encryption using BCrypt
- Protected API endpoints

## Installation and Setup

### Frontend Setup
1. Navigate to the Frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Backend Setup
1. Navigate to the login_backend-master directory
2. Install Maven dependencies 
3. Configure application.properties/application.yml
4. Run the Spring Boot application

## Technology Stack

### Frontend
- React
- Material UI
- Axios
- React Router
- Date-fns

### Backend
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- BCrypt

## Future Enhancements
- Payment gateway integration
- Advanced reporting and analytics
- Mobile application development
- Multi-language support
- Review and rating system