import axios from 'axios';

export const fetcher = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

fetcher.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
