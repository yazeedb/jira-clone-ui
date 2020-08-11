import axios, { AxiosResponse, AxiosError } from 'axios';

export const fetcher = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

export const defaultHttpErrorMessage = 'Something went wrong';

fetcher.interceptors.response.use(
  (response) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1200);
    }),
  (error: AxiosError) => {
    if (!error.response) {
      // TODO: Will this branch ever be hit?
      // We might not need it...
      return Promise.reject({ message: defaultHttpErrorMessage });
    }

    const { status, statusText, data } = error.response;

    return Promise.reject({
      status,
      message: data.message || statusText || defaultHttpErrorMessage
    });
  }
);

export type FetcherResponse<T> = AxiosResponse<T>;
