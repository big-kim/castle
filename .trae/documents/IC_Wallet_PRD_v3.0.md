# IC Wallet PRD v3.0 - 상세 제품 요구사항 문서

## 문서 정보
- **버전**: 3.0
- **작성일**: 2024년 12월
- **최종 수정일**: 2024년 12월
- **문서 상태**: 최종 승인
- **작성자**: IC Wallet 개발팀
- **승인자**: 제품 관리자

---

## 1. 프로젝트 개요

### 1.1 버전 정보
- **제품명**: IC Wallet
- **버전**: 3.0
- **플랫폼**: Web Application (React 18 + TypeScript)
- **대상 환경**: 모바일 우선 반응형 웹

### 1.2 목적 및 범위

#### 비즈니스 목적
IC Wallet은 차세대 통합 디지털 자산 관리 플랫폼으로, 다음과 같은 핵심 가치를 제공합니다:

1. **통합 자산 관리**: 암호화폐, NFT, 기프트카드를 하나의 플랫폼에서 관리
2. **P2P 거래 생태계**: 블록체인 기반 안전한 개인간 거래 시스템
3. **채굴 수익 창출**: 8개 알트코인 채굴을 통한 패시브 인컴
4. **소셜 인증 통합**: 간편한 OAuth 기반 로그인 시스템

#### 프로젝트 범위
- **포함 범위**: 웹 기반 지갑 애플리케이션, 스마트 컨트랙트 연동, 실시간 데이터 동기화
- **제외 범위**: 네이티브 모바일 앱, 하드웨어 지갑 연동, 법정화폐 직접 거래

### 1.3 주요 기능 요약

#### 우선순위별 기능 분류

**P0 (최우선 - 출시 필수)**
- 사용자 인증 및 계정 관리
- 지갑 기본 기능 (잔고 조회, 송금, 수신)
- 홈 대시보드 및 자산 요약

**P1 (높음 - 출시 후 1개월 내)**
- P2P 거래 시스템
- 채굴 센터 기능
- 기프트카드 관리

**P2 (중간 - 출시 후 3개월 내)**
- 고급 차트 및 분석
- 알림 시스템
- 다국어 지원

### 1.4 이해관계자 분석

#### 주요 사용자 페르소나

**페르소나 1: 크립토 초보자 (김민수, 28세)**
- 특징: 암호화폐 투자 경험 1년 미만, 간편한 UI 선호
- 니즈: 직관적인 인터페이스, 안전한 거래, 교육 콘텐츠
- 사용 시나리오: 소액 투자, 기프트카드 구매, 간단한 송금

**페르소나 2: 숙련된 트레이더 (박지영, 35세)**
- 특징: 다양한 거래소 경험, 고급 기능 요구
- 니즈: 빠른 거래 실행, 상세한 차트, P2P 거래
- 사용 시나리오: 대량 거래, 채굴 수익 최적화, NFT 거래

**페르소나 3: 기프트카드 수집가 (이수진, 42세)**
- 특징: 온라인 쇼핑 애호가, 할인 혜택 추구
- 니즈: 다양한 기프트카드 옵션, 할인 정보, 간편 결제
- 사용 시나리오: 기프트카드 구매 및 선물, 포인트 적립

---

## 2. 상세 요구사항

### 2.1 기능별 상세 설명

#### 2.1.1 사용자 인증 시스템

**기능 개요**
- OAuth 2.0 기반 소셜 로그인 (Google, Kakao, Apple)
- JWT 토큰 기반 세션 관리
- Turnstile 보안 인증 통합

**상세 요구사항**

| 요구사항 ID | 기능명 | 상세 설명 | 우선순위 |
|------------|--------|-----------|----------|
| AUTH-001 | 소셜 로그인 | Google, Kakao, Apple OAuth 연동 | P0 |
| AUTH-002 | 토큰 관리 | JWT 토큰 자동 갱신 및 만료 처리 | P0 |
| AUTH-003 | 보안 인증 | Turnstile CAPTCHA 통합 | P1 |
| AUTH-004 | 프로필 관리 | 사용자 정보 수정 및 설정 관리 | P1 |

**수용 기준 (Acceptance Criteria)**

**AC-AUTH-001**: 소셜 로그인
```
GIVEN 사용자가 로그인 페이지에 접근했을 때
WHEN 소셜 로그인 버튼을 클릭하면
THEN 해당 제공자의 OAuth 인증 페이지로 리다이렉트되고
AND 인증 성공 시 홈 페이지로 이동한다
AND 사용자 정보가 로컬 스토리지에 저장된다
```

**AC-AUTH-002**: 토큰 자동 갱신
```
GIVEN 사용자가 로그인된 상태에서
WHEN JWT 토큰이 만료 30분 전이 되면
THEN 자동으로 토큰 갱신을 시도하고
AND 갱신 실패 시 로그인 페이지로 리다이렉트한다
```

#### 2.1.2 지갑 관리 시스템

**기능 개요**
- 다중 토큰 지원 (ICC, ICS, ICF, ICG, USDT, BNB 등)
- QR 코드 기반 주소 공유
- 실시간 잔고 업데이트

**상세 요구사항**

| 요구사항 ID | 기능명 | 상세 설명 | 우선순위 |
|------------|--------|-----------|----------|
| WALLET-001 | 잔고 조회 | 실시간 토큰 잔고 및 USD 환산 표시 | P0 |
| WALLET-002 | 송금 기능 | 주소 입력 또는 QR 스캔을 통한 토큰 전송 | P0 |
| WALLET-003 | 수신 기능 | QR 코드 생성 및 주소 복사 | P0 |
| WALLET-004 | 거래 내역 | 송금/수신 내역 조회 및 필터링 | P1 |

**입력/출력 데이터 정의**

**송금 요청 데이터**
```typescript
interface SendTransactionRequest {
  toAddress: string;           // 수신자 주소 (필수, 42자 hex)
  amount: number;             // 전송 금액 (필수, > 0)
  tokenSymbol: TokenSymbol;   // 토큰 심볼 (필수)
  memo?: string;              // 메모 (선택, 최대 100자)
  gasPrice?: number;          // 가스 가격 (선택)
}
```

