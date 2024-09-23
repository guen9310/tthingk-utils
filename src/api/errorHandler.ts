export const handleError = async (error: unknown): Promise<never> => {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw { status: 408, message: "API 요청 시간 초과" };
  } else if (error instanceof TypeError) {
    throw {
      status: 503,
      message: "네트워크 에러: 서버에 연결할 수 없습니다.",
    };
  } else if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "response" in error
  ) {
    return await handleHttpError(error.response as Response);
  } else {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw { status: 500, message: `예기치 못한 에러 발생: ${errorMessage}` };
  }
};

const handleHttpError = async (response: Response): Promise<never> => {
  const status = response.status;

  try {
    const errorData = await response.json();
    switch (true) {
      case status >= 400 && status < 500:
        throw { status, message: errorData.message || "잘못된 요청입니다." };
      case status >= 500:
        throw {
          status,
          message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도하세요.",
        };
      default:
        throw { status, message: "알 수 없는 오류가 발생했습니다." };
    }
  } catch (jsonError) {
    throw {
      status,
      message: `HTTP 오류 ${status}: 응답을 처리할 수 없습니다.`,
    };
  }
};
