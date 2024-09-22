import { RequestInterceptor, ResponseInterceptor } from "./interceptor";
import { createFetchOptions, withTimeout } from "./utils";
import { ErrorHandler } from "./errorHandler";

export type method = "GET" | "POST" | "DELETE" | "PUT";

interface RequestParams {
  method?: method;
  endpoint: string;
  body?: any;
  token?: string;
  timeout?: number;
}

export class APIClient {
  private baseUrl: string;
  private requestInterceptor?: RequestInterceptor;
  private responseInterceptor?: ResponseInterceptor;
  private errorHandler?: ErrorHandler;

  constructor(
    baseUrl: string,
    requestInterceptor?: RequestInterceptor,
    responseInterceptor?: ResponseInterceptor,
    errorHandler?: ErrorHandler
  ) {
    this.baseUrl = baseUrl;
    this.requestInterceptor = requestInterceptor;
    this.responseInterceptor = responseInterceptor;
    this.errorHandler = errorHandler;
  }
  // GET 요청
  async get<T>(params: RequestParams): Promise<T> {
    return this.request<T>({ ...params, method: "GET" });
  }

  // POST 요청
  async post<T>(params: RequestParams): Promise<T> {
    return this.request<T>({ ...params, method: "POST" });
  }

  // PUT 요청
  async put<T>(params: RequestParams): Promise<T> {
    return this.request<T>({ ...params, method: "PUT" });
  }

  // DELETE 요청
  async delete<T>(params: RequestParams): Promise<T> {
    return this.request<T>({ ...params, method: "DELETE" });
  }

  //공통 요청
  private async request<T>({
    method = "GET",
    endpoint,
    body,
    token,
    timeout = 5000,
  }: RequestParams): Promise<T> {
    const controller = new AbortController();
    let options = createFetchOptions(method, body);
    options.signal = controller.signal;

    // 요청 인터셉터가 있는 경우 적용
    if (this.requestInterceptor) {
      options = await this.requestInterceptor.apply(options, token);
    }

    try {
      const response = await withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, options),
        timeout,
        controller
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage);
      }

      // 응답 인터셉터가 있는 경우 적용
      if (this.responseInterceptor) {
        return await this.responseInterceptor.apply<T>(response);
      }

      // 응답 인터셉터가 없으면 기본 처리
      return await response.json();
    } catch (error) {
      // 에러 핸들러가 있는 경우 적용
      if (this.errorHandler) {
        return this.errorHandler.handle(error);
      }

      // 기본 에러 처리
      throw error;
    }
  }
}