**송금 응답 데이터**
```typescript
interface SendTransactionResponse {
  success: boolean;
  transactionHash?: string;   // 트랜잭션 해시
  estimatedConfirmTime?: number; // 예상 확인 시간(초)
  error?: string;            // 에러 메시지
}
```

#### 2.1.3 P2P 거래 시스템

**기능 개요**
- 스마트 컨트랙트 기반 에스크로 거래
- 다양한 상품 유형 지원 (토큰, NFT, 쿠폰, 기타)
- 실시간 거래 상태 추적

**상세 요구사항**

| 요구사항 ID | 기능명 | 상세 설명 | 우선순위 |
|------------|--------|-----------|----------|
| P2P-001 | 주문 등록 | 판매/구매 주문 생성 및 스마트 컨트랙트 배포 | P1 |
| P2P-002 | 주문 매칭 | 자동 주문 매칭 및 에스크로 실행 | P1 |
| P2P-003 | 거래 완료 | 상품 전달 확인 및 자금 해제 | P1 |
| P2P-004 | 분쟁 해결 | 거래 분쟁 신고 및 중재 시스템 | P2 |

**비즈니스 규칙**

1. **에스크로 규칙**
   - 구매자 자금은 거래 시작 시 스마트 컨트랙트에 예치
   - 판매자 확인 후 72시간 내 자동 해제
   - 분쟁 발생 시 관리자 중재 필요

2. **수수료 구조**
   - 거래 성공 시 거래 금액의 2.5% 수수료
   - 취소 시 가스비만 차감
   - VIP 사용자 수수료 50% 할인

#### 2.1.4 채굴 센터

**기능 개요**
- 8개 알트코인 채굴 지원 (LTC, DOGE, BELLS, PEP, JKC, LKY, DINGO, SHIC)
- 실시간 해시레이트 모니터링
- 자동 수익 분배

**상세 요구사항**

| 요구사항 ID | 기능명 | 상세 설명 | 우선순위 |
|------------|--------|-----------|----------|
| MINING-001 | 채굴 시작 | 코인 선택 및 채굴 시작 | P1 |
| MINING-002 | 수익 조회 | 일별/주별 채굴 수익 통계 | P1 |
| MINING-003 | 출금 요청 | 채굴 수익 외부 지갑 출금 | P1 |
| MINING-004 | 해시레이트 모니터링 | 실시간 채굴 성능 추적 | P2 |

**성능 요구사항**
- 해시레이트 데이터 1분마다 업데이트
- 수익 계산 정확도 99.9% 이상
- 출금 처리 시간 24시간 이내

### 2.2 사용자 시나리오

#### 시나리오 1: 신규 사용자 온보딩

**사용자 여정 맵핑**

1. **진입점**: 웹사이트 방문 또는 추천 링크
2. **인증**: 소셜 로그인 선택 및 완료
3. **둘러보기**: 홈 대시보드 기능 소개
4. **첫 거래**: 소액 토큰 받기 또는 기프트카드 구매
5. **정착**: 정기적인 앱 사용 및 기능 탐색

**상세 단계**
```
1. 랜딩 페이지 접근
   → 2. "시작하기" 버튼 클릭
   → 3. 소셜 로그인 선택 (Google/Kakao/Apple)
   → 4. OAuth 인증 완료
   → 5. 홈 대시보드 진입
   → 6. 튜토리얼 팝업 표시
   → 7. 기본 기능 체험 (QR 코드 생성 등)
   → 8. 첫 거래 완료
```

#### 시나리오 2: P2P 거래 실행

**판매자 관점**
```
1. P2P 페이지 접근
   → 2. "판매하기" 탭 선택
   → 3. 상품 정보 입력 (토큰/NFT/쿠폰)
   → 4. 가격 및 수량 설정
   → 5. 스마트 컨트랙트 배포
   → 6. 주문 활성화
   → 7. 구매자 매칭 대기
   → 8. 거래 완료 확인
```

**구매자 관점**
```
1. P2P 페이지 접근
   → 2. "구매하기" 탭 선택
   → 3. 원하는 상품 검색/필터링
   → 4. 주문 상세 정보 확인
   → 5. 구매 버튼 클릭
   → 6. 에스크로 자금 예치
   → 7. 판매자 상품 전달 대기
   → 8. 수령 확인 및 거래 완료
```

#### 시나리오 3: 채굴 수익 관리

```
1. 채굴 센터 접근
   → 2. 채굴 가능한 코인 목록 확인
   → 3. 수익성 높은 코인 선택
   → 4. 채굴 시작 (자동)
   → 5. 일일 수익 확인
   → 6. 누적 수익 임계값 도달
   → 7. 외부 지갑 출금 요청
   → 8. 출금 완료 확인
```

### 2.3 에지 케이스 및 에러 처리

#### 2.3.1 네트워크 연결 오류

**시나리오**: 사용자가 거래 중 인터넷 연결이 끊어진 경우
**처리 방안**:
- 로컬 스토리지에 거래 상태 임시 저장
- 연결 복구 시 자동 재시도 (최대 3회)
- 실패 시 사용자에게 수동 재시도 옵션 제공

#### 2.3.2 스마트 컨트랙트 실행 실패

**시나리오**: P2P 거래 중 컨트랙트 실행이 실패한 경우
**처리 방안**:
- 가스비 부족: 권장 가스비 안내 및 재시도 옵션
- 컨트랙트 오류: 기술 지원팀 자동 알림 및 사용자 안내
- 자금 환불: 24시간 내 자동 환불 처리

#### 2.3.3 대용량 트래픽 처리

**시나리오**: 동시 접속자 급증으로 서버 부하 발생
**처리 방안**:
- CDN을 통한 정적 자원 분산
- 데이터베이스 읽기 전용 복제본 활용
- 우선순위 기반 요청 처리 (인증 > 거래 > 조회)

---

## 3. 기술 사양

### 3.1 시스템 아키텍처

#### 3.1.1 전체 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        B[TypeScript]
        C[Zustand Store]
        D[React Query]
    end
    
    subgraph "API Gateway"
        E[Express.js Server]
        F[Authentication Middleware]
        G[Rate Limiting]
    end
    
    subgraph "Business Logic"
        H[User Service]
        I[Wallet Service]
        J[P2P Service]
        K[Mining Service]
    end
    
    subgraph "Data Layer"
        L[(SQLite Database)]
        M[Redis Cache]
    end
    
    subgraph "External Services"
        N[OAuth Providers]
        O[Blockchain Networks]
        P[Price APIs]
        Q[Turnstile Security]
    end
    
    A --> E
    E --> H
    E --> I
    E --> J
    E --> K
    H --> L
    I --> L
    J --> L
    K --> L
    H --> M
    I --> M
    H --> N
    I --> O
    J --> O
    K --> P
    F --> Q
