# Postman Testing Guide for Online Hotel Booking System

## Table of Contents
- [Introduction](#introduction)
- [Environment Setup](#environment-setup)
- [Authentication Tests](#authentication-tests)
- [Payment Processing Tests](#payment-processing-tests)
- [User Profile Tests](#user-profile-tests)
- [Booking History Tests](#booking-history-tests)
- [Booking Management Tests](#booking-management-tests)
- [Hotel Manager Dashboard Tests](#hotel-manager-dashboard-tests)
- [Notification System Tests](#notification-system-tests)
- [Troubleshooting](#troubleshooting)

## Introduction

This guide provides detailed instructions for testing the Online Hotel Booking System REST APIs using Postman. The guide focuses on testing the following key features:

1. Payment processing for bookings
2. User profile management
3. Booking history (past and upcoming)
4. Booking management (cancellations and modifications)
5. Hotel manager dashboard
6. Notification system

## Environment Setup

### Prerequisites
- Postman application (latest version)
- Backend server running on http://localhost:9000
- Test user accounts:
  - Customer: `customer@test.com` / `password123`
  - Hotel Manager: `manager@test.com` / `password123`
  - Admin: `admin@test.com` / `password123`

### Setting Up Postman Environment

1. Create a new environment in Postman named "Hotel Booking System"
2. Add the following variables:
   - `baseUrl`: http://localhost:9000
   - `customerToken`: (leave empty initially)
   - `managerToken`: (leave empty initially)
   - `adminToken`: (leave empty initially)
   - `bookingReference`: (leave empty initially)
   - `hotelId`: (leave empty initially)
   - `roomId`: (leave empty initially)

3. Import the provided collection file or create a new collection named "Hotel Booking System API Tests"

### Authentication Setup

Run the following requests to obtain authentication tokens:

#### Customer Login
```
POST {{baseUrl}}/customer/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123"
}
```

Save the returned token to the `customerToken` environment variable.

#### Hotel Manager Login
```
POST {{baseUrl}}/manager/login
Content-Type: application/json

{
  "email": "manager@test.com",
  "password": "password123"
}
```

Save the returned token to the `managerToken` environment variable.

#### Admin Login
```
POST {{baseUrl}}/admin/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```

Save the returned token to the `adminToken` environment variable.

## Authentication Tests

### Test Case 1: Customer Registration

**Request:**
```
POST {{baseUrl}}/customer/signup
Content-Type: application/json

{
  "username": "newtestuser",
  "email": "newtestuser@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "firstName": "New",
  "lastName": "User",
  "phone": "1234567890"
}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain success message

### Test Case 2: Customer Login

**Request:**
```
POST {{baseUrl}}/customer/login
Content-Type: application/json

{
  "email": "newtestuser@example.com",
  "password": "Password123"
}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain:
  - JWT token
  - User information including role
  - Save the token for future requests

## Payment Processing Tests

### Test Case 1: Create a Booking (Prerequisite)

**Request:**
```
POST {{baseUrl}}/api/bookings/create
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "hotelId": 1,
  "roomId": 1,
  "checkIn": "2025-06-01",
  "checkOut": "2025-06-05",
  "guests": 2,
  "totalPrice": 500.00,
  "specialRequests": "I'd like a room with a view"
}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain the booking details including a booking reference
- Save the booking reference to the `bookingReference` environment variable

### Test Case 2: Process Payment for Booking

**Request:**
```
POST {{baseUrl}}/api/payments/process
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "bookingReference": "{{bookingReference}}",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "cvv": "123",
  "nameOnCard": "John Doe",
  "amount": 500.00,
  "paymentMethod": "CREDIT_CARD"
}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain:
  - `paymentStatus` field with value "COMPLETED"
  - `bookingReference` matching the submitted reference
  - `amount` matching the submitted amount
  - `transactionId` (unique payment identifier)
  - `message` indicating successful payment

### Test Case 3: Fetch Payment Details by Booking Reference

**Request:**
```
GET {{baseUrl}}/api/payments/booking/{{bookingReference}}?email=customer@test.com
Authorization: Bearer {{customerToken}}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain:
  - Payment details with `bookingReference` matching the request
  - `paymentStatus` as "COMPLETED"
  - `amount` matching the booking total
  
### Test Case 4: Verify Booking Status After Payment

**Request:**
```
GET {{baseUrl}}/api/bookings/{{bookingReference}}?email=customer@test.com
Authorization: Bearer {{customerToken}}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain:
  - `status` field with value "CONFIRMED"
  - `isPaid` field with value `true`
  - `bookingReference` matching the submitted reference

### Test Case 5: Test Payment Failure Scenario

**Request:**
```
POST {{baseUrl}}/api/payments/process
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "bookingReference": "{{bookingReference}}",
  "cardNumber": "4111111111111112", // Invalid card number
  "expiryDate": "12/25",
  "cvv": "123",
  "nameOnCard": "John Doe",
  "amount": 500.00,
  "paymentMethod": "CREDIT_CARD"
}
```

**Expected Response:**
- Status: 200 OK or 400 Bad Request
- Response body should contain:
  - `paymentStatus` field with value "FAILED"
  - Error message indicating why payment failed

## User Profile Tests

### Test Case 1: Fetch User Profile Information

**Request:**
```
GET {{baseUrl}}/customer/profile?email=customer@test.com
Authorization: Bearer {{customerToken}}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain:
  - User's personal information (name, email, phone number)
  - Profile image URL if available

### Test Case 2: Update User Profile Information

**Request:**
```
PUT {{baseUrl}}/customer/profile/update
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "email": "customer@test.com",
  "firstName": "Updated",
  "lastName": "Customer",
  "phone": "9876543210",
  "address": "123 New Street, City"
}
```

**Expected Response:**
- Status: 200 OK
- Response body should contain updated profile information

### Test Case 3: Update Profile Picture

**Request:**
```
POST {{baseUrl}}/customer/profile/update-picture
Authorization: Bearer {{customerToken}}
Content-Type: multipart/form-data

Form data:
- email: customer@test.com
- profilePicture: [upload a file]
```