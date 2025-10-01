# IC Wallet Repository Overview

## 프로젝트 개요
- React 18 + TypeScript + Vite 로 구현된 모바일 우선 지갑 대시보드.
- Zustand 기반 mock 데이터 스토어와 React Query 로 상태/데이터 흐름 구성.
- `api/` 디렉터리에 Express 기반 인증 API 샘플이 포함되지만 실제 비즈니스 로직은 미구현.
- Tailwind CSS 테마와 Radix UI/Headless UI 컴포넌트를 활용한 UI 빌딩 블록.

## 실행 스크립트 (package.json)
| 스크립트 | 설명 |
| --- | --- |
| `npm run client:dev` | Vite 개발 서버 (포트 5173 기본) |
| `npm run server:dev` | Nodemon 으로 Express API 서버 실행 (`api/server.ts`) |
| `npm run dev` | concurrently 로 프론트/백 동시 실행 |
| `npm run build` | TypeScript build + Vite 프로덕션 번들 생성 |
| `npm run preview` | 빌드 산출물 프리뷰 |
| `npm run lint` | ESLint 검사 |
| `npm run check` | 타입체크 (noEmit) |

## 주요 디렉터리
- `src/` 프론트엔드 소스
  - `App.tsx`: Router, ProtectedRoute, QueryClient 초기화.
  - `pages/`: 화면 구성 (`Home`, `P2P`, `Mining`, `Finance`, `Gift`, `MyPage`, `Login`).
  - `components/`: 글로벌 헤더, 바텀 내비, UI 패턴 정리.
  - `components/ui/`: 버튼, 카드, 다이얼로그 등 공통 UI 킷.
  - `stores/`: Zustand 스토어 (user, asset, mining, p2p, gift) - mock API 내장.
  - `utils/`: 공용 util (`web3.ts`, `coinIcons.ts`, `cn.ts`).
  - `lib/utils.ts`: tailwind merge, 숫자 포맷 도우미.
  - `hooks/useTheme.ts`: 라이트/다크 테마 토글 훅.
  - `types/index.ts`: 전역 타입 선언.