```

#### 3.1.2 컴포넌트 아키텍처

**프론트엔드 구조**
```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── common/          # 공통 컴포넌트
│   ├── forms/           # 폼 관련 컴포넌트
│   └── modals/          # 모달 컴포넌트
├── pages/               # 페이지 컴포넌트
├── stores/              # Zustand 상태 관리
├── hooks/               # 커스텀 훅
├── utils/               # 유틸리티 함수
├── types/               # TypeScript 타입 정의
└── lib/                 # 외부 라이브러리 설정
```

**백엔드 구조**
```
api/
├── routes/              # API 라우트 정의
├── middleware/          # 미들웨어 함수
├── services/            # 비즈니스 로직
├── models/              # 데이터 모델
├── utils/               # 유틸리티 함수
└── config/              # 설정 파일
```

### 3.2 데이터베이스 구조

#### 3.2.1 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    USERS ||--o{ P2P_ORDERS : creates
    USERS ||--o{ MINING_SESSIONS : starts
    USERS ||--o{ GIFT_CARDS : purchases
    
    WALLETS ||--o{ TRANSACTIONS : contains
    P2P_ORDERS ||--o{ P2P_TRANSACTIONS : generates
    MINING_SESSIONS ||--o{ MINING_REWARDS : earns
    
    USERS {
        string id PK
        string email UK
        string name
        string avatar_url
        json settings
        datetime created_at
        datetime updated_at
    }
    
    WALLETS {
        string id PK
        string user_id FK
        string token_symbol
        decimal balance
        string address
        datetime created_at
        datetime updated_at
    }
    
    TRANSACTIONS {
        string id PK
        string wallet_id FK
        string type
        decimal amount
        string to_address
        string from_address
        string tx_hash
        string status
        datetime created_at
    }
    
    P2P_ORDERS {
        string id PK
        string user_id FK
        string product_type
        string token_symbol
        decimal amount
        decimal price
        string status
        string smart_contract_address
        json metadata
        datetime created_at
        datetime updated_at
    }
    
    P2P_TRANSACTIONS {
        string id PK
        string order_id FK
        string buyer_id FK
        string seller_id FK
        decimal amount
        string status
        string escrow_tx_hash
        string release_tx_hash
        datetime created_at
        datetime completed_at
    }
    
    MINING_SESSIONS {
        string id PK
        string user_id FK
        string coin_symbol
        decimal hash_rate
        string status
        datetime started_at
        datetime ended_at
    }
    
    MINING_REWARDS {
        string id PK
        string session_id FK
        decimal amount
        decimal usd_value
        datetime earned_at
    }
    
    GIFT_CARDS {
        string id PK
        string user_id FK
        string card_type
        decimal face_value
        decimal current_balance
        string qr_code
        string status
        datetime purchased_at
        datetime expires_at
    }
```

#### 3.2.2 데이터 정의 언어 (DDL)

**사용자 테이블**
```sql
-- 사용자 기본 정보
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'kakao', 'apple')),
    provider_id TEXT NOT NULL,
    settings JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE UNIQUE INDEX idx_users_provider_unique ON users(provider, provider_id);
```

**지갑 테이블**
```sql
-- 사용자 지갑 정보
CREATE TABLE wallets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_symbol TEXT NOT NULL CHECK (token_symbol IN ('ICC', 'ICS', 'ICF', 'ICG', 'USDT', 'BNB', 'BTC', 'ETH')),
    balance DECIMAL(20, 8) DEFAULT 0.0,
    address TEXT,
    private_key_encrypted TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 및 제약조건
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_token ON wallets(token_symbol);
CREATE UNIQUE INDEX idx_wallets_user_token ON wallets(user_id, token_symbol);
```

