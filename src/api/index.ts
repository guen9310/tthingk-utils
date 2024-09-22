type method = "GET" | "POST" | "DELETE" | "PUT";

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // GET 요청
  async get<T>(endpoint: string, timeout = 5000, token?: string): Promise<T> {
    const options = this.createFetchOptions("GET", undefined);
    const interceptedOptions = await this.requestInterceptor(options, token);
    const response = await this.withTimeout(
      fetch(`${this.baseUrl}${endpoint}`, interceptedOptions),
      timeout
    );
    return this.responseInterceptor<T>(response);
  }

  // POST 요청
  async post<T>(
    endpoint: string,
    body: any,
    token?: string,
    timeout = 5000
  ): Promise<T> {
    const options = this.createFetchOptions("POST", body);
    const interceptedOptions = await this.requestInterceptor(options, token);
    const response = await this.withTimeout(
      fetch(`${this.baseUrl}${endpoint}`, interceptedOptions),
      timeout
    );
    return this.responseInterceptor<T>(response);
  }

  // PUT 요청
  async put<T>(
    endpoint: string,
    body: any,
    token?: string,
    timeout = 5000
  ): Promise<T> {
    const options = this.createFetchOptions("PUT", body);
    const interceptedOptions = await this.requestInterceptor(options, token);
    const response = await this.withTimeout(
      fetch(`${this.baseUrl}${endpoint}`, interceptedOptions),
      timeout
    );
    return this.responseInterceptor<T>(response);
  }

  // DELETE 요청
  async delete<T>(
    endpoint: string,
    token?: string,
    timeout = 5000
  ): Promise<T> {
    const options = this.createFetchOptions("DELETE");
    const interceptedOptions = await this.requestInterceptor(options, token);
    const response = await this.withTimeout(
      fetch(`${this.baseUrl}${endpoint}`, interceptedOptions),
      timeout
    );
    return this.responseInterceptor<T>(response);
  }

  // 요청 인터셉터
  private async requestInterceptor(
    options: RequestInit,
    token?: string
  ): Promise<RequestInit> {
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return options;
  }

  // 응답 인터셉터
  private async responseInterceptor<T>(response: Response): Promise<T> {
    const clonedResponse = response.clone();
    const responseData = await clonedResponse
      .json()
      .catch(() => clonedResponse.text());

    console.log("API Response Data:", responseData);

    return this.handleResponse<T>(response);
  }

  // 공통 응답 처리
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "API 요청 실패");
    }
    return response.json();
  }

  private async withTimeout<T>(
    promise: Promise<Response>,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), timeout)
        ),
      ]);
      return response;
    } finally {
      clearTimeout(id);
    }
  }
  // Fetch 옵션 생성
  private createFetchOptions(method: method, body?: any): RequestInit {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }
}
