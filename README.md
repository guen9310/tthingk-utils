# tthingk-utils

tthingk-utils는 간단하고 자주 사용되는 유틸리티 함수들을 모아 놓은 학습용 개인 라이브러리입니다. 이 라이브러리는 Axios와 Zustand와 같은 상용 라이브러리에서 제공하는 기능들을 참고하여, 비슷한 효과를 내는 것을 목표로 하고 있습니다. 이를 통해 실제 프로젝트에서 자주 사용하는 패턴을 이해할 목적으로 진행합니다.

## apiService

apiService는 웹과 앱 환경에서 공통적으로 사용할 수 있는 API 요청 유틸리티를 제공하며, 다양한 프로젝트에서 쉽게 활용할 수 있습니다. 이 클라이언트는 fetch API를 기반으로 하며, 간단한 RESTful API 요청을 처리하는 데 최적화되어 있습니다.

### 주요 기능

- RESTful API 요청 처리 (GET, POST, PUT, DELETE)
- 타임아웃 처리
- 요청/응답 인터셉터
- 로깅 기능

### 장점

1. **경량성**: 필수 기능만 포함하여 axios에 비해 가볍습니다. 그로 인해 번들 크기가 작아져, 성능에 민감한 애플리케이션에서 유리합니다.

2. **유연한 확장성**: 필수적인 기능(HTTP 요청, 타임아웃, 인터셉터 등)만 제공하고, 나머지 기능은 사용자가 필요할 때 추가할 수 있어 커스터마이징이 용이합니다.

3. **단순한 API**: API가 간결하게 설계되어 있어 복잡한 설정 없이도 쉽게 사용할 수 있습니다. 특히 초보 개발자나 특정 요구 사항에 맞춰 사용하기에 적합합니다.

4. **최신 브라우저 API 활용**: 최신 `fetch` API를 기반으로 하여 최신 브라우저 환경에서 최적화된 성능을 제공합니다. 또한, `fetch` API의 기본 기능을 그대로 활용해 더 나은 에러 핸들링과 스트림 처리도 가능합니다.

5. **의존성 최소화**: 의존성을 거의 사용하지 않거나 아예 사용하지 않기 때문에, 종속성 업데이트 및 관리가 간편하고 종속성 충돌의 위험이 줄어듭니다.

### 사용 방법

#### 기본값(Default)

```ts
import { apiService } from "tthingk-utils/api";

// 기본 API 클라이언트 생성
const api = apiService("https://api.example.com");

// GET 요청 예시
const user = await api.get("/users");

// 쿼리 매개변수 포함 GET 요청
const userList = await api.get("/users", {
  queryParams: { page: 1, limit: 10 },
});

// POST 요청 예시
const newUser = await api.post("/users", {
  body: { name: "John Doe", email: "john@example.com" },
});
```

#### 인터셉터 (Interceptor)

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

#### 타임아웃 (Timeout)

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

#### 로그 (Logging)

로그 기능을 활성화하면 콘솔에 요청 및 응답의 세부 정보가 출력됩니다. 이를 통해 개발자가 요청 및 응답 데이터를 쉽게 디버깅할 수 있습니다.

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
