import { handleError } from "./errorHandler";
import {
  withTimeout,
  createFetchOptions,
  handleResponse,
  logRequest,
  logResponse,
} from "./utils";

export type method = "GET" | "POST" | "DELETE" | "PUT";
interface RequestParams {
  method?: method;
  endpoint: string;
  body?: Record<string, any>;
  timeout?: number;
}

interface Interceptor {
  request?: (options: RequestInit) => Promise<RequestInit> | RequestInit;
  response?: (response: Response) => Promise<any>;
}

export const apiService = (
  baseUrl: string,
  options?: {
    interceptor?: Interceptor;
    logging?: boolean;
  }
) => {
  const interceptor = options?.interceptor || {};
  const logging = options?.logging || false;

  const executeRequest = async <T>({
    method = "GET",
    endpoint,
    body,
    timeout = 5000,
  }: RequestParams): Promise<T> => {
    const controller = new AbortController();
    const startTime = Date.now();

    let fetchOptions = createFetchOptions(method, body, controller.signal);
    const url = `${baseUrl}${endpoint}`;

    try {
      if (typeof interceptor.request === "function") {
        fetchOptions = await interceptor.request(fetchOptions);
      }
    } catch (interceptorError) {
      return Promise.reject(handleError(interceptorError));
    } finally {
      logRequest(logging, method, url, fetchOptions);
    }
    let response;
    let responseClone;
    try {
      response = await withTimeout(
        fetch(url, fetchOptions),
        timeout,
        controller
      );
      responseClone = response.clone();

      if (!response.ok) {
        const error = new Error(`HTTP error! Status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).message = response.statusText;
        return Promise.reject(handleError(error));
      }

      if (typeof interceptor.response === "function") {
        return await interceptor.response(response);
      }

      return await handleResponse<T>(response);
    } catch (error) {
      return Promise.reject(handleError(error));
    } finally {
      logResponse(logging, responseClone!, startTime);
    }
  };

  return {
    get: <T>(params: Omit<RequestParams, "method">) =>
      executeRequest<T>({ ...params, method: "GET" }),
    post: <T>(params: Omit<RequestParams, "method">) =>
      executeRequest<T>({ ...params, method: "POST" }),
    put: <T>(params: Omit<RequestParams, "method">) =>
      executeRequest<T>({ ...params, method: "PUT" }),
    delete: <T>(params: Omit<RequestParams, "method">) =>
      executeRequest<T>({ ...params, method: "DELETE" }),
  };
};
