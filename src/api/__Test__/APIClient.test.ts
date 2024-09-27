import { setupServer } from "msw/node";
import { delay, http, HttpResponse } from "msw";
import { apiService } from "..";
import { handlers } from "./handlers";

// Mock 서버 설정
const server = setupServer(...handlers);
const baseUrl = "https://api.example.com";
// Mock 서버 시작 및 종료 처리
beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("APIClient 성공 테스트", () => {
  const api = apiService(baseUrl, { logging: false });
  test("GET 요청 성공", async () => {
    const result = await api.get("/user");
    expect(result.data).toEqual({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      firstName: "John",
      lastName: "Maverick",
    });
  });

  test("GET qs 요청 성공", async () => {
    server.use(
      http.get(`${baseUrl}/user`, ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page");
        const limit = url.searchParams.get("limit");

        return HttpResponse.json({
          searchParams: { page, limit },
        });
      })
    );
    const result = await api.get("/user", {
      queryParams: { page: 1, limit: 10 },
    });
    expect(
      (
        result.data as {
          searchParams: {
            page: string;
            limit: string;
          };
        }
      ).searchParams
    ).toEqual({
      page: "1",
      limit: "10",
    });
  });

  test("POST 요청 성공", async () => {
    const mockBody = {
      userId: 1,
      firstName: "foo",
      lastName: "bar",
    };
    const result = await api.post("/user", {
      body: mockBody,
    });
    expect(result.data).toEqual({
      message: `new Account Success, ${result.data}`,
    });
  });

  test("POST 요청에서 method를 GET으로 덮어쓰기 시도했을 때, POST 요청이 유지되는지 테스트", async () => {
    const mockBody = {
      userId: 1,
      firstName: "foo",
      lastName: "bar",
    };

    const result = await api.post("/user", {
      method: "GET",
      body: mockBody,
    } as any);

    expect(result.data).toEqual({
      message: `new Account Success, ${result.data}`,
    });
  });
});

describe("APIClient 상태 코드 에러 테스트", () => {
  const api = apiService("https://api.example.com");

  const errorScenarios = [
    { status: 400, expectedMessage: "요청 실패: 400" },
    { status: 401, expectedMessage: "요청 실패: 401" },
    { status: 403, expectedMessage: "요청 실패: 403" },
    { status: 404, expectedMessage: "요청 실패: 404" },
    { status: 500, expectedMessage: "요청 실패: 500" },
  ];

  const fetchDataTimeout = async (api: any, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await api.get("/user", {
        signal: controller.signal,
      });
      clearTimeout(id);
      return response.data;
    } catch (error) {
      if ((error as any).name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    }
  };

  errorScenarios.forEach(({ status, expectedMessage }) => {
    test(`${status} 에러 테스트`, async () => {
      server.use(
        http.get(`${baseUrl}/user`, () => {
          return new HttpResponse(
            JSON.stringify({ message: expectedMessage }),
            {
              status,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        })
      );
      try {
        await api.get("/user");
      } catch (error: any) {
        expect(error.status).toBe(status);
        expect(error.message).toBe(expectedMessage);
      }
    });
  });

  test("API 지연 테스트", async () => {
    server.use(
      http.get(`${baseUrl}/user`, async () => {
        await delay(200);
        return HttpResponse.json({ name: "John Doe" });
      })
    );

    await expect(async () => {
      await api.get("/user", { timeout: 100 });
    }).rejects.toThrow("Request timed out");
  });
});

describe("APIClient 인터셉터 테스트", () => {
  const interceptor = {
    request: async (options: RequestInit) => {
      const token = "my-token";
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return options;
    },
    response: async (response: Response) => {
      const data = await response.json();
      return { ...data, modified: true };
    },
  };

  const api = apiService(baseUrl, { interceptor });

  // request 인터셉터 테스트

  test("GET 요청에서 request 인터셉터로 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    server.use(
      http.get(`${baseUrl}/user`, async ({ request }) => {
        return HttpResponse.json({
          Authorization: request.headers.get("Authorization"),
        });
      })
    );

    const result = await api.get("/user");
    expect((result.data as any).Authorization).toBe("Bearer my-token");
  });

  // response 인터셉터 성공 테스트
  test("GET 요청에서 response 인터셉터가 데이터를 수정하는지 테스트", async () => {
    const result = await api.get("/user");

    expect(result.data).toEqual({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      firstName: "John",
      lastName: "Maverick",
      modified: true,
    });
  });

  test("GET 요청에서 401 Unauthorized 에러를 테스트", async () => {
    server.use(
      http.get(`${baseUrl}/user`, async () => {
        return new HttpResponse(null, {
          status: 401,
        });
      })
    );

    try {
      await api.get("/user");
    } catch (error: any) {
      // 에러 상태 코드 확인
      expect(error.status).toBe(401);
      expect(error.message).toBe("요청 실패: 401");
    }
  });
});
