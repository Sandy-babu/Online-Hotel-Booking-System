import axios from 'axios';

const BASE_URL = 'http://localhost:9000';

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

export const API_ENDPOINTS = {
  CUSTOMER: {
    SIGNUP: `${BASE_URL}/customer/signup`,
    LOGIN: `${BASE_URL}/customer/login`,
    HOTELS: {
      LIST: `${BASE_URL}/customer/hotels`,
      DETAILS: (id) => `${BASE_URL}/customer/hotels/${id}`,
      SEARCH: `${BASE_URL}/customer/hotels/search`,
      ROOMS: `${BASE_URL}/customer/hotels/rooms`,
      ROOMS_FILTER: `${BASE_URL}/customer/hotels/rooms/filter`
    }
  },
  MANAGER: {
    LOGIN: `${BASE_URL}/manager/login`,
    HOTEL: {
      ADD: `${BASE_URL}/manager/hotel/add`,
      VIEW: `${BASE_URL}/manager/hotel/view`,
      UPDATE: (id) => `${BASE_URL}/manager/hotel/update/by-id/${id}`,
      DELETE: (id) => `${BASE_URL}/manager/hotel/delete/by-id/${id}`
    },
    ROOM: {
      ADD: `${BASE_URL}/manager/room/add`,
      VIEW: `${BASE_URL}/manager/room/view`,
      UPDATE: (roomNumber) => `${BASE_URL}/manager/room/update/${roomNumber}`,
      DELETE: (roomNumber) => `${BASE_URL}/manager/room/delete/${roomNumber}`
    },
    REPORTS: `${BASE_URL}/manager/reports`
  },
  ADMIN: {
    SIGNUP: `${BASE_URL}/admin/signup`,
    LOGIN: `${BASE_URL}/admin/login`,
    CREATE_MANAGER: `${BASE_URL}/admin/create-manager`
  },
  BOOKINGS: {
    CREATE: `${BASE_URL}/bookings`,
    GET_USER_BOOKINGS: `${BASE_URL}/bookings`,
    CANCEL: (id) => `${BASE_URL}/bookings/${id}/cancel`
  },
  PAYMENTS: {
    PROCESS: `${BASE_URL}/payments`
  }
}; 