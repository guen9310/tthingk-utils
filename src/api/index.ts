type method = "GET" | "POST" | "DELETE" | "PUT";

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // GET 요청
  async get<T>(endpoint: string, timeout = 5000): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  }

  // POST 요청
  async post<T>(endpoint: string, body: any, timeout = 5000): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        this.createFetchOptions("POST", body, controller)
      );
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  }

  // PUT 요청
  async put<T>(endpoint: string, body: any, timeout = 5000): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        this.createFetchOptions("PUT", body, controller)
      );
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  }

  // DELETE 요청
  async delete<T>(endpoint: string, timeout = 5000): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(id);
    }
  }

  // 공통 응답 처리
  private async handleResponse<T>(response: Response): Promise<T> {
    try {
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "API 요청 실패");
      }
      return response.json();
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다.");
      }
      throw error;
    }
  }

  // Fetch 옵션 생성
  private createFetchOptions(
    method: method,
    body?: any,
    controller?: AbortController
  ): RequestInit {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: controller?.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }
    return options;
  }
}
