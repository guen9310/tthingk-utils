export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return this.handleResponse<T>(response);
  }

  // POST 요청
  async post<T>(endpoint: string, body: any): Promise<T> {
    const response: Response = await fetch(
      `${this.baseUrl}${endpoint}`,
      this.createFetchOptions("POST", body)
    );
    return this.handleResponse<T>(response);
  }

  // PUT 요청
  async put<T>(endpoint: string, body: any): Promise<T> {
    const response: Response = await fetch(
      `${this.baseUrl}${endpoint}`,
      this.createFetchOptions("PUT", body)
    );
    return this.handleResponse<T>(response);
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });
    return this.handleResponse<T>(response);
  }

  // 공통 응답 처리
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || "API 요청 실패";
      } catch (err) {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage || "API 요청 실패");
    }
    return response.json();
  }
  // Fetch 옵션 생성
  private createFetchOptions(method: string, body?: any): RequestInit {
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
