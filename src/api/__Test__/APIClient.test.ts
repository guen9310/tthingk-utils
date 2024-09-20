import { APIClient } from "..";

describe("APIClient 성공 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청 성공 테스트", async () => {
    const mockResponse = { data: "test data" };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const data = await apiClient.get("/posts/1");

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        signal: expect.any(Object),
      })
    );
    expect(data).toEqual(mockResponse);
  });

  it("POST 요청 성공 테스트", async () => {
    const mockResponse = { success: true };
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const data = await apiClient.post("/posts", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockBody),
      })
    );
    expect(data).toEqual(mockResponse);
  });

  it("PUT 요청 성공 테스트", async () => {
    const mockResponse = { success: true };
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const data = await apiClient.put("/posts/1", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(mockBody),
      })
    );
    expect(data).toEqual(mockResponse);
  });

  it("DELETE 요청 성공 테스트", async () => {
    const mockResponse = { success: true };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const data = await apiClient.delete("/posts/1");

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      expect.objectContaining({
        method: "DELETE",
        signal: expect.any(Object),
      })
    );
    expect(data).toEqual(mockResponse);
  });
});

describe("APIClient 에러 테스트", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청 에러 핸들링 테스트", async () => {
    const errorMessage = "API 요청 실패";

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(errorMessage),
    });

    await expect(apiClient.get("/error-test")).rejects.toThrow(errorMessage);
  });

  it("POST 요청 에러 핸들링 테스트", async () => {
    const errorMessage = "API 요청 실패";
    const mockBody = { title: "foo", body: "bar", userId: 1 };

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(errorMessage),
    });

    await expect(apiClient.post("/error-test", mockBody)).rejects.toThrow(
      errorMessage
    );
  });

  it("타임아웃 발생 테스트", async () => {
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new DOMException("요청 시간이 초과되었습니다.", "AbortError")
              ),
            500
          )
        )
    );
    await expect(apiClient.get("/timeout-test", 100)).rejects.toThrow(
      "요청 시간이 초과되었습니다."
    );
  });
});
