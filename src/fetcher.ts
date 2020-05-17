import axios from 'axios';

export const fetcher = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

export const defaultHttpErrorMessage = 'Something went wrong';

fetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: defaultHttpErrorMessage });
    }

    const { message } = error.response.data;

    return Promise.reject({
      message: message || defaultHttpErrorMessage
    });
  }
);
