# Online-Hotel-Booking-System

A comprehensive hotel booking platform that allows customers to search, view, and book hotel rooms, while providing management features for hotel administrators.

## Description

This Online Hotel Booking System is a full-stack web application that streamlines the hotel booking process. It connects customers with hotels, providing an intuitive interface for room booking and management.

## Features

### Customer Features
- User registration and authentication
- Search for hotels with filtering options
- View detailed hotel and room information
- Make and manage reservations
- User profile management
- Booking history view

### Hotel Management Features
- Dashboard with analytics and reports
- Hotel property management
- Room inventory management
- Booking management
- Reporting and statistics

## Technology Stack

### Frontend
- React.js with Vite
- Modern UI components
- Responsive design for all devices

### Backend
- Spring Boot for authentication and user management
- Node.js for hotel and booking services
- RESTful API architecture

### Database
- MongoDB for flexible data storage

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Java Development Kit (JDK) 11+
- Maven
- MongoDB

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

### Backend Setup
1. Navigate to the login_backend-master directory:
   ```
   cd login_backend-master
   ```
2. Install Node.js dependencies:
   ```
   npm install
   ```
3. Start the Node.js server:
   ```
   node server.js
   ```
4. In a separate terminal, start the Spring Boot application:
   ```
   ./mvnw spring-boot:run
   ```

## Project Structure
- **Frontend/**: React application built with Vite
  - **src/components/**: React components including customer and manager interfaces
  - **src/config/**: API configuration
  
- **login_backend-master/**: Backend services
  - **controllers/**: API endpoints for hotel services
  - **src/main/java/**: Spring Boot application for user authentication
  - **routes/**: API route definitions

## Usage
1. Register a new account or login with existing credentials
2. Browse hotels and select rooms based on your preferences
3. Make a reservation by completing the booking form
4. View and manage your bookings in your profile

## API Documentation
API documentation can be found in the DOCUMENTATION.md file.

## Testing
Refer to the postman_testing_guide.md for API testing instructions.

## License
This project is licensed under the MIT License.

## Contributors
- Add your name here