import { http, HttpResponse } from "msw";

export const handlers = [
  // GET request handler
  http.get("https://api.example.com/user", () => {
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      firstName: "John",
      lastName: "Maverick",
    });
  }),
  // POST request handler
  http.post("https://api.example.com/user", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: `new Account Success, ${body}`,
    });
  }),
];
