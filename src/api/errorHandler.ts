const createError = (
  status: number,
  message: string,
  originalError?: unknown
) => {
  return {
    status,
    message,
    originalError,
  };
};

// handleError 함수
export const handleError = (error: unknown): never => {
  // AbortError 처리
  if (error instanceof DOMException && error.name === "AbortError") {
    throw createError(408, "API 요청 시간 초과", error);
  }

  // 네트워크 에러 처리
  if (error instanceof TypeError) {
    throw createError(503, "네트워크 에러: 서버에 연결할 수 없습니다.", error);
  }

  // HTTP 에러 처리
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status, message } = error as { status: number; message: string };
    throw createError(
      status,
      message || "서버에서 오류가 발생했습니다.",
      error
    );
  }

  // 예기치 못한 에러 처리
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw createError(500, `알 수 없는 오류 발생: ${errorMessage}`, error);
};