**거래 내역 테이블**
```sql
-- 지갑 거래 내역
CREATE TABLE transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'mining', 'staking', 'p2p')),
    amount DECIMAL(20, 8) NOT NULL,
    to_address TEXT,
    from_address TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    gas_fee DECIMAL(20, 8) DEFAULT 0.0,
    memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME
);

-- 인덱스 생성
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

**P2P 주문 테이블**
```sql
-- P2P 거래 주문
CREATE TABLE p2p_orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('token', 'nft', 'coupon', 'other')),
    token_symbol TEXT,
    amount DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    total_value DECIMAL(20, 8) NOT NULL,
    trade_method TEXT DEFAULT 'escrow' CHECK (trade_method IN ('escrow', 'direct')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    smart_contract_address TEXT,
    smart_contract_status TEXT DEFAULT 'pending' CHECK (smart_contract_status IN ('pending', 'listed', 'completed', 'failed')),
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- 인덱스 생성
CREATE INDEX idx_p2p_orders_user_id ON p2p_orders(user_id);
CREATE INDEX idx_p2p_orders_product_type ON p2p_orders(product_type);
CREATE INDEX idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX idx_p2p_orders_created_at ON p2p_orders(created_at DESC);
```

**채굴 세션 테이블**
```sql
-- 채굴 세션 정보
CREATE TABLE mining_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coin_symbol TEXT NOT NULL CHECK (coin_symbol IN ('LTC', 'DOGE', 'BELLS', 'PEP', 'JKC', 'LKY', 'DINGO', 'SHIC')),
    hash_rate DECIMAL(15, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
    pool_address TEXT,
    worker_name TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME
);

-- 채굴 보상 테이블
CREATE TABLE mining_rewards (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_id TEXT NOT NULL REFERENCES mining_sessions(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    usd_value DECIMAL(10, 2) NOT NULL,
    hash_rate DECIMAL(15, 2) NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_coin ON mining_sessions(coin_symbol);
CREATE INDEX idx_mining_rewards_session_id ON mining_rewards(session_id);
CREATE INDEX idx_mining_rewards_earned_at ON mining_rewards(earned_at DESC);
```

**기프트카드 테이블**
```sql
-- 기프트카드 정보
CREATE TABLE gift_cards (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_type TEXT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    current_balance DECIMAL(10, 2) NOT NULL,
    qr_code TEXT,
    barcode TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    metadata JSON DEFAULT '{}'
);

-- 인덱스 생성
CREATE INDEX idx_gift_cards_user_id ON gift_cards(user_id);
CREATE INDEX idx_gift_cards_type ON gift_cards(card_type);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);
```

**초기 데이터 삽입**
```sql
-- 테스트 사용자 생성
INSERT INTO users (id, email, name, provider, provider_id) VALUES
('test-user-001', 'test@example.com', 'Test User', 'google', 'google-123'),
('test-user-002', 'demo@example.com', 'Demo User', 'kakao', 'kakao-456');

-- 기본 지갑 생성
INSERT INTO wallets (user_id, token_symbol, balance) VALUES
('test-user-001', 'ICC', 1000.0),
('test-user-001', 'USDT', 500.0),
('test-user-002', 'ICG', 750.0),
('test-user-002', 'BNB', 2.5);

-- 샘플 거래 내역
INSERT INTO transactions (wallet_id, type, amount, status) VALUES
((SELECT id FROM wallets WHERE user_id = 'test-user-001' AND token_symbol = 'ICC'), 'receive', 100.0, 'confirmed'),
((SELECT id FROM wallets WHERE user_id = 'test-user-001' AND token_symbol = 'USDT'), 'send', 50.0, 'confirmed');
```

### 3.3 API 명세

#### 3.3.1 인증 API

**사용자 로그인**
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "provider": "google" | "kakao" | "apple",
  "authCode": "string",
  "turnstileToken": "string"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "avatar": "string",
      "settings": {}
    },
    "token": "string",
    "refreshToken": "string"
  }
}

Response (400):
{
  "success": false,
  "error": "Invalid authentication code",
  "code": "AUTH_INVALID_CODE"
}
```

**토큰 갱신**
```
POST /api/auth/refresh
Authorization: Bearer {refreshToken}

Response (200):
{
  "success": true,
  "data": {
    "token": "string",
    "refreshToken": "string"
  }
}
```

#### 3.3.2 지갑 API

**지갑 잔고 조회**
```
GET /api/wallet/balance
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "totalBalance": 15420.75,
    "totalBalanceUsdt": 15420.75,
    "tokens": [
      {
        "symbol": "ICC",
        "balance": 1250.5,
        "usdtValue": 625.25,
        "change24h": 2.5
      }
    ]
  }
}
```

**토큰 전송**
```
POST /api/wallet/send
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "toAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": 100.5,
  "tokenSymbol": "ICC",
  "memo": "Payment for services"
}

Response (200):
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "estimatedConfirmTime": 300,
    "gasUsed": "21000",
    "gasFee": 0.001
  }
}

Response (400):
{
  "success": false,
  "error": "Insufficient balance",
  "code": "WALLET_INSUFFICIENT_BALANCE"
}
```

#### 3.3.3 P2P 거래 API

**주문 목록 조회**
```
GET /api/p2p/orders?type=sell&productType=token&page=1&limit=20
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-001",
        "userId": "user-001",
        "productType": "token",
        "tokenSymbol": "ICC",
        "amount": 1000,
        "price": 0.5,
        "totalValue": 500,
        "status": "active",
        "smartContractAddress": "0x...",
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**주문 생성**
```
POST /api/p2p/orders
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "productType": "token",
  "tokenSymbol": "ICC",
  "amount": 1000,
  "price": 0.5,
  "tradeMethod": "escrow",
  "expiresIn": 86400
}

Response (201):
{
  "success": true,
  "data": {
    "orderId": "order-002",
    "smartContractAddress": "0x...",
    "status": "pending"
  }
}
```

#### 3.3.4 채굴 API

**채굴 상태 조회**
```
GET /api/mining/status
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "activeSessions": [
      {
        "id": "session-001",
        "coinSymbol": "LTC",
        "hashRate": 234.1,
        "status": "active",
        "startedAt": "2024-12-01T00:00:00Z"
      }
    ],
    "totalEarnings": {
      "today": 0.001234,
      "week": 0.008765,
      "month": 0.034567
    }
  }
}
```

**채굴 시작**
```
POST /api/mining/start
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "coinSymbol": "LTC",
  "poolAddress": "stratum+tcp://pool.example.com:4444",
  "workerName": "worker001"
}

Response (200):
{
  "success": true,
  "data": {
    "sessionId": "session-002",
    "status": "starting"
  }
}
```

### 3.4 보안 아키텍처

#### 3.4.1 인증 및 권한 관리

**JWT 토큰 구조**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "user",
    "iat": 1701234567,
    "exp": 1701238167
  }
}
```

**권한 레벨**
- **Guest**: 공개 정보 조회만 가능
- **User**: 기본 지갑 및 거래 기능 사용
- **VIP**: 고급 기능 및 수수료 할인
- **Admin**: 시스템 관리 및 분쟁 해결

#### 3.4.2 데이터 암호화

**민감 정보 암호화**
- 개인키: AES-256-GCM 암호화
- 사용자 정보: bcrypt 해싱 (salt rounds: 12)
- API 통신: TLS 1.3 강제 적용

**암호화 키 관리**
```typescript
interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyDerivation: 'pbkdf2';
  iterations: 100000;
  saltLength: 32;
  ivLength: 16;
}
```

#### 3.4.3 스마트 컨트랙트 보안

**에스크로 컨트랙트 구조**
```solidity
pragma solidity ^0.8.19;

contract P2PEscrow {
    struct Order {
        address seller;
        address buyer;
        uint256 amount;
        address token;
        uint256 deadline;
        bool completed;
        bool disputed;
    }
    
    mapping(bytes32 => Order) public orders;
    address public admin;
    uint256 public feeRate = 250; // 2.5%
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    function createOrder(
        bytes32 orderId,
        address seller,
        address token,
        uint256 amount,
        uint256 deadline
    ) external payable {
        require(orders[orderId].seller == address(0), "Order exists");
        require(msg.value == amount, "Incorrect amount");
        
        orders[orderId] = Order({
            seller: seller,
            buyer: msg.sender,
            amount: amount,
            token: token,
            deadline: deadline,
            completed: false,
            disputed: false
        });
    }
    
    function completeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Only buyer");
        require(!order.completed, "Already completed");
        require(block.timestamp <= order.deadline, "Expired");
        
        uint256 fee = (order.amount * feeRate) / 10000;
        uint256 sellerAmount = order.amount - fee;
        
        payable(order.seller).transfer(sellerAmount);
        payable(admin).transfer(fee);
        
        order.completed = true;
    }
}
```

