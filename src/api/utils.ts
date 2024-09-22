import { method } from ".";

// Fetch 옵션 생성
export const createFetchOptions = (method: method, body?: any): RequestInit => {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

// Timeout 시 취소
export const withTimeout = async <T>(
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
