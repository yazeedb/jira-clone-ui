import axios from 'axios';

export const fetcher = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Allow all fetchers to receive errors
fetcher.interceptors.response.use(
  // Do nothing on fulfilled
  (response) => response,

  // Throw error on rejected
  (error) => {
    console.log('going error path');
    throw error;
  }
);