### 3.5 성능 및 확장성 요구사항

#### 3.5.1 성능 지표

| 메트릭 | 목표 값 | 측정 방법 |
|--------|---------|-----------|
| 페이지 로드 시간 | < 2초 | Lighthouse 측정 |
| API 응답 시간 | < 500ms | 평균 응답 시간 |
| 동시 접속자 | 10,000명 | 부하 테스트 |
| 데이터베이스 쿼리 | < 100ms | 쿼리 실행 계획 분석 |
| 트랜잭션 처리량 | 1,000 TPS | 블록체인 네트워크 성능 |

#### 3.5.2 확장성 전략

**수평 확장**
- 로드 밸런서를 통한 서버 인스턴스 분산
- 데이터베이스 읽기 전용 복제본 구성
- CDN을 통한 정적 자원 분산

**수직 확장**
- 메모리 및 CPU 리소스 증설
- SSD 스토리지 사용
- 데이터베이스 인덱스 최적화

**캐싱 전략**
```typescript
interface CacheStrategy {
  userSessions: {
    ttl: 3600; // 1시간
    storage: 'redis';
  };
  assetPrices: {
    ttl: 60; // 1분
    storage: 'memory';
  };
  walletBalances: {
    ttl: 300; // 5분
    storage: 'redis';
  };
}
```

---

## 4. 테스트 계획

### 4.1 테스트 전략

#### 4.1.1 테스트 피라미드

```
        /\
       /  \
      / E2E \     (10% - 브라우저 자동화 테스트)
     /______\
    /        \
   /Integration\ (20% - API 및 컴포넌트 통합)
  /____________\
 /              \
/   Unit Tests   \  (70% - 개별 함수 및 컴포넌트)
/________________\
```

#### 4.1.2 테스트 범위

**단위 테스트 (Unit Tests)**
- 유틸리티 함수 테스트
- React 컴포넌트 렌더링 테스트
- Zustand 스토어 액션 테스트
- API 서비스 함수 테스트

**통합 테스트 (Integration Tests)**
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 스마트 컨트랙트 상호작용 테스트

**E2E 테스트 (End-to-End Tests)**
- 사용자 시나리오 기반 테스트
- 크로스 브라우저 호환성 테스트
- 모바일 반응형 테스트

### 4.2 상세 테스트 케이스

#### 4.2.1 인증 시스템 테스트

**TC-AUTH-001: 소셜 로그인 성공**
```typescript
describe('Social Login', () => {
  test('should login successfully with Google OAuth', async () => {
    // Given
    const mockAuthCode = 'mock-google-auth-code';
    const mockUser = {
      id: 'user-001',
      email: 'test@gmail.com',
      name: 'Test User'
    };
    
    // When
    const response = await authService.socialLogin('google', mockAuthCode);
    
    // Then
    expect(response.success).toBe(true);
    expect(response.data.user.email).toBe(mockUser.email);
    expect(response.data.token).toBeDefined();
  });
});
```

**TC-AUTH-002: 토큰 만료 처리**
```typescript
test('should redirect to login when token expires', async () => {
  // Given
  const expiredToken = 'expired-jwt-token';
  localStorage.setItem('ic-wallet-token', expiredToken);
  
  // When
  const response = await apiCall('/api/wallet/balance');
  
  // Then
  expect(response.status).toBe(401);
  expect(window.location.pathname).toBe('/login');
});
```

#### 4.2.2 지갑 기능 테스트

**TC-WALLET-001: 잔고 조회**
```typescript
test('should fetch wallet balance correctly', async () => {
  // Given
  const userId = 'test-user-001';
  const expectedBalance = {
    ICC: 1000.0,
    USDT: 500.0
  };
  
  // When
  const balance = await walletService.getBalance(userId);
  
  // Then
  expect(balance.tokens).toHaveLength(2);
  expect(balance.tokens[0].symbol).toBe('ICC');
  expect(balance.tokens[0].balance).toBe(1000.0);
});
```

**TC-WALLET-002: 토큰 전송**
```typescript
test('should send tokens successfully', async () => {
  // Given
  const sendRequest = {
    toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    amount: 100,
    tokenSymbol: 'ICC'
  };
  
  // When
  const result = await walletService.sendToken(sendRequest);
  
  // Then
  expect(result.success).toBe(true);
  expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
});
```

**TC-WALLET-003: 잔고 부족 에러**
```typescript
test('should throw error when insufficient balance', async () => {
  // Given
  const sendRequest = {
    toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    amount: 10000, // 잔고보다 큰 금액
    tokenSymbol: 'ICC'
  };
  
  // When & Then
  await expect(walletService.sendToken(sendRequest))
    .rejects.toThrow('Insufficient balance');
});
```

#### 4.2.3 P2P 거래 테스트

**TC-P2P-001: 주문 생성**
```typescript
test('should create P2P order successfully', async () => {
  // Given
  const orderData = {
    productType: 'token',
    tokenSymbol: 'ICC',
    amount: 1000,
    price: 0.5
  };
  
  // When
  const order = await p2pService.createOrder(orderData);
  
  // Then
  expect(order.id).toBeDefined();
  expect(order.status).toBe('active');
  expect(order.smartContractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
});
```

**TC-P2P-002: 에스크로 거래 완료**
```typescript
test('should complete escrow transaction', async () => {
  // Given
  const orderId = 'test-order-001';
  const buyerId = 'buyer-001';
  const sellerId = 'seller-001';
  
  // When
  const result = await p2pService.completeTransaction(orderId, buyerId);
  
  // Then
  expect(result.success).toBe(true);
  expect(result.status).toBe('completed');
  
  // 판매자 잔고 증가 확인
  const sellerBalance = await walletService.getBalance(sellerId);
  expect(sellerBalance.totalBalance).toBeGreaterThan(0);
});
```

#### 4.2.4 채굴 시스템 테스트

