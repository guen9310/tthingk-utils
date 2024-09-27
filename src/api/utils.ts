import { Method } from "./types";

/**
 * fetch 요청을 위한 옵션 객체를 생성합니다.
 * @param method - HTTP 메서드
 * @param body - 요청 본문 (선택적)
 * @param signal - AbortSignal 객체 (선택적)
 * @returns RequestInit 객체
 */
export const createFetchOptions = (
  method: Method,
  body?: Record<string, unknown>,
  signal?: AbortSignal
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * 지정된 시간 후에 요청을 취소하는 프로미스 래퍼
 * @param promise - 원본 fetch 프로미스
 * @param timeout - 타임아웃 시간 (밀리초)
 * @param controller - AbortController 객체
 * @returns Promise<Response>
 */
export const withTimeout = (
  promise: Promise<Response>,
  timeout: number,
  controller: AbortController
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("Request timed out"));
    }, timeout);

    promise
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * HTTP 요청 정보를 로깅합니다.
 * @param method - HTTP 메서드
 * @param url - 요청 URL
 * @param options - fetch 옵션
 */
export const logRequest = (
  method: string,
  url: string,
  options: RequestInit
) => {
  console.log(`-----[${method}] REQUEST-----`);
  console.log(`[URL]: ${url}`);
  console.log(`[HEADERS]:`, options.headers);
  if (options.body) {
    console.log(`[BODY]:`, JSON.parse(options.body as string));
  } else {
    console.log(`[BODY]: No body data`);
  }
};

/**
 * HTTP 응답 정보를 로깅합니다.
 * @param result - 결과 값을 반환
 * @param status - 응답 결과 상태
 * @param startTime - 요청 시작 시간
 */
export const logResponse = async (
  result: Record<string, any>,
  status: number,
  startTime: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log("-------RESPONSE-------");
  console.log(`[STATUS]: ${status}`);
  console.log(`[DURATION]: ${duration} ms`);
  console.log(`[RESPONSE BODY]:`, result);
};

/**
 * 요청 인터셉터를 적용합니다.
 * @template T
 * @param {T} options - 요청 옵션
 * @param {(options: T) => Promise<T> | T} [requestInterceptor] - 요청 인터셉터 함수
 * @returns {Promise<T>} - 수정된 요청 옵션
 */
export const applyRequestInterceptor = async <T extends RequestInit>(
  options: T,
  requestInterceptor?: (options: T) => Promise<T> | T
): Promise<T> => {
  if (requestInterceptor) {
    return await requestInterceptor(options);
  }
  return options;
};

/**
 * 응답 인터셉터를 적용합니다.
 * @template T
 * @param {Response} response - fetch 응답 객체
 * @param {(response: Response) => Promise<T> | T} [responseInterceptor] - 응답 인터셉터 함수
 * @returns {Promise<T>} - 수정된 응답 데이터
 */
export const applyResponseInterceptor = async <T>(
  response: Response,
  responseInterceptor?: (response: Response) => Promise<T> | T
): Promise<T> => {
  if (responseInterceptor) {
    const result = response.clone();
    return await responseInterceptor(result);
  }

  return response.json() as Promise<T>;
};
