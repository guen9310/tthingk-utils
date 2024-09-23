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
