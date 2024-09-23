import { ErrorHandler } from "./errorHandler";

export type method = "GET" | "POST" | "DELETE" | "PUT";
interface RequestParams {
  method?: method;
  endpoint: string;
  body?: Record<string, any>;
  token?: string;
  timeout?: number;
}

interface Interceptor {
  request?: (
    options: RequestInit,
    token?: string
  ) => Promise<RequestInit> | RequestInit;
  response?: (response: Response) => Promise<any>;
}

export class APIClient {
  private baseUrl: string;
  private interceptor?: Interceptor;
  private errorHandler: ErrorHandler;

  constructor(
    baseUrl: string,
    options?: {
      interceptor?: {
        request?: (
          options: RequestInit,
          token?: string
        ) => Promise<RequestInit> | RequestInit;
        response?: (response: Response) => Promise<any>;
      };
    }
  ) {
    this.baseUrl = baseUrl;
    this.interceptor = options?.interceptor || {}; // 인터셉터의 기본값을 빈 객체로 처리
    this.errorHandler = new ErrorHandler();
  }

  async get<T>(params: Omit<RequestParams, "method">): Promise<T> {
    return this.request<T>({ ...params, method: "GET" });
  }

  async post<T>(params: Omit<RequestParams, "method">): Promise<T> {
    return this.request<T>({ ...params, method: "POST" });
  }

  async put<T>(params: Omit<RequestParams, "method">): Promise<T> {
    return this.request<T>({ ...params, method: "PUT" });
  }

  async delete<T>(params: Omit<RequestParams, "method">): Promise<T> {
    return this.request<T>({ ...params, method: "DELETE" });
  }

  private async request<T>({
    method = "GET",
    endpoint,
    body,
    token,
    timeout = 5000,
  }: RequestParams): Promise<T> {
    const controller = new AbortController();
    let options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (typeof this.interceptor?.request === "function") {
      try {
        options = await this.interceptor.request(options, token);
      } catch (interceptorError) {
        return Promise.reject(await this.errorHandler.handle(interceptorError));
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          controller.abort();
          reject(new DOMException("Timeout", "AbortError"));
        }, timeout)
      );

      const response = await Promise.race([
        fetch(`${this.baseUrl}${endpoint}`, options),
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw { status: response.status, response };
      }

      if (typeof this.interceptor?.response === "function") {
        return await this.interceptor.response(response);
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return (await response.text()) as unknown as T;
    } catch (error) {
      return Promise.reject(await this.errorHandler.handle(error));
    }
  }
}
