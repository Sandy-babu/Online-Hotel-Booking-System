# Online Hotel Booking System Documentation


# comprehensive documentation file for your Online Hotel Booking System. The documentation provides a thorough overview of your project, covering all key aspects including:

# The system architecture (frontend React and backend Spring Boot)
# User management and role-based permissions
# Features available to customers, hotel managers, and administrators
# Detailed API endpoints for all operations
# Database structure and relationships
# Payment processing flow and security considerations
# Notification system implementation
# Security measures in place
# Installation and setup instructions
# Testing guidelines
# Planned future enhancements
# The documentation is structured in a way that makes it easy to navigate using the table of contents with clickable links to each section. This makes it a valuable resource for developers, testers, and stakeholders who need to understand how the system works.

# The payment processing section specifically details how customers can pay for bookings with a generated booking reference number upon completion

## Table of Contents
- [Introduction](#introduction)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Component Structure](#component-structure)
- [User Roles and Permissions](#user-roles-and-permissions)
- [API Endpoints](#api-endpoints)
- [Database Structure](#database-structure)
- [Payment Processing](#payment-processing)
- [Notification System](#notification-system)
- [Security Implementation](#security-implementation)
- [Installation and Setup](#installation-and-setup)
- [Testing Guidelines](#testing-guidelines)
- [Future Enhancements](#future-enhancements)

## Introduction

The Online Hotel Booking System is a comprehensive web application that provides a platform for hotel booking management. It consists of a React frontend and a Spring Boot backend, offering different interfaces for customers, hotel managers, and administrators. The system facilitates the entire hotel booking process from browsing available hotels and rooms to payment processing and post-booking management.

## System Architecture

### Frontend
- **Framework**: React 18 with Vite as build tool
- **UI Component Library**: Material UI 
- **Routing**: React Router 
- **HTTP Client**: Axios for API communication
- **Date Management**: Date-fns 
- **State Management**: React hooks and context API

### Backend
- **Framework**: Spring Boot 
- **Authentication**: JWT-based authentication and authorization
- **Password Encryption**: BCrypt password encoding
- **API Design**: RESTful API architecture
- **Security**: Spring Security
- **Database Access**: Spring Data JPA
- **Cross-Origin Resource Sharing**: CORS configuration for frontend-backend communication

### Software Architecture Pattern
The application follows a layered architecture:
1. **Presentation Layer**: React components and UI
2. **API Layer**: REST controllers
3. **Service Layer**: Business logic implementation
4. **Repository Layer**: Data access
5. **Database Layer**: MySQL database

## Features

### User Management
- Role-based authentication (Customer, Hotel Manager, Admin)
- User registration and login
- Profile management with personal information
- Password change functionality
- Account settings and preferences

### Customer Features
- Browse hotels and rooms with detailed information
- Search and filter hotels/rooms based on various criteria (location, price, amenities)
- View hotel and room details with photos
- Make and manage bookings
- View booking history with past/upcoming filtering
- Cancel bookings when eligible
- Receive real-time notifications about booking status
- Payment processing for bookings
- Receive booking confirmation with reference number

### Hotel Manager Features
- Manage hotels (add, edit, delete)
- Manage rooms (add, edit, delete, set pricing)
- View and manage bookings for their properties
- Dashboard with booking statistics
- Process booking cancellations
- Communicate with guests through the platform
- Generate various reports (occupancy, revenue)
- Monitor room availability

### Admin Features
- User management (view, edit, delete users)
- System oversight and monitoring
- Create and manage hotel managers
- View system-wide statistics
- Access to all bookings and payment information

### Notification System
- Real-time notifications for various events
- Notification center with read/unread status
- Email notifications (configurable)
- Booking status updates
- Payment confirmations and receipts

## Component Structure

### Frontend Components

#### Core Components
- `App.jsx` - Main application component that handles routing
- `Login.jsx` - Authentication component for user login
- `Register.jsx` - User registration component
- `Dashboard.jsx` - Role-specific dashboard showing relevant information
- `NotificationProvider.jsx` - Global notification system provider

#### Customer Components
- `Homepage.jsx` - Landing page for customers
- `Layout.jsx` - Layout wrapper for customer pages
- `UserProfile.jsx` - Customer profile management interface
- `HotelSearch.jsx` - Search and filter hotels based on criteria
- `RoomFilter.jsx` - Search and filter rooms based on criteria
- `HotelDetails.jsx` - Detailed hotel information and room listings
- `BookingForm.jsx` - Form for making bookings with payment processing
- `Bookings.jsx` - Interface to manage and view bookings

#### Manager Components
- `HotelManagement.jsx` - Interface to add/edit/delete hotels
- `RoomManagement.jsx` - Interface to add/edit/delete rooms
- `BookingManagement.jsx` - Interface to manage customer bookings

### Backend Structure

#### Configuration
- `SecurityConfig.java` - Security and authentication configuration
- `WebConfig.java` - Web MVC configuration

#### Controllers
- Authentication controllers for handling login/signup
- Customer controllers for customer-specific operations
- Hotel management controllers for hotel operations
- Booking controllers for booking-related operations
- Payment controllers for payment processing
- Notification controllers for notification management

#### Services
- User services for user management
- Hotel services for hotel operations
- Booking services for booking operations
- Payment services for payment processing
- Notification services for notification management

#### Repositories
- JPA repositories for data access to all entities

#### Security
- JWT token handling
- Authentication filters
- Password encryption

#### Entities
- User, Customer, Manager, Admin entities
- Hotel and Room entities
- Booking and Payment entities
- Notification entity

## User Roles and Permissions

### Customer
- Register and login to the system
- Browse hotels and rooms
- Make bookings and payments
- View booking history
- Cancel bookings (with restrictions)
- Update personal profile
- Receive notifications

### Hotel Manager
- Manage their own hotels and rooms
- View bookings for their properties
- Manage room availability and pricing
- Generate reports for their properties
- Communicate with customers
- Cannot access other managers' properties

### Administrator
- Full system access
- Manage all users, hotels, and rooms
- View all bookings and payments
- Create manager accounts
- Generate system-wide reports
- Monitor system performance

## API Endpoints

### Authentication
- `POST /customer/signup` - Register new customer
- `POST /customer/login` - Customer login
- `POST /manager/login` - Hotel manager login
- `POST /admin/login` - Admin login

### Customer APIs
- `GET /customer/all` - Get all customers (admin access)
- `GET /customer/profile` - Get customer profile
- `PUT /customer/profile/update` - Update customer profile

### Hotel APIs
- `GET /customer/hotels` - Get all hotels
- `GET /customer/hotels/search` - Search hotels based on criteria
- `GET /customer/hotels/{id}` - Get hotel details by ID
- `GET /customer/hotels/{id}/rooms` - Get rooms for a specific hotel

### Manager APIs
- `POST /manager/hotel/add` - Add new hotel
- `GET /manager/hotel/view` - View managed hotels
- `PUT /manager/hotel/update/by-id/{id}` - Update hotel
- `DELETE /manager/hotel/delete/by-id/{id}` - Delete hotel
- `POST /manager/room/add` - Add room to hotel
- `GET /manager/room/view` - View rooms
- `PUT /manager/room/update/{id}` - Update room
- `DELETE /manager/room/delete/{id}` - Delete room

### Booking APIs
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/{reference}` - Get booking by reference
- `GET /api/bookings/customer` - Get bookings for logged-in customer
- `PUT /api/bookings/{reference}/cancel` - Cancel booking
- `GET /api/bookings/hotel/{hotelId}` - Get bookings for hotel

### Payment APIs
- `POST /api/payments/process` - Process payment for booking
- `GET /api/payments/booking/{reference}` - Get payment for booking
- `GET /api/payments/customer` - Get payments for customer
- `POST /api/payments/{reference}/refund` - Process refund (admin only)

### Notification APIs
- `GET /api/notifications` - Get notifications for user
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/{id}` - Delete notification
- `DELETE /api/notifications` - Clear all notifications

## Database Structure

The system uses a relational database with the following key tables:

### Users
- Customers, Managers, and Admins with their specific attributes
- Authentication details and role information

### Hotels
- Hotel details (name, address, description, etc.)
- Relationship to manager who owns the hotel

### Rooms
- Room details (type, capacity, amenities, etc.)
- Relationship to hotel
- Pricing information

### Bookings
- Booking details (dates, guests, status)
- References to customer, hotel, and room
- Booking reference number
- Payment status

### Payments
- Payment details (amount, status, date)
- Reference to booking
- Transaction ID
- Payment method information

### Notifications
- Notification details (type, message, date)
- Read/unread status
- User reference

## Payment Processing

The system implements a comprehensive payment processing feature that allows customers to pay for their bookings securely. The payment flow is as follows:

1. Customer selects a room and enters booking details
2. System calculates total price based on dates and room rate
3. Customer enters payment information (credit card details)
4. Frontend validates payment information format
5. Backend processes payment through payment service
6. Upon successful payment:
   - Booking is confirmed
   - A unique booking reference number is generated
   - Customer receives confirmation notification
   - Payment record is stored in the database

### Payment Security
- Card details are validated but not stored permanently
- Only last 4 digits of card are stored for reference
- Payment processing follows industry security standards
- Sensitive data is not logged or exposed in responses

## Notification System

The system includes a comprehensive notification system to keep users informed about important events:

1. **Real-time Notifications**: Users receive immediate updates about booking status changes, payment confirmations, etc.
2. **Notification Center**: Central place to view all notifications with read/unread status
3. **Email Notifications**: Optional email notifications for important events
4. **Notification Types**:
   - Booking confirmations
   - Payment confirmations
   - Booking cancellations
   - Booking reminders (upcoming stays)
   - System announcements

## Security Implementation

The system implements several security measures:

- **Authentication**: JWT-based token authentication
- **Authorization**: Role-based access control
- **Password Security**: BCrypt password encoding
- **Protected Endpoints**: Secure API access based on user roles
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation of all inputs
- **Error Handling**: Secure error responses without exposing system details

## Installation and Setup

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.8 or higher

### Frontend Setup
1. Navigate to the Frontend directory
   ```
   cd Online-Hotel-Booking-System/Frontend
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start development server
   ```
   npm run dev
   ```
4. Build for production
   ```
   npm run build
   ```

### Backend Setup
1. Navigate to the login_backend-master directory
   ```
   cd Online-Hotel-Booking-System/login_backend-master
   ```
2. Configure database in `application.properties`
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. Build the application
   ```
   mvn clean install
   ```
4. Run the application
   ```
   mvn spring-boot:run
   ```

## Testing Guidelines

A comprehensive testing guide is available in the `postman_testing_guide.md` file, which includes:

1. **API Testing**: Instructions for testing all endpoints using Postman
2. **Test Cases**: Detailed test scenarios for different features
3. **Test Data**: Sample data for testing various functionalities
4. **Authentication Testing**: How to test secured endpoints

## Future Enhancements

The following features are planned for future releases:

1. **Advanced Payment Integration**: Integration with multiple payment gateways
2. **Analytics Dashboard**: Enhanced reporting and analytics
3. **Mobile Application**: Native mobile apps for iOS and Android
4. **Multi-language Support**: Localization for different languages
5. **Review and Rating System**: Allow customers to rate and review hotels
6. **Loyalty Program**: Rewards system for returning customers
7. **Room Availability Calendar**: Visual calendar for room availability
8. **Dynamic Pricing**: Price adjustments based on demand and season

---

*Documentation last updated: May 17, 2025*