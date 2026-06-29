import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors and unwrap data
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'response' in response.data) {
      response.data = response.data.response;
    }
    return response;
  },
  (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      const rawMessage = data.message || data.response?.message;
      if (rawMessage) {
        if (Array.isArray(rawMessage)) {
          data.message = rawMessage
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (item && typeof item === 'object' && item.constraints) {
                return Object.values(item.constraints).join(', ');
              }
              return JSON.stringify(item);
            })
            .join(' | ');
        } else if (typeof rawMessage === 'object') {
          if (rawMessage.constraints) {
            data.message = Object.values(rawMessage.constraints).join(', ');
          } else {
            data.message = JSON.stringify(rawMessage);
          }
        }
      }
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/otp')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
