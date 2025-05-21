import axios from 'axios';

/**
 * API Endpoints Configuration
 * This file contains all API endpoint URLs for the Online Hotel Booking System
 */

// Base URL for backend API
const API_BASE_URL = 'http://localhost:9000';
const NODE_API_BASE_URL = 'http://localhost:9000';

// Add axios interceptor to include JWT token in all requests
axios.interceptors.request.use(
  (config) => {
    // Skip adding token for registration and login endpoints
    if (config.url.includes('/signup') || config.url.includes('/login')) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 403 errors for authenticated requests (not login/signup)
    if (error.response?.status === 403 && 
        !error.config.url.includes('/login') && 
        !error.config.url.includes('/signup')) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints organized by user role and function
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    CHECK_EMAIL: `${API_BASE_URL}/customer/check-email`,
  },
  
  // Customer endpoints
  CUSTOMER: {
    SIGNUP: `${API_BASE_URL}/customer/signup`,
    LOGIN: `${API_BASE_URL}/customer/login`,
    PROFILE: `${API_BASE_URL}/customer/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/customer/profile/update`,
    CHANGE_PASSWORD: `${API_BASE_URL}/customer/profile/change-password`,
    GET_ALL: `${API_BASE_URL}/customer/all`,
  },
  
  // Admin endpoints
  ADMIN: {
    LOGIN: `${API_BASE_URL}/admin/login`,
    SIGNUP: `${API_BASE_URL}/admin/signup`,
    GET_ALL: `${API_BASE_URL}/admin/all`,
    CREATE_MANAGER: `${API_BASE_URL}/admin/create-manager`,
  },
  
  // Hotel Manager endpoints
  MANAGER: {
    LOGIN: `${API_BASE_URL}/manager/login`,
    GET_ALL: `${API_BASE_URL}/manager/all`,
    
    // Hotel management
    HOTEL: {
      ADD: `${API_BASE_URL}/manager/hotel/add`,
      VIEW: `${API_BASE_URL}/manager/hotel/view`,
      UPDATE_BY_ID: (id) => `${API_BASE_URL}/manager/hotel/update/by-id/${id}`,
      UPDATE_BY_NAME: `${API_BASE_URL}/manager/hotel/update/by-name`,
      DELETE_BY_ID: (id) => `${API_BASE_URL}/manager/hotel/delete/by-id/${id}`,
      DELETE_BY_NAME: `${API_BASE_URL}/manager/hotel/delete/by-name`,
      GET_ALL: `${API_BASE_URL}/manager/hotel/all`,
    },
    
    // Room management
    ROOM: {
      ADD: `${API_BASE_URL}/manager/room/add`,
      VIEW: `${API_BASE_URL}/manager/room/view`,
      UPDATE: (id) => `${API_BASE_URL}/manager/room/update/${id}`,
      DELETE: (id) => `${API_BASE_URL}/manager/room/delete/${id}`,
    },
    
    // Booking management
    BOOKING: {
      VIEW: `${API_BASE_URL}/manager/bookings`,
      UPDATE: (id) => `${API_BASE_URL}/manager/bookings/${id}`,
      CANCEL: (id) => `${API_BASE_URL}/manager/bookings/${id}/cancel`,
      REPORTS: `${API_BASE_URL}/manager/reports`,
    }
  },
  
  // Hotel endpoints (for customers)
  HOTEL: {
    GET_ALL: `${API_BASE_URL}/customer/hotels`,
    SEARCH: `${API_BASE_URL}/customer/hotels/search`,
    GET_BY_ID: (id) => `${API_BASE_URL}/customer/hotels/${id}`,
    GET_ROOMS: `${API_BASE_URL}/customer/hotels/rooms`,
    FILTER_ROOMS: `${API_BASE_URL}/customer/hotels/rooms/filter`,
  },
  
  // Booking endpoints (for customers)
  BOOKING: {
    CREATE: `${API_BASE_URL}/customer/booking/create`,
    GET_USER_BOOKINGS: `${API_BASE_URL}/customer/booking/all`,
    GET_BY_ID: (reference) => `${API_BASE_URL}/customer/booking/${reference}`,
    CANCEL: (reference) => `${API_BASE_URL}/customer/booking/${reference}/cancel`,
    UPDATE: (reference) => `${API_BASE_URL}/customer/booking/${reference}/update`,
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE: `${NODE_API_BASE_URL}/api/payments/create`,
    PROCESS: `${NODE_API_BASE_URL}/api/payments/process`,
    VERIFY: `${NODE_API_BASE_URL}/api/payments/verify`,
    GET_BY_BOOKING_ID: (bookingId) => `${NODE_API_BASE_URL}/api/payments/booking/${bookingId}`,
    REFUND: (paymentId) => `${NODE_API_BASE_URL}/api/payments/${paymentId}/refund`,
    WEBHOOK: `${NODE_API_BASE_URL}/api/payments/webhook`,
  },
  
  // Review endpoints
  REVIEW: {
    CREATE: `${API_BASE_URL}/customer/reviews/create`,
    GET_BY_HOTEL_ID: (hotelId) => `${API_BASE_URL}/customer/reviews/hotel/${hotelId}`,
    GET_USER_REVIEWS: `${API_BASE_URL}/customer/reviews`,
    UPDATE: (id) => `${API_BASE_URL}/customer/reviews/${id}`,
    DELETE: (id) => `${API_BASE_URL}/customer/reviews/${id}`,
  },
  
  // Notification endpoints
  NOTIFICATION: {
    GET_USER_NOTIFICATIONS: `${API_BASE_URL}/customer/notifications`,
    MARK_AS_READ: (id) => `${API_BASE_URL}/customer/notifications/${id}/read`,
    DELETE: (id) => `${API_BASE_URL}/customer/notifications/${id}`,
  }
};