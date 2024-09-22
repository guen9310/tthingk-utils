import { RequestInterceptor } from "api/interceptor";
import { APIClient } from "..";

describe("APIClient 성공 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    apiClient = new APIClient(baseUrl);

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

describe("APIClient 에러 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    jest.useFakeTimers();
    apiClient = new APIClient(baseUrl);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false, // 에러 응답을 위한 설정
      status: 500, // HTTP 상태 코드 추가
      json: jest.fn().mockResolvedValue("API 요청 실패"), // json 메서드 추가
      clone: function () {
        return this;
      },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("GET 요청 에러 핸들링 테스트", async () => {
    await expect(apiClient.get({ endpoint: "/error-test" })).rejects.toThrow(
      "API 요청 실패"
    );
  });

  it("POST 요청 에러 핸들링 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await expect(
      apiClient.post({ endpoint: "/error-test", body: mockBody })
    ).rejects.toThrow("API 요청 실패");
  });
  it("PUT 요청 에러 핸들링 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await expect(
      apiClient.put({ endpoint: "/error-test", body: mockBody })
    ).rejects.toThrow("API 요청 실패");
  });

  it("DELETE 요청 에러 핸들링 테스트", async () => {
    await expect(apiClient.delete({ endpoint: "/error-test" })).rejects.toThrow(
      "API 요청 실패"
    );
  });
});

describe("APIClient 인증 토큰 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  const mockToken = "token";
  let apiClient: APIClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    const requestInterceptor: RequestInterceptor = {
      apply: async (options, token) => {
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return options;
      },
    };

    apiClient = new APIClient(baseUrl, requestInterceptor);

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

  it("GET 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    await apiClient.get({ endpoint: "/posts/1", token: mockToken });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        signal: expect.anything(),
      })
    );
  });

  it("POST 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await apiClient.post({
      endpoint: "/posts",
      body: mockBody,
      token: mockToken,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`, // POST 요청의 endpoint 수정
      expect.objectContaining({
        method: "POST", // POST 메서드 추가
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody), // 요청 body 확인
        signal: expect.anything(),
      })
    );
  });

  it("PUT 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await apiClient.put({
      endpoint: "/posts/1",
      body: mockBody,
      token: mockToken,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "PUT", // PUT 메서드 추가
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody), // 요청 body 확인
        signal: expect.anything(),
      })
    );
  });

  it("DELETE 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    await apiClient.delete({ endpoint: "/posts/1", token: mockToken });

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "DELETE", // DELETE 메서드 추가
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        signal: expect.anything(),
      })
    );
  });
});
