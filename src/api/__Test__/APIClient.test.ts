import { createAPIClient } from "..";

describe("APIClient 성공 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: ReturnType<typeof createAPIClient>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    apiClient = createAPIClient(baseUrl);

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
      headers: new Headers({ "Content-Type": "application/json" }),
      clone: function () {
        return this;
      },
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("GET 요청 성공 테스트", async () => {
    const data = await apiClient.get({ endpoint: "/posts/1" });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: expect.anything(),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("POST 요청에서 method를 GET으로 덮어쓰기 시도했을 때, POST 요청이 유지되는지 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await apiClient.post({
      endpoint: "/posts",
      body: mockBody,
      method: "GET",
    } as any);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
        signal: expect.anything(),
      })
    );
  });

  it("POST 요청 성공 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    const data = await apiClient.post({
      endpoint: "/posts",
      body: mockBody,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
        signal: expect.anything(),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("PUT 요청 성공 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    const data = await apiClient.put({
      endpoint: "/posts/1",
      body: mockBody,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
        signal: expect.anything(),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("DELETE 요청 성공 테스트", async () => {
    const data = await apiClient.delete({ endpoint: "/posts/1" });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        signal: expect.anything(),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });
});

describe("APIClient 상태 코드 에러 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: ReturnType<typeof createAPIClient>;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    apiClient = createAPIClient(baseUrl);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
      headers: new Headers({ "Content-Type": "application/json" }),
      clone: function () {
        return this;
      },
    }) as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("500 상태 코드 에러 핸들링 테스트", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: "API 요청 실패" }),
      clone: function () {
        return this;
      },
    });

    await expect(
      apiClient.get({ endpoint: "/error-test" })
    ).rejects.toMatchObject({
      status: 500,
    });
  });

  it("404 상태 코드 에러 핸들링 테스트", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: jest
        .fn()
        .mockResolvedValue({ message: "리소스를 찾을 수 없습니다." }),
      clone: function () {
        return this;
      },
    });

    await expect(
      apiClient.get({ endpoint: "/error-test" })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("400 상태 코드 에러 핸들링 테스트", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: "잘못된 요청입니다." }),
      clone: function () {
        return this;
      },
    });

    await expect(
      apiClient.post({ endpoint: "/error-test", body: {} })
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it("401 상태 코드 에러 핸들링 테스트", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: "인증이 필요합니다." }),
      clone: function () {
        return this;
      },
    });

    await expect(
      apiClient.get({ endpoint: "/error-test" })
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it("타임아웃 에러가 발생하는지 테스트", async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new DOMException("Timeout", "AbortError")),
              6000
            )
          )
      );

    const promise = apiClient.get({ endpoint: "/timeout-test", timeout: 5000 });

    jest.advanceTimersByTime(6000);

    await expect(promise).rejects.toMatchObject({
      status: 408,
    });
  });
});

describe("APIClient 인터셉터 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: ReturnType<typeof createAPIClient>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    const interceptor = {
      request: async (options: RequestInit) => {
        const token = "token";
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
        return options;
      },
      response: async (response: Response) => {
        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(`응답 에러: ${errorMessage}`);
        }
        const responseData = await response.json();
        return { ...responseData, modified: true };
      },
    };

    apiClient = createAPIClient(baseUrl, { interceptor });

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
      clone: function () {
        return this;
      },
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // request 인터셉터 테스트
  it("GET 요청에서 request 인터셉터로 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    await apiClient.get({ endpoint: "/posts/1" });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
        },
        signal: expect.anything(),
      })
    );
  });

  // response 인터셉터 성공 테스트
  it("GET 요청에서 response 인터셉터가 데이터를 수정하는지 테스트", async () => {
    const data = await apiClient.get({
      endpoint: "/posts/1",
    });

    expect(data).toEqual({
      data: "test data",
      modified: true,
    });
  });

  // response 인터셉터 에러 처리 테스트
  it("GET 요청에서 response 인터셉터가 응답 에러를 처리하는지 테스트", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: "서버 오류" }),
      clone: function () {
        return this;
      },
    });

    try {
      await apiClient.get({ endpoint: "/posts/1" });
    } catch (error) {
      if (error instanceof Error)
        expect(error.message).toBe("응답 에러: 서버 오류");
    }
  });
});
