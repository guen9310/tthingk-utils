import { method } from ".";

export const createFetchOptions = (
  method: method,
  body?: Record<string, any>,
  signal?: AbortSignal
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw { status: response.status, response };
  }

  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return (await response.text()) as unknown as T;
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
  console.log(`[OPTIONS]:`, options);
};

export const logResponse = async (response: Response, startTime: number) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  const status = response.status;
  const responseData = await response.json();
  console.log("-------RESPONSE-------");
  console.log(`[STATUS]: ${status}`);
  console.log(`[DURATION]: ${duration} ms`);
  console.log(`[DATA]:`, responseData);
};
