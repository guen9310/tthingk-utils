import { handleError } from "./errorHandler";
import { withTimeout, createFetchOptions, handleResponse } from "./utils";

export type method = "GET" | "POST" | "DELETE" | "PUT";
interface RequestParams {
  method?: method;
  endpoint: string;
  body?: Record<string, any>;
  token?: string;
  timeout?: number;
}

interface Interceptor {
  request?: (
    options: RequestInit,
    token?: string
  ) => Promise<RequestInit> | RequestInit;
  response?: (response: Response) => Promise<any>;
}

export const createAPIClient = (
  baseUrl: string,
  options?: {
    interceptor?: Interceptor;
  }
) => {
  const interceptor = options?.interceptor || {};

  const request = async <T>({
    method = "GET",
    endpoint,
    body,
    token,
    timeout = 5000,
  }: RequestParams): Promise<T> => {
    const controller = new AbortController();
    let options = createFetchOptions(method, body, token, controller.signal);

    if (typeof interceptor.request === "function") {
      try {
        options = await interceptor.request(options, token);
      } catch (interceptorError) {
        return Promise.reject(await handleError(interceptorError));
      }
    }

    try {
      const response = await withTimeout(
        fetch(`${baseUrl}${endpoint}`, options),
        timeout,
        controller
      );

      if (typeof interceptor.response === "function") {
        return await interceptor.response(response);
      }

      return await handleResponse<T>(response);
    } catch (error) {
      return Promise.reject(await handleError(error));
    }
  };

  return {
    get: <T>(params: Omit<RequestParams, "method">) =>
      request<T>({ ...params, method: "GET" }),
    post: <T>(params: Omit<RequestParams, "method">) =>
      request<T>({ ...params, method: "POST" }),
    put: <T>(params: Omit<RequestParams, "method">) =>
      request<T>({ ...params, method: "PUT" }),
    delete: <T>(params: Omit<RequestParams, "method">) =>
      request<T>({ ...params, method: "DELETE" }),
  };
};
