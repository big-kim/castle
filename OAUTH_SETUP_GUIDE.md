# OAuth 소셜 로그인 설정 가이드

이 가이드는 카카오, 구글, 애플 소셜 로그인을 설정하는 방법을 설명합니다.

## 현재 상태

현재 `.env` 파일의 OAuth 설정이 플레이스홀더 값으로 되어 있어 소셜 로그인이 작동하지 않습니다.
소셜 로그인을 사용하려면 각 플랫폼에서 OAuth 애플리케이션을 등록하고 실제 클라이언트 ID와 시크릿을 설정해야 합니다.

## 1. 카카오 로그인 설정

### 1.1 카카오 개발자 콘솔에서 앱 등록
1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장

### 1.2 플랫폼 설정
1. 앱 설정 > 플랫폼 > Web 플랫폼 등록
2. 사이트 도메인: `http://localhost:5173` (개발용)

### 1.3 카카오 로그인 활성화
1. 제품 설정 > 카카오 로그인 > 활성화 설정 ON
2. Redirect URI 등록: `http://localhost:3003/api/auth/kakao/callback`

### 1.4 .env 파일 업데이트
```env
KAKAO_CLIENT_ID=your_actual_kakao_app_key
KAKAO_CLIENT_SECRET=your_actual_kakao_client_secret
```

## 2. 구글 로그인 설정

### 2.1 Google Cloud Console에서 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2.2 OAuth 2.0 클라이언트 ID 생성
1. API 및 서비스 > 사용자 인증 정보
2. 사용자 인증 정보 만들기 > OAuth 클라이언트 ID
3. 애플리케이션 유형: 웹 애플리케이션
4. 승인된 리디렉션 URI: `http://localhost:3003/api/auth/google/callback`

### 2.3 .env 파일 업데이트
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## 3. 애플 로그인 설정

### 3.1 Apple Developer Program 등록
1. [Apple Developer](https://developer.apple.com/)에서 개발자 계정 필요
2. 유료 멤버십 필요 ($99/년)

### 3.2 App ID 및 Service ID 생성
1. Certificates, Identifiers & Profiles > Identifiers
2. App ID 생성 후 Sign In with Apple 활성화
3. Service ID 생성 및 설정

### 3.3 .env 파일 업데이트
```env
APPLE_CLIENT_ID=your_actual_apple_service_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

## 4. 개발 모드에서 테스트하기

### 4.1 OAuth 없이 테스트
현재 구현된 오류 처리로 인해 OAuth가 설정되지 않은 경우 사용자에게 명확한 메시지가 표시됩니다:
- "카카오 로그인이 현재 설정되지 않았습니다. 관리자에게 문의해주세요."
- "구글 로그인이 현재 설정되지 않았습니다. 관리자에게 문의해주세요."
- "애플 로그인이 현재 설정되지 않았습니다. 관리자에게 문의해주세요."

### 4.2 일반 로그인 사용
소셜 로그인 대신 이메일/패스워드 로그인을 사용할 수 있습니다.

## 5. 프로덕션 배포 시 주의사항

1. **도메인 변경**: 모든 OAuth 설정에서 `localhost`를 실제 도메인으로 변경
2. **HTTPS 필수**: 프로덕션에서는 HTTPS 사용 필수
3. **환경 변수 보안**: `.env` 파일을 git에 커밋하지 않도록 주의
4. **Redirect URI 업데이트**: 각 플랫폼에서 프로덕션 도메인으로 Redirect URI 업데이트

## 6. 문제 해결

### 6.1 일반적인 오류
- **"OAuth is not configured"**: `.env` 파일의 클라이언트 ID/시크릿 확인
- **"Invalid redirect URI"**: 각 플랫폼에서 Redirect URI 설정 확인
- **"Invalid client"**: 클라이언트 ID가 올바른지 확인

### 6.2 로그 확인
백엔드 서버 로그에서 상세한 오류 정보를 확인할 수 있습니다.

## 7. 추가 리소스

- [카카오 로그인 개발가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In 가이드](https://developer.apple.com/sign-in-with-apple/)

---

**참고**: 이 가이드는 개발 환경 기준으로 작성되었습니다. 프로덕션 환경에서는 보안 설정을 추가로 검토해주세요.