**TC-MINING-001: 채굴 시작**
```typescript
test('should start mining session', async () => {
  // Given
  const miningConfig = {
    coinSymbol: 'LTC',
    poolAddress: 'stratum+tcp://pool.example.com:4444'
  };
  
  // When
  const session = await miningService.startMining(miningConfig);
  
  // Then
  expect(session.id).toBeDefined();
  expect(session.status).toBe('active');
  expect(session.coinSymbol).toBe('LTC');
});
```

**TC-MINING-002: 수익 계산**
```typescript
test('should calculate mining rewards correctly', async () => {
  // Given
  const sessionId = 'mining-session-001';
  const hashRate = 234.1;
  const duration = 3600; // 1시간
  
  // When
  const rewards = await miningService.calculateRewards(sessionId, duration);
  
  // Then
  expect(rewards.amount).toBeGreaterThan(0);
  expect(rewards.usdValue).toBeGreaterThan(0);
  expect(rewards.hashRate).toBe(hashRate);
});
```

### 4.3 성능 테스트

#### 4.3.1 부하 테스트 시나리오

**시나리오 1: 동시 로그인 부하**
```javascript
// K6 부하 테스트 스크립트
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // 2분간 100명까지 증가
    { duration: '5m', target: 100 },   // 5분간 100명 유지
    { duration: '2m', target: 200 },   // 2분간 200명까지 증가
    { duration: '5m', target: 200 },   // 5분간 200명 유지
    { duration: '2m', target: 0 },     // 2분간 0명까지 감소
  ],
};

export default function() {
  const response = http.post('http://localhost:3004/api/auth/login', {
    provider: 'google',
    authCode: 'mock-auth-code',
    turnstileToken: 'mock-turnstile-token'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**시나리오 2: 지갑 조회 부하**
```javascript
export default function() {
  const token = 'valid-jwt-token';
  const response = http.get('http://localhost:3004/api/wallet/balance', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has balance data': (r) => JSON.parse(r.body).data.totalBalance !== undefined,
  });
}
```

#### 4.3.2 성능 벤치마크

**데이터베이스 쿼리 성능**
```sql
-- 사용자별 지갑 잔고 조회 (목표: < 50ms)
EXPLAIN QUERY PLAN
SELECT w.token_symbol, w.balance, w.address
FROM wallets w
WHERE w.user_id = 'test-user-001';

-- P2P 주문 목록 조회 (목표: < 100ms)
EXPLAIN QUERY PLAN
SELECT o.*, u.name as seller_name
FROM p2p_orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'active'
ORDER BY o.created_at DESC
LIMIT 20;
```

**메모리 사용량 모니터링**
```typescript
// 메모리 사용량 추적
const memoryUsage = process.memoryUsage();
console.log({
  rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
});
```

### 4.4 보안 테스트

#### 4.4.1 침투 테스트 시나리오

**SQL 인젝션 테스트**
```typescript
test('should prevent SQL injection attacks', async () => {
  // Given
  const maliciousInput = "'; DROP TABLE users; --";
  
  // When
  const response = await http.get(`/api/users/search?name=${maliciousInput}`);
  
  // Then
  expect(response.status).toBe(400);
  expect(response.body).not.toContain('syntax error');
});
```

**XSS 공격 방어 테스트**
```typescript
test('should sanitize user input to prevent XSS', async () => {
  // Given
  const xssPayload = '<script>alert("XSS")</script>';
  
  // When
  const response = await userService.updateProfile({
    name: xssPayload
  });
  
  // Then
  expect(response.data.name).not.toContain('<script>');
  expect(response.data.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
});
```

**JWT 토큰 보안 테스트**
```typescript
test('should reject tampered JWT tokens', async () => {
  // Given
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const tamperedToken = validToken.slice(0, -10) + 'tampered123';
  
  // When
  const response = await http.get('/api/wallet/balance', {
    headers: { Authorization: `Bearer ${tamperedToken}` }
  });
  
  // Then
  expect(response.status).toBe(401);
  expect(response.body.error).toBe('Invalid token');
});
```

#### 4.4.2 스마트 컨트랙트 보안 감사

**재진입 공격 방어 테스트**
```solidity
// 테스트용 악성 컨트랙트
contract MaliciousContract {
    P2PEscrow public escrow;
    
    function attack(bytes32 orderId) external payable {
        escrow.completeOrder(orderId);
    }
    
    // 재진입 시도
    receive() external payable {
        if (address(escrow).balance > 0) {
            escrow.completeOrder(bytes32(0));
        }
    }
}
```

### 4.5 사용자 수용 테스트 (UAT)

#### 4.5.1 테스트 시나리오

**시나리오 1: 신규 사용자 온보딩**
1. 웹사이트 접속 및 첫 인상 평가
2. 소셜 로그인 과정의 직관성
3. 대시보드 정보의 이해도
4. 첫 거래 완료까지의 소요 시간

**시나리오 2: 고급 사용자 기능 테스트**
1. P2P 거래 주문 생성 및 관리
2. 채굴 설정 및 수익 확인
3. 복잡한 거래 시나리오 처리
4. 에러 상황 대응 능력

#### 4.5.2 수용 기준

| 테스트 항목 | 수용 기준 | 측정 방법 |
|------------|-----------|-----------|
| 사용성 | 80% 이상 사용자가 도움 없이 주요 기능 완료 | 사용자 테스트 |
| 만족도 | 평균 4.0/5.0 이상 | 설문 조사 |
| 완료율 | 90% 이상 사용자가 온보딩 완료 | 분석 도구 |
| 에러율 | 5% 미만의 사용자 에러 발생 | 로그 분석 |

---

## 5. 배포 계획

### 5.1 릴리스 일정

#### 5.1.1 마일스톤 기반 일정

**Phase 1: 핵심 기능 (4주)**
- Week 1-2: 사용자 인증 및 지갑 기본 기능
- Week 3-4: 홈 대시보드 및 기본 UI/UX

**Phase 2: 고급 기능 (6주)**
- Week 5-7: P2P 거래 시스템 개발
- Week 8-10: 채굴 센터 및 수익 관리

**Phase 3: 최적화 및 출시 (4주)**
- Week 11-12: 성능 최적화 및 보안 강화
- Week 13-14: 최종 테스트 및 배포 준비

#### 5.1.2 상세 일정표

| 주차 | 주요 작업 | 산출물 | 담당자 |
|------|-----------|--------|--------|
| 1 | OAuth 인증 시스템 구현 | 로그인/회원가입 기능 | Backend 팀 |
| 2 | 지갑 기본 기능 개발 | 잔고 조회, 송금, 수신 | Blockchain 팀 |
| 3 | 홈 대시보드 UI 구현 | 반응형 대시보드 | Frontend 팀 |
| 4 | 기본 기능 통합 테스트 | 테스트 보고서 | QA 팀 |
| 5-6 | P2P 주문 시스템 개발 | 주문 생성/조회 API | Backend 팀 |
| 7 | 스마트 컨트랙트 개발 | 에스크로 컨트랙트 | Blockchain 팀 |
| 8-9 | 채굴 시스템 구현 | 채굴 모니터링 대시보드 | Full-stack 팀 |
| 10 | P2P 및 채굴 UI 완성 | 완전한 사용자 인터페이스 | Frontend 팀 |
| 11 | 성능 최적화 | 로딩 시간 50% 단축 | DevOps 팀 |
| 12 | 보안 감사 및 강화 | 보안 감사 보고서 | Security 팀 |
| 13 | 통합 테스트 및 UAT | 사용자 수용 테스트 완료 | QA 팀 |
| 14 | 프로덕션 배포 | 라이브 서비스 시작 | DevOps 팀 |

### 5.2 롤아웃 전략

#### 5.2.1 단계별 배포 전략

**1단계: 내부 테스트 (Alpha)**
- 대상: 개발팀 및 내부 직원 (10명)
- 기간: 1주
- 목적: 기본 기능 검증 및 치명적 버그 발견

**2단계: 제한적 베타 (Closed Beta)**
- 대상: 선별된 외부 사용자 (100명)
- 기간: 2주
- 목적: 실제 사용 환경에서의 안정성 검증

**3단계: 공개 베타 (Open Beta)**
- 대상: 일반 사용자 (1,000명)
- 기간: 2주
- 목적: 대용량 트래픽 처리 및 사용성 개선

**4단계: 정식 출시 (Production)**
- 대상: 전체 사용자
- 기간: 지속적 운영
- 목적: 안정적인 서비스 제공 및 지속적 개선

#### 5.2.2 Blue-Green 배포 전략

**Blue-Green 환경 구성**
```yaml
# docker-compose.blue-green.yml
version: '3.8'
services:
  app-blue:
    image: ic-wallet:blue
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db-blue
  
  app-green:
    image: ic-wallet:green
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db-green
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**배포 프로세스**
1. Green 환경에 새 버전 배포
2. Green 환경 헬스 체크 수행
3. 트래픽 일부를 Green으로 라우팅 (Canary 배포)
4. 모니터링 및 검증 (30분)
5. 전체 트래픽을 Green으로 전환
6. Blue 환경을 새 버전으로 업데이트

#### 5.2.3 Canary 배포 설정

**트래픽 분산 설정**
```nginx
# nginx.conf
upstream backend {
    server app-blue:3000 weight=90;
    server app-green:3000 weight=10;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**단계별 트래픽 증가**
- 1단계: 5% 트래픽 → Green 환경
- 2단계: 25% 트래픽 → Green 환경
- 3단계: 50% 트래픽 → Green 환경
- 4단계: 100% 트래픽 → Green 환경

### 5.3 환경 설정 및 구성 관리

#### 5.3.1 환경별 설정

**개발 환경 (Development)**
```typescript
// config/development.ts
export const config = {
  api: {
    baseUrl: 'http://localhost:3004',
    timeout: 10000
  },
  database: {
    url: 'sqlite:./dev.db',
    logging: true
  },
  blockchain: {
    network: 'testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID_DEV,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_DEV
    }
  }
};
```

**스테이징 환경 (Staging)**
```typescript
// config/staging.ts
export const config = {
  api: {
    baseUrl: 'https://staging-api.icwallet.com',
    timeout: 5000
  },
  database: {
    url: process.env.DATABASE_URL_STAGING,
    logging: false
  },
  blockchain: {
    network: 'testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID_STAGING,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_STAGING
    }
  }
};
```

**프로덕션 환경 (Production)**
```typescript
// config/production.ts
export const config = {
  api: {
    baseUrl: 'https://api.icwallet.com',
    timeout: 3000
  },
  database: {
    url: process.env.DATABASE_URL_PROD,
    logging: false,
    ssl: true
  },
  blockchain: {
    network: 'mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org'
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID_PROD,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD
    }
  }
};
```

#### 5.3.2 시크릿 관리

**환경 변수 구조**
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/icwallet
REDIS_URL=redis://redis:6379
JWT_SECRET=super-secret-jwt-key
ENCRYPTION_KEY=32-byte-encryption-key

# OAuth Credentials
GOOGLE_CLIENT_ID=google-oauth-client-id
GOOGLE_CLIENT_SECRET=google-oauth-client-secret
KAKAO_CLIENT_ID=kakao-oauth-client-id
KAKAO_CLIENT_SECRET=kakao-oauth-client-secret

# Blockchain
BSC_RPC_URL=https://bsc-dataseed1.binance.org
PRIVATE_KEY_ENCRYPTED=encrypted-private-key
CONTRACT_ADDRESS=0x...

# External Services
TURNSTILE_SECRET_KEY=turnstile-secret-key
PRICE_API_KEY=coinmarketcap-api-key
```

### 5.4 모니터링 및 알림 설정

#### 5.4.1 애플리케이션 모니터링

**메트릭 수집 설정**
```typescript
// monitoring/metrics.ts
import { createPrometheusMetrics } from 'prom-client';

export const metrics = {
  httpRequests: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  }),
  
  responseTime: new Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route']
  }),
  
  activeUsers: new Gauge({
    name: 'active_users_total',
    help: 'Number of active users'
  }),
  
  walletBalance: new Gauge({
    name: 'wallet_balance_total',
    help: 'Total wallet balance in USDT',
    labelNames: ['token']
  })
};
```

