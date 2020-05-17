import axios from 'axios';

export const fetcher = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

fetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    const { message } = error.response.data;
    const defaultMessage = 'Something went wrong';

    return Promise.reject({
      message: message || defaultMessage
    });
  }
);
