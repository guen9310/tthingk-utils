import {
  ApiError,
  Interceptor,
  Method,
  RequestParams,
  NobodyRequestParams,
} from "./types";
import {
  withTimeout,
  createFetchOptions,
  logRequest,
  logResponse,
  applyRequestInterceptor,
  applyResponseInterceptor,
  createQueryString,
} from "./utils";

/**
 * API 서비스 생성 함수
 * @template T - 응답 데이터 타입
 * @param {string} baseUrl - API 기본 URL
 * @param {Object} [config] - API 서비스 구성 옵션
 * @param {Interceptor} [config.interceptor] - 요청 및 응답 인터셉터
 * @param {boolean} [config.logging=false] - 로깅 활성화 여부
 * @param {number} [config.timeout=5000] - 요청 타임아웃 (ms)
 */
export const apiService = <T>(
  baseUrl: string,
  config: {
    interceptor?: Interceptor;
    logging?: boolean;
    timeout?: number;
  } = {}
) => {
  const { interceptor, logging, timeout: globalTimeout = 5000 } = config;

  /**
   * HTTP 요청을 실행하는 함수
   * @template R - 응답 데이터 타입
   * @param {Method} method - HTTP 메서드
   * @param {string} endpoint - API 엔드포인트
   * @param {RequestParams | NobodyRequestParams} [params={}] - 요청 매개변수
   * @returns {Promise<{ data: R; status: number }>} - 요청 결과 데이터 및 상태 코드
   * @throws {ApiError} - 요청 실패 시 발생하는 에러
   */
  const executeRequest = async <R>(
    method: Method,
    endpoint: string,
    params: RequestParams | NobodyRequestParams = {}
  ): Promise<{ data: R; status: number }> => {
    let url = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = params?.timeout ?? globalTimeout;

    let fetchOptions: RequestInit;

    if (method === "GET" || method === "DELETE") {
      const queryString = params?.queryParams
        ? createQueryString(params.queryParams)
        : "";
      fetchOptions = createFetchOptions(method, undefined, controller.signal);
      url += queryString;
    } else {
      fetchOptions = createFetchOptions(
        method,
        params && (params as RequestParams<Record<string, unknown>>)?.body,
        controller.signal
      );
    }

    // 요청 인터셉터 적용
    const interceptedOptions = await applyRequestInterceptor(
      fetchOptions,
      interceptor?.request
    );

    if (logging) logRequest(method, url, fetchOptions);

    try {
      const response = await withTimeout(
        fetch(url, interceptedOptions),
        timeout,
        controller
      );

      if (!response.ok) {
        throw new ApiError(response.status, `요청 실패: ${response.status}`);
      }

      const data = await applyResponseInterceptor<R>(
        response,
        interceptor?.response
      );
      if (logging)
        logResponse(data as Record<string, any>, response.status, Date.now());

      return { data, status: response.status };
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * 메서드를 동적으로 생성하여 GET, POST, PUT, DELETE 요청을 위한 함수들을 반환합니다.
   * @template R - 응답 데이터 타입
   * @template B - 요청 본문 데이터 타입 (POST, PUT의 경우에 사용됨)
   * @param {Method} method - HTTP 메서드 (GET, POST, PUT, DELETE)
   * @returns {(endpoint: string, params?: RequestParams | NobodyRequestParams) => Promise<{ data: R; status: number }>}
   */
  const createMethod = <R, B = undefined>(
    method: Method
  ): ((
    endpoint: string,
    params?: B extends undefined ? NobodyRequestParams : RequestParams<B>
  ) => Promise<{ data: R; status: number }>) => {
    return (
      endpoint: string,
      params?: B extends undefined ? NobodyRequestParams : RequestParams<B>
    ) => {
      return executeRequest<R>(method, endpoint, params);
    };
  };

  // HTTP 메서드 별 함수 제공
  return {
    get: createMethod<T>("GET"),
    post: createMethod<T, Record<string, unknown>>("POST"),
    put: createMethod<T, Record<string, unknown>>("PUT"),
    delete: createMethod<T>("DELETE"),
  };
};
