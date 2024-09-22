# tthingk-utils

tthingk-utils는 간단하고 자주 사용되는 유틸리티 함수들을 모아 놓은 개인 라이브러리입니다. 웹과 앱 환경에서 공통적으로 사용할 수 있는 API 요청 유틸리티를 제공하며, 다양한 프로젝트에서 쉽게 활용할 수 있습니다.

## 주요 기능

### APIClient

- RESTful API 요청 처리 (GET, POST, PUT, DELETE)
- 타임아웃 처리
- 요청/응답 인터셉터
- 토큰 기반 인증 지원

#### 사용 방법

```ts
import { APIClient } from "tthingk-utils/api";
const api = new APIClient("https://api.example.com");

// GET 요청 예시
const data = await api.get({ endpoint: "/users" });

// POST 요청 예시
const newUser = await api.post({
  endpoint: "/users",
  body: { name: "John Doe", email: "john@example.com" },
});

// 인터셉터 사용 예시
const apiWithInterceptor = new APIClient("https://api.example.com", {
  interceptor: {
    request: async (options, token) => {
      // 요청 전 처리 로직
      return options;
    },
    response: async (response) => {
      // 응답 후 처리 로직
      return response.json();
    },
  },
});
```

### StoreManager (가제)
