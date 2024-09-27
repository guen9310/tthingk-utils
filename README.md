# tthingk-utils

tthingk-utils는 간단하고 자주 사용되는 유틸리티 함수들을 모아 놓은 학습용 개인 라이브러리입니다. 이 라이브러리는 Axios와 Zustand와 같은 상용 라이브러리에서 제공하는 기능들을 참고하여, 비슷한 효과를 내는 것을 목표로 하고 있습니다. 이를 통해 실제 프로젝트에서 자주 사용하는 패턴을 이해하고, 더 나아가 직접 구현해보며 학습을 도모합니다.

## APIClient

웹과 앱 환경에서 공통적으로 사용할 수 있는 API 요청 유틸리티를 제공하며, 다양한 프로젝트에서 쉽게 활용할 수 있습니다.

### 주요 기능

- RESTful API 요청 처리 (GET, POST, PUT, DELETE)
- 타임아웃 처리
- 요청/응답 인터셉터
- 로깅 기능

### 사용 방법

#### 1. 기본 사용 방법

```ts
import { apiService } from "tthingk-utils/api";

// 기본 API 클라이언트 생성
const api = apiService("https://api.example.com");

// GET 요청 예시
const data = await api.get("/users");

// POST 요청 예시
const newUser = await api.post("/users", {
  body: { name: "John Doe", email: "john@example.com" },
});
```

#### 2. interceptor

인터셉터는 요청과 응답을 가로채어 특정 로직을 추가할 수 있는 기능입니다. request 인터셉터는 HTTP 요청이 서버로 보내지기 전에 호출되고, response 인터셉터는 서버에서 응답을 받은 후에 호출됩니다.

```ts
const apiWithInterceptor = apiService("https://api.example.com", {
  interceptor: {
    request: async (options) => {
      // 요청 전에 토큰을 헤더에 추가
      const token = "your-token-here";
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return options;
    },
    response: async (response) => {
      // 응답 데이터 수정
      const data = await response.json();
      return { data, modify: true };
    },
  },
});

// 인터셉터가 적용된 GET 요청
const userData = await apiWithInterceptor.get("/users/me");
```

#### 3.timeout

타임아웃 옵션을 사용하면 지정된 시간 내에 응답을 받지 못할 경우 요청을 중단할 수 있습니다. 기본 타임아웃은 5000ms(5초)로 설정되어 있으며, 개별 요청에서도 타임아웃 시간을 지정할 수 있습니다.

```ts
const apiWithTimeout = apiService("https://api.example.com", {
  timeout: 10000, // 기본 타임아웃을 10초로 설정
});

// 타임아웃 10초로 GET 요청
try {
  const data = await apiWithTimeout.get("/long-request");
} catch (error) {
  console.error("요청이 시간 초과되었습니다.");
}

// 개별 요청에 타임아웃 설정
const dataWithCustomTimeout = await apiWithTimeout.get("/quick-request", {
  timeout: 3000, // 3초 타임아웃
});
```

#### 4. logging

로깅 기능을 활성화하면 콘솔에 요청 및 응답의 세부 정보가 출력됩니다. 이를 통해 개발자가 요청 및 응답 데이터를 쉽게 디버깅할 수 있습니다.

```ts
const apiWithLogging = apiService("https://api.example.com", {
  logging: true, // 로깅 기능 활성화
});

// 로깅이 활성화된 상태로 POST 요청
const newUser = await apiWithLogging.post("/users", {
  body: { name: "Jane Doe", email: "jane@example.com" },
});

// 콘솔 출력 예시:
// -----[POST] REQUEST-----
// [URL]: https://api.example.com/users
// [HEADERS]: { "Content-Type": "application/json" }
// [BODY]: { name: "Jane Doe", email: "jane@example.com" }
//
// -------RESPONSE-------
// [STATUS]: 200
// [DURATION]: 123 ms
// [RESPONSE BODY]: { id: "123", name: "Jane Doe", email: "jane@example.com" }
```

## StoreManager(미정)

향후 구독형 상태 관리 라이브러리로 확장될 예정입니다. 이를 통해 다양한 상태 관리 패턴을 쉽게 구현하고, 컴포넌트 간 상태를 효율적으로 관리할 수 있도록 지원할 계획입니다.
