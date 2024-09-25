import { Method } from ".";

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

// Timeout 시 취소
export const withTimeout = async (
  promise: Promise<Response>,
  timeout: number,
  controller: AbortController
): Promise<Response> => {
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await promise;
  } finally {
    clearTimeout(id);
  }
};

//loggin true 시, 로그 출력
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

  // 응답 본문 로깅
  try {
    console.log(`[RESPONSE BODY]:`, result);
  } catch (error) {
    console.log("Error reading response body", error);
  }
};

//인터셉터
export const applyInterceptor = async <T>(
  target: T,
  interceptorFn?: (target: T) => Promise<T> | T
): Promise<T> => {
  if (interceptorFn) {
    return interceptorFn(target);
  }
  return target;
};
