# 카카오 로그인 설정 가이드

## 🎯 개요
카카오 로그인이 정상적으로 작동하려면 카카오 개발자 콘솔에서 Redirect URI를 올바르게 설정해야 합니다.

## 📋 현재 설정 상태
- ✅ KAKAO_CLIENT_ID: `7a8b2e28c8f11da18442ead7f1c82d46`
- ✅ KAKAO_CLIENT_SECRET: `mjOTB4Ic5QYVNHGBmvE3lQEadKAGLZfi`
- ✅ 백엔드 서버: `http://localhost:3004`
- ✅ 프론트엔드 서버: `http://localhost:5173`

## 🔧 카카오 개발자 콘솔 설정

### 1. 카카오 개발자 콘솔 접속
- [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
- 해당 앱 선택

### 2. Redirect URI 설정
**앱 설정 > 카카오 로그인 > Redirect URI**에서 다음 URI들을 추가해주세요:

#### 개발 환경용 URI
```
http://localhost:3004/api/auth/kakao/callback
```

#### 배포 환경용 URI (배포 시 추가)
```
https://yourdomain.com/api/auth/kakao/callback
```

### 3. 활성화 설정
- **카카오 로그인 활성화**: ON
- **OpenID Connect 활성화**: ON (선택사항)

### 4. 동의항목 설정
**앱 설정 > 카카오 로그인 > 동의항목**에서 다음 항목들을 설정:
- **닉네임**: 필수 동의
- **프로필 사진**: 선택 동의
- **카카오계정(이메일)**: 필수 동의

## 🚀 테스트 방법

### 1. 로컬 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. "카카오로 로그인" 버튼 클릭
3. 카카오 로그인 페이지로 리다이렉트 확인
4. 로그인 후 콜백 처리 확인

### 2. API 직접 테스트
```bash
# 브라우저에서 직접 접속
http://localhost:3004/api/auth/kakao
```

## ⚠️ 주의사항

1. **Redirect URI 정확성**: URI는 정확히 일치해야 합니다 (대소문자, 슬래시 포함)
2. **도메인 등록**: 카카오 개발자 콘솔에서 사용할 도메인을 미리 등록해야 합니다
3. **HTTPS 요구사항**: 배포 환경에서는 HTTPS가 필수입니다
4. **앱 검수**: 실제 서비스에서는 카카오 앱 검수가 필요할 수 있습니다

## 🔍 문제 해결

### 일반적인 오류들

#### 1. "redirect_uri_mismatch" 오류
- 카카오 개발자 콘솔의 Redirect URI 설정 확인
- `.env` 파일의 `KAKAO_REDIRECT_URI` 값 확인

#### 2. "invalid_client" 오류
- `KAKAO_CLIENT_ID` 값 확인
- 카카오 개발자 콘솔에서 앱 상태 확인

#### 3. "unauthorized_client" 오류
- `KAKAO_CLIENT_SECRET` 값 확인
- 카카오 로그인 활성화 상태 확인

## 📞 지원

- [카카오 개발자 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [카카오 개발자 포럼](https://devtalk.kakao.com/)

---

**✨ 설정이 완료되면 카카오 로그인이 정상적으로 작동합니다!**