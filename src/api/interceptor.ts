export class RequestInterceptor {
  async apply(options: RequestInit, token?: string): Promise<RequestInit> {
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return options;
  }
}

export class ResponseInterceptor {
  async apply<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "API 요청 실패");
    }
    return response.json();
  }
}
