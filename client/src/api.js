import axios from 'axios';

const baseURL =
  import.meta.env.PROD
    ? 'https://blogapp-9fre.onrender.com' // 🔴 put your Render URL here
    : 'http://localhost:4000';

export const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
