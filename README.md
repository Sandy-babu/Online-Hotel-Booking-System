# Online Hotel Booking System

A comprehensive hotel booking platform that allows customers to search, view, and book hotel rooms, while providing management features for hotel administrators.

## Description

This Online Hotel Booking System is a full-stack web application that streamlines the hotel booking process. It connects customers with hotels, providing an intuitive interface for room booking and management. The system features secure payment processing, user profile management, booking history tracking, and a powerful dashboard for hotel managers.

## Features

### Customer Features
- User registration and authentication
- Search for hotels with filtering options
- View detailed hotel and room information
- Make reservations with secure payment processing
- Receive booking confirmation with reference number
- User profile management with personal information
- View past and upcoming bookings
- Cancel bookings based on hotel policies
- Receive real-time notifications

### Hotel Management Features
- Comprehensive dashboard with booking statistics
- Hotel property management
- Room inventory management
- Booking management with filtering capabilities
- Communicate with guests
- Process booking cancellations
- Monitor check-ins and check-outs
- Generate reports and analytics

### Admin Features
- User management
- System oversight
- Create and manage hotel managers
- Access to all bookings and payments

## Payment Processing

The system implements a secure payment processing feature that:
- Collects and validates payment information
- Processes credit card payments
- Generates unique booking reference numbers
- Provides confirmation upon successful payment
- Handles refunds for cancelled bookings

## Notification System

The application includes a comprehensive notification system:
- Real-time notifications for booking status changes
- Notification center with read/unread tracking
- Email alerts for important events
- Customizable notification preferences

## Technology Stack

### Frontend
- React 18 with Vite
- Material UI for responsive design
- React Router for navigation
- Axios for API communication
- Date-fns for date management
- Context API for state management

### Backend
- Spring Boot application
- JWT-based authentication and authorization
- RESTful API architecture
- Spring Security
- Spring Data JPA
- MySQL database

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Java Development Kit (JDK) 17+
- Maven 3.8+
- MySQL 8.0+

### Frontend Setup
1. Navigate to the Frontend directory:
   ```
   cd Frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

### Backend Setup
1. Navigate to the login_backend-master directory:
   ```
   cd login_backend-master
   ```
2. Configure database in `application.properties`:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. Build the application:
   ```
   mvn clean install
   ```
4. Run the application:
   ```
   mvn spring-boot:run
   ```

## Project Structure

### Frontend
- **src/components/**: React components
  - **customer/**: Customer-specific components
  - **manager/**: Hotel manager components
  - **NotificationProvider.jsx**: Global notification system
- **src/config/**: API configuration
- **src/assets/**: Static assets

### Backend
- **src/main/java/com/springboot/login/**: Spring Boot application
  - **controller/**: REST API controllers
  - **service/**: Business logic implementation
  - **repository/**: Data access layer
  - **entity/**: Data models
  - **security/**: Authentication and authorization
  - **dto/**: Data Transfer Objects

## Usage

### For Customers
1. Register a new account or login with existing credentials
2. Browse hotels and select rooms based on your preferences
3. Make a reservation by completing the booking form
4. Enter payment details to confirm your booking
5. Receive a booking reference number upon successful payment
6. View your upcoming and past bookings in your profile
7. Manage your profile information and notifications

### For Hotel Managers
1. Login to the manager dashboard
2. Manage your hotel properties and room inventory
3. View and manage bookings for your properties
4. Monitor check-ins and check-outs
5. Communicate with guests
6. Generate reports and analytics

## Documentation

### API Documentation
Comprehensive API documentation can be found in the [DOCUMENTATION.md](DOCUMENTATION.md) file, which includes:
- System architecture
- API endpoints
- Database structure
- Security implementation

### Testing Guide
Refer to the [postman_testing_guide.md](postman_testing_guide.md) for detailed API testing instructions, including:
- Environment setup
- Authentication tests
- Payment processing tests
- User profile tests
- Booking management tests
- Notification system tests

## Future Enhancements
- Advanced payment gateway integration
- Enhanced reporting and analytics
- Mobile application development
- Multi-language support
- Review and rating system
- Loyalty program implementation

## License
This project is licensed under the MIT License.

## Contributors
- Add your name here