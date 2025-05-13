const BASE_URL = 'http://localhost:9000';

export const API_ENDPOINTS = {
  CUSTOMER: {
    LOGIN: `${BASE_URL}/customer/login`,
    SIGNUP: `${BASE_URL}/customer/signup`,
    ALL: `${BASE_URL}/customer/all`
  },
  ADMIN: {
    LOGIN: `${BASE_URL}/admin/login`,
    SIGNUP: `${BASE_URL}/admin/signup`,
    CREATE_MANAGER: `${BASE_URL}/admin/create-manager`,
    ALL: `${BASE_URL}/admin/all`
  },
  MANAGER: {
    LOGIN: `${BASE_URL}/manager/login`,
    ALL: `${BASE_URL}/manager/all`
  },
  HOTELS: {
    ALL: `${BASE_URL}/hotels`,
    DETAILS: (id) => `${BASE_URL}/hotels/${id}`
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