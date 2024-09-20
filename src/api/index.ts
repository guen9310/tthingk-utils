import { handleResponse, createFetchOptions } from "./lib/utils";

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return handleResponse<T>(response);
  }

  // POST 요청
  async post<T>(endpoint: string, body: any): Promise<T> {
    const response: Response = await fetch(
      `${this.baseUrl}${endpoint}`,
      createFetchOptions("POST", body)
    );
    return handleResponse<T>(response);
  }

  // PUT 요청
  async put<T>(endpoint: string, body: any): Promise<T> {
    const response: Response = await fetch(
      `${this.baseUrl}${endpoint}`,
      createFetchOptions("PUT", body)
    );
    return handleResponse<T>(response);
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });
    return handleResponse<T>(response);
  }
}