- `api/`: Express 앱 (`app.ts`, `server.ts`, `routes/auth.ts`) - 인증 엔드포인트 TODO 상태.
- `public/`: 정적 리소스.
- `dist/`: 최근 Vite 빌드 산출물 (배포용).
- 구성 파일: `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `vercel.json`, `.trae/` 등.

## 화면별 요약
### 인증 및 레이아웃
- `Login.tsx`: 카카오·구글·애플 소셜 로그인 UI. `useUserStore.socialLogin` mock 호출 후 `/home`으로 이동.
- `Layout.tsx`: GlobalHeader + Outlet + BottomNavigation. `/login` 등 특정 경로에서 바텀 내비 숨김.
- `GlobalHeader.tsx`, `BottomNavigation.tsx`: 라우트 기반 활성화, 알림/메뉴 버튼 포함.

### 홈 대시보드 (`pages/Home.tsx`)
- React Query 로 `useAssetStore.fetchSummary` 래핑. 총자산, 토큰별 잔고, 채굴 자산, 기프트 카드 요약 제공.
- 빠른 실행 버튼(송금, 받기, QR 결제, 구매), 토큰/채굴 카드 확장 토글, GiftCardNFT 그리드 구성.

### P2P 마켓 (`pages/P2P.tsx`)
- `useP2PStore` mock 데이터를 기반으로 매도/매수/내 거래 탭 구성.
- 토큰·NFT·쿠폰·기타 제품 타입 탭, 자산 필터, 검색바 제공.
- 주문 카드에 스마트컨트랙트 상태, 거래 방식(normal/smart contract), 액션 버튼 노출.
- `web3Manager` 연동 버튼은 mock 트랜잭션 해시 반환. 실제 체인 연결은 ethers 기반으로 확장 가능.

### Mining 센터 (`pages/Mining.tsx`)
- 채굴 코인 그리드, 모달에서 7일 수익·해시레이트, 출금 폼, 애니메이션 상태 제공.
- API 연동은 미완성이며 현재는 모든 지표가 프런트 mock 로 계산됨.

### Finance (`pages/Finance.tsx`)
- 스테이킹·NFT 대여·대출 탭. 각 카드가 APY, 최소/최대 금액, 남은 슬롯, 누적 스테이킹 등을 표시.
- 보상 요약, 출금 히스토리 mock 데이터 포함. 추후 실제 상품/거래 API 필요.

### Gift 스토어 (`pages/Gift.tsx`)
- IC Gift NFT, 제휴 기프트 카드, 일반 상품 탭별 필터/정렬 지원.
- 구매 모달에서 결제 수단(USDT, ICF, IC NFT) 선택, 배송 정보 입력, QR 생성.
- `useGiftStore` 의 mock 재고, 카드 목록, 사용 기록으로 화면 구성.

### My Page (`pages/MyPage.tsx`)
- 프로필, 보안, 알림, 환율/언어, 연결 기기, 화이트리스트, 고객센터 등 설정 섹션.
- `useUserStore.updateProfile/updateSettings` 로 mock 사용자 데이터 갱신.
- 로그아웃 확인 모달 및 다양한 토글 인터랙션 제공.

## 상태 관리 및 데이터 흐름
- `stores/` 폴더의 Zustand 스토어가 화면에 필요한 데이터를 모두 제공.
- 각 스토어는 `mockFetch*` 함수로 비동기 지연과 샘플 데이터를 반환하며 에러/로딩 상태 포함.
- React Query (`useQuery`) 는 주로 로딩/캐싱 UX 개선용으로 스토어 액션을 래핑.
- 실제 API 연동 시 스토어 내부 mock 함수만 교체하면 UI 로직 대부분 재사용 가능.

## 블록체인/웹3
- `utils/web3.ts` 에 BSC 네트워크 스펙, 에스크로 컨트랙트 ABI, ethers 기반 지갑 연결/주문 함수 정의.
- `web3Manager` 싱글턴이 MetaMask 연결, 체인 스위치, 잔액/토큰 조회, 주문 관련 함수 실행.
- 현재 컨트랙트 주소와 ABI 는 플레이스홀더이므로 실제 배포 시 교체해야 함.

## 스타일 및 테마
- Tailwind 설정(`tailwind.config.js`)에 프라이머리/세컨더리 팔레트, Pretendard 폰트, radius, touch target 규격 정의.
- `src/index.css` 는 폰트 import, 배경/스크롤바 스타일, 다크 모드 대비 지정.
- `components/ui/` 폴더는 Radix 패턴 기반 Card, Dialog, Tabs, Button 등의 래퍼 컴포넌트 제공.

## 백엔드 스텁
- `api/app.ts` Express 앱: JSON/CORS 설정, `/api/auth/*` 라우트, `/api/health`, 에러/404 핸들러 포함.
- `routes/auth.ts` 의 register/login/logout 은 TODO 주석만 존재.
- `server.ts` 는 포트 3001 기본, SIGTERM/SIGINT 핸들링.
- 현재 프런트는 모든 데이터를 mock 으로 사용; 실제 서비스 연동 시 API 또는 Supabase 등과 연결 필요.

## 배포/구성 참고
- `vercel.json` 과 `.vercelignore`: Vercel 서버리스 배포 대비 설정.
- `nodemon.json`: `api/server.ts` 감시 설정.
- `vite.config.ts`: React 플러그인, Trae 솔로 배지 플러그인, tsconfig-paths 사용.
- `.trae/`: Trae AI 도구 관련 메타데이터.

## 향후 작업 제안
1. Express auth 라우트 구현 및 외부 인증/DB 연동.
2. Zustand 스토어 mock 로직을 실제 API 호출로 대체하고 타입 정비.
3. `web3Manager` 에 실제 컨트랙트 주소/ABI 반영, 주문 플로우 트랜잭션 연결.
4. React Query 의 queryKey/캐시 전략 명확화, 에러 핸들링/토스트 일원화.
5. 다국어 지원(i18n) 리소스 분리 및 현재 깨진 한글 문자열 검수.
6. 유닛/통합 테스트 추가 및 ESLint 규칙 확정.
