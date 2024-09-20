import { APIClient } from "..";
import { handleResponse, createFetchOptions } from "../lib/utils";

jest.mock("../lib/utils");

describe("APIClient", () => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient(baseUrl);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET 요청 테스트", async () => {
    const mockResponse = { data: "test data" };
    (handleResponse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const data = await apiClient.get("/posts/1");

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/posts/1`);
    expect(data).toEqual(mockResponse);
  });

  it("POST 요청 테스트", async () => {
    const mockResponse = { success: true };
    const mockBody = { title: "foo", body: "bar", userId: 1 };
    (handleResponse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const data = await apiClient.post("/posts", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts`,
      createFetchOptions("POST", mockBody)
    );
    expect(data).toEqual(mockResponse);
  });

  it("PUT 요청 테스트", async () => {
    const mockResponse = { success: true };
    const mockBody = { title: "foo", body: "bar", userId: 1 };
    (handleResponse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const data = await apiClient.put("/posts/1", mockBody);

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/posts/1`,
      createFetchOptions("PUT", mockBody)
    );
    expect(data).toEqual(mockResponse);
  });

  it("DELETE 요청 테스트", async () => {
    const mockResponse = { success: true };
    (handleResponse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const data = await apiClient.delete("/posts/1");

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/posts/1`, {
      method: "DELETE",
    });
    expect(data).toEqual(mockResponse);
  });
});
