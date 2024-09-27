/**
 * HTTP 요청 메서드 타입
 */
type Method = "GET" | "POST" | "DELETE" | "PUT";

/**
 * API 요청 매개변수 인터페이스
 * @template T - 요청 본문의 타입
 * @typedef {Object} RequestParams
 * @property {T} [body] - 요청 본문
 * @property {number} [timeout] - 요청 타임아웃 (ms)
 * @property {AbortSignal} [signal] - 요청 취소 신호
 */
interface RequestParams<T = unknown> {
  queryParams?: Record<string, any>;
  body?: T;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * 본문이 없는 API 요청 매개변수 타입
 */
type NobodyRequestParams = Omit<RequestParams, "body">;

/**
 * 요청/응답 인터셉터 인터페이스
 * @property {(options: RequestInit) => Promise<RequestInit> | RequestInit} [request] - 요청 인터셉터
 * @property {(response: Response) => Promise<any>} [response] - 응답 인터셉터
 */
interface Interceptor {
  request?: (options: RequestInit) => Promise<RequestInit> | RequestInit;
  response?: (response: Response) => Promise<any>;
}

/**
 * API 에러 클래스
 * @extends Error
 */
class ApiError extends Error {
  status: number;

  /**
   * @param status - HTTP 상태 코드
   * @param message - 에러 메시지
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export { Method, RequestParams, NobodyRequestParams, Interceptor, ApiError };
