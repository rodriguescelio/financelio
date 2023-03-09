import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AUTH_TOKEN_NAME } from '../constants';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  transformRequest: [
    (data, headers) => {
      const token =
        window.sessionStorage.getItem(AUTH_TOKEN_NAME) ||
        window.localStorage.getItem(AUTH_TOKEN_NAME);

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return data;
    },
    // @ts-ignore
    ...axios.defaults.transformRequest,
  ],
  transformResponse: [
    (data, _, status) => {
      if (status === 401) {
        window.sessionStorage.removeItem(AUTH_TOKEN_NAME);
        window.localStorage.removeItem(AUTH_TOKEN_NAME);
        window.location.reload();
      }
      return data;
    },
    // @ts-ignore
    ...axios.defaults.transformResponse,
  ],
});

const safe = async <T = any, R = AxiosResponse<T>>(
  fn: Promise<R>
): Promise<[T, Error]> => {
  let response = null;
  let error = null;

  try {
    // @ts-ignore
    response = await fn.then((r) => r.data);
  } catch (e: any) {
    error = e;
  }

  return [response, error] as [T, Error];
};

const http = {
  ...instance,
  get: async <T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<[T, any]> => safe(instance.get(url, config)),
  post: async <T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<[T, any]> => safe(instance.post(url, data, config)),
  delete: async <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<[R, any]> => safe(instance.delete(url, config)),
};

export default http;
