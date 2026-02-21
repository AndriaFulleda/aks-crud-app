import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product API functions
export const productAPI = {
  // Get all products
  getAll: () => api.get('/products'),
  
  // Get product by ID
  getById: (id) => api.get(`/products/${id}`),
  
  // Create new product
  create: (product) => api.post('/products', product),
  
  // Update product
  update: (id, product) => api.put(`/products/${id}`, product),
  
  // Delete product
  delete: (id) => api.delete(`/products/${id}`),
  
  // Search products
  search: (keyword) => api.get(`/products/search?keyword=${keyword}`),
  
  // Get products in stock
  getInStock: () => api.get('/products/in-stock'),
};

export default api;