import { handleError } from "./errorHandler";
import {
  withTimeout,
  createFetchOptions,
  logRequest,
  logResponse,
  applyInterceptor,
} from "./utils";

export type Method = "GET" | "POST" | "DELETE" | "PUT";

interface RequestParams {
  body?: Record<string, unknown>;
  timeout?: number;
}

interface SafetyParams extends RequestParams {
  body: Record<string, unknown>;
}

interface Interceptor {
  request?: (options: RequestInit) => Promise<RequestInit> | RequestInit;
  response?: (response: Response) => Promise<any>;
}

type ApiError = { status: number } & Error;

export const apiService = (
  baseUrl: string,
  config: {
    interceptor?: Interceptor;
    logging?: boolean;
    timeout?: number; // 전역 타임아웃 설정 추가
  } = {}
) => {
  const { interceptor, logging, timeout: globalTimeout = 5000 } = config;

  const executeRequest = async <T>(
    method: Method,
    endpoint: string,
    { body, timeout = globalTimeout }: RequestParams | SafetyParams = {}
  ): Promise<T> => {
    const abortController = new AbortController();
    const startTime = Date.now();
    const url = `${baseUrl}${endpoint}`;

    // Fetch 요청 옵션 생성
    let fetchOptions = createFetchOptions(method, body, abortController.signal);

    try {
      // 요청 인터셉터 적용
      fetchOptions = await applyInterceptor(fetchOptions, interceptor?.request);
      if (logging) logRequest(method, url, fetchOptions);

      // 타임아웃 설정과 함께 요청 실행
      const response = await withTimeout(
        fetch(url, fetchOptions),
        timeout,
        abortController
      );

      if (!response.ok) {
        const error = new Error(`HTTP error! Status: ${response.status}`);
        (error as ApiError).status = response.status;
        throw error;
      }

      // 응답 인터셉터 적용
      const result = await applyInterceptor(response, interceptor?.response);

      if (logging) logResponse(result, response.status, startTime);

      return result as T;
    } catch (error) {
      return Promise.reject(handleError(error));
    } finally {
      if (abortController.signal.aborted === false) {
        abortController.abort();
      }
    }
  };

  // 메서드 생성
  const createMethod = <T>(method: Method) => {
    return (endpoint: string, params?: RequestParams | SafetyParams) =>
      executeRequest<T>(method, endpoint, params || {});
  };

  // HTTP 메서드 별 함수 제공
  return {
    get: createMethod("GET"),
    post: createMethod("POST"),
    put: createMethod("PUT"),
    delete: createMethod("DELETE"),
  };
};
