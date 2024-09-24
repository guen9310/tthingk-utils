# tthingk-utils

tthingk-utils는 간단하고 자주 사용되는 유틸리티 함수들을 모아 놓은 개인 라이브러리입니다. 웹과 앱 환경에서 공통적으로 사용할 수 있는 API 요청 유틸리티를 제공하며, 다양한 프로젝트에서 쉽게 활용할 수 있습니다.

## 주요 기능

### APIClient

- RESTful API 요청 처리 (GET, POST, PUT, DELETE)
- 타임아웃 처리
- 요청/응답 인터셉터
- 로깅 기능

#### 사용 방법

```ts
import { createAPIClient } from "tthingk-utils/api";

const api = createAPIClient("https://api.example.com");
// GET 요청 예시
const data = await api.get({ endpoint: "/users" });
// POST 요청 예시
const newUser = await api.post({
  endpoint: "/users",
  body: { name: "John Doe", email: "john@example.com" },
});
// 인터셉터 사용 예시
const apiWithInterceptor = createAPIClient("https://api.example.com", {
  interceptor: {
    request: async (options) => {
      // 요청 전 처리 로직
      const token = "your-token-here";
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return options;
    },
    response: async (response) => {
      // 응답 후 처리 로직
      const data = await response.json();
      return { data, modify: true };
    },
  },
});

await apiWithInterceptor.get({ endpoint: "/users/me" });
```
