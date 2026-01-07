import axios from 'axios';

const adminAxios = axios.create({
  baseURL: 'http://localhost:5000/api'
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default adminAxios;
