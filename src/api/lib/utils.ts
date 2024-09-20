// 공통 응답 처리
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "API 요청 실패");
  }
  return response.json();
}

// Fetch 옵션 생성
export function createFetchOptions(method: string, body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}
