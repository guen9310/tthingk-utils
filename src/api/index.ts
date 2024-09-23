import { handleError } from "./errorHandler";
import { withTimeout, createFetchOptions, handleResponse } from "./utils";

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
    timeout = 5000,
  }: RequestParams): Promise<T> => {
    const controller = new AbortController();

    // 기본 옵션 생성
    let options = createFetchOptions(method, body, controller.signal);

    try {
      if (typeof interceptor.request === "function") {
        options = await interceptor.request(options);
      }
    } catch (interceptorError) {
      return Promise.reject(await handleError(interceptorError));
    }

    try {
      // fetch 요청 실행
      const response = await withTimeout(
        fetch(`${baseUrl}${endpoint}`, options),
        timeout,
        controller
      );

      // 응답 처리 인터셉터가 있으면, 해당 인터셉터에 처리를 위임
      if (typeof interceptor.response === "function") {
        return await interceptor.response(response);
      }

      // 기본 응답 처리
      return await handleResponse<T>(response);
    } catch (error) {
      // 요청 중 에러 발생 시 처리
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
