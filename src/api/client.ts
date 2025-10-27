import axios from 'axios';
import { getBaseUrl } from './config';

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  console.log('API Request:', config.url, 'Token exists:', !!token);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

export default api;


