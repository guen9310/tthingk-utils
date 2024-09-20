import { APIClient } from "..";
describe("APIClient 성공 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
      clone: function () {
        return this;
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청 성공 테스트", async () => {
    const data = await apiClient.get("/posts/1");

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        signal: expect.any(Object),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("POST 요청 성공 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    const data = await apiClient.post("/posts", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockBody),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("PUT 요청 성공 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    const data = await apiClient.put("/posts/1", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(mockBody),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });

  it("DELETE 요청 성공 테스트", async () => {
    const data = await apiClient.delete("/posts/1");

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "DELETE",
        signal: expect.any(Object),
      })
    );
    expect(data).toEqual({ data: "test data" });
  });
});

describe("APIClient 에러 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue("API 요청 실패"),
      clone: function () {
        return {
          ok: false,
          json: jest.fn().mockRejectedValue(new Error("JSON 파싱 실패")),
          text: jest.fn().mockResolvedValue("API 요청 실패"),
        };
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청 에러 핸들링 테스트", async () => {
    await expect(apiClient.get("/error-test")).rejects.toThrow("API 요청 실패");
  });

  it("POST 요청 에러 핸들링 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await expect(apiClient.post("/error-test", mockBody)).rejects.toThrow(
      "API 요청 실패"
    );
  });

  it("타임아웃 발생 테스트", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new DOMException("요청 시간이 초과되었습니다.", "AbortError")
                ),
              100
            )
          )
      );

    await expect(apiClient.get("/timeout-test", 50)).rejects.toThrow(
      "요청 시간이 초과되었습니다."
    );
  });
});

describe("APIClient 인증 토큰 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;
  const mockToken = "test_token";

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
      clone: function () {
        return this;
      },
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    await apiClient.get("/posts/1", 5000, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        signal: expect.any(Object),
      })
    );
  });

  it("POST 요청에서 인증 토큰이 헤더에 추가되는지 테스트", async () => {
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    await apiClient.post("/posts", mockBody, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })
    );
  });
});