**로그 설정**
```typescript
// logging/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### 5.4.2 알림 규칙

**Grafana 알림 설정**
```yaml
# alerts.yml
groups:
  - name: ic-wallet-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_response_time_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
      
      - alert: DatabaseConnectionFailure
        expr: up{job="database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "Database is not responding"
```

### 5.5 백업 및 복구 절차

#### 5.5.1 데이터 백업 전략

**자동 백업 스케줄**
```bash
#!/bin/bash
# backup.sh

# 데이터베이스 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 파일 시스템 백업
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz /app/uploads

# S3에 업로드
aws s3 cp backup_*.sql s3://ic-wallet-backups/database/
aws s3 cp files_backup_*.tar.gz s3://ic-wallet-backups/files/

# 로컬 백업 파일 정리 (7일 이상 된 파일 삭제)
find . -name "backup_*.sql" -mtime +7 -delete
find . -name "files_backup_*.tar.gz" -mtime +7 -delete
```

**백업 스케줄링**
```cron
# crontab -e
# 매일 새벽 2시 데이터베이스 백업
0 2 * * * /app/scripts/backup.sh

# 매주 일요일 새벽 3시 전체 시스템 백업
0 3 * * 0 /app/scripts/full_backup.sh

# 매시간 로그 파일 압축 및 아카이브
0 * * * * /app/scripts/archive_logs.sh
```

#### 5.5.2 재해 복구 계획

**RTO/RPO 목표**
- **RTO (Recovery Time Objective)**: 4시간
- **RPO (Recovery Point Objective)**: 1시간

**복구 절차**
```bash
#!/bin/bash
# disaster_recovery.sh

echo "Starting disaster recovery process..."

# 1. 최신 백업 파일 확인
LATEST_BACKUP=$(aws s3 ls s3://ic-wallet-backups/database/ | sort | tail -n 1 | awk '{print $4}')
echo "Latest backup: $LATEST_BACKUP"

# 2. 백업 파일 다운로드
aws s3 cp s3://ic-wallet-backups/database/$LATEST_BACKUP ./

# 3. 새 데이터베이스 인스턴스 생성
createdb ic_wallet_recovery

# 4. 백업 데이터 복원
psql ic_wallet_recovery < $LATEST_BACKUP

# 5. 애플리케이션 설정 업데이트
export DATABASE_URL="postgresql://user:pass@localhost:5432/ic_wallet_recovery"

# 6. 애플리케이션 재시작
docker-compose down
docker-compose up -d

# 7. 헬스 체크
curl -f http://localhost:3000/api/health || exit 1

echo "Disaster recovery completed successfully"
```

#### 5.5.3 데이터 무결성 검증

**백업 검증 스크립트**
```typescript
// scripts/verify-backup.ts
import { Database } from '../src/lib/database';

async function verifyBackup() {
  const db = new Database();
  
  // 테이블 존재 확인
  const tables = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  const expectedTables = ['users', 'wallets', 'transactions', 'p2p_orders'];
  const missingTables = expectedTables.filter(
    table => !tables.some(t => t.table_name === table)
  );
  
  if (missingTables.length > 0) {
    throw new Error(`Missing tables: ${missingTables.join(', ')}`);
  }
  
  // 데이터 일관성 확인
  const userCount = await db.query('SELECT COUNT(*) FROM users');
  const walletCount = await db.query('SELECT COUNT(*) FROM wallets');
  
  console.log(`Backup verification completed:
    - Users: ${userCount[0].count}
    - Wallets: ${walletCount[0].count}
    - All required tables present
  `);
}

verifyBackup().catch(console.error);
```

### 5.6 배포 후 검증 체크리스트

#### 5.6.1 기능 검증

**자동화된 스모크 테스트**
```typescript
// tests/smoke-tests.ts
describe('Production Smoke Tests', () => {
  test('Health check endpoint responds', async () => {
    const response = await fetch('/api/health');
    expect(response.status).toBe(200);
  });
  
  test('Login page loads correctly', async () => {
    const response = await fetch('/login');
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('IC Wallet');
  });
  
  test('API authentication works', async () => {
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        authCode: 'test-code'
      })
    });
    expect(loginResponse.status).toBe(200);
  });
});
```

#### 5.6.2 성능 검증

**배포 후 성능 체크**
```bash
#!/bin/bash
# performance-check.sh

echo "Running post-deployment performance checks..."

# 페이지 로드 시간 측정
LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://icwallet.com)
echo "Homepage load time: ${LOAD_TIME}s"

if (( $(echo "$LOAD_TIME > 2.0" | bc -l) )); then
  echo "WARNING: Load time exceeds 2 seconds"
  exit 1
fi

# API 응답 시간 측정
API_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://api.icwallet.com/health)
echo "API response time: ${API_TIME}s"

if (( $(echo "$API_TIME > 0.5" | bc -l) )); then
  echo "WARNING: API response time exceeds 500ms"
  exit 1
fi

echo "Performance checks passed"
```

---

## 6. 부록 (Appendix)

### 6.1 용어 정의

| 용어 | 정의 |
|------|------|
| **IC Wallet** | 통합 디지털 자산 관리 플랫폼 |
| **P2P** | Peer-to-Peer, 개인간 직접 거래 |
| **에스크로** | 제3자가 자금을 보관하는 거래 방식 |
| **스마트 컨트랙트** | 블록체인에서 자동 실행되는 계약 |
| **해시레이트** | 채굴 시 초당 해시 계산 능력 |
| **가스비** | 블록체인 거래 수수료 |
| **NFT** | Non-Fungible Token, 대체 불가능한 토큰 |
| **DeFi** | Decentralized Finance, 탈중앙화 금융 |

### 6.2 참고 문서

- [React 18 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Zustand 상태 관리](https://github.com/pmndrs/zustand)
- [BSC 개발자 가이드](https://docs.binance.org/smart-chain/developer/create-wallet.html)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)

### 6.3 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2024-11-01 | 초기 문서 작성 | 개발팀 |
| 2.0 | 2024-11-15 | P2P 거래 시스템 추가 | 제품팀 |
| 3.0 | 2024-12-01 | 리팩토링 반영 및 상세 사양 추가 | 전체팀 |

---

**문서 승인**
- 제품 관리자: ✅ 승인
- 기술 리더: ✅ 승인  
- 보안 담당자: ✅ 승인
- QA 리더: ✅ 승인

**최종 검토일**: 2024년 12월
**다음 검토 예정일**: 2025년 3월 