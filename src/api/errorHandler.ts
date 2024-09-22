export class ErrorHandler {
  handle(error: unknown): never {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
}
