좋아, **React / Next.js**에서 Cloudflare **Turnstile** 붙일 때 필요한 걸 핵심만 싹 모아 드릴게요.
(App Router 기준 예시 + Pages Router 대체안 + Invisible 모드 + 서버 검증 + 타입/보안 팁)

---

# 0) 준비물

* Cloudflare 대시보드에서 **Site Key**, **Secret Key** (테스트 키는 아래에서 별도 안내)
* Next.js 13+ (App Router) 또는 Pages Router
* 환경변수 설정:

  * `NEXT_PUBLIC_TURNSTILE_SITE_KEY=...`  ← 프론트에서 사용 (NEXT_PUBLIC 필수)
  * `TURNSTILE_SECRET_KEY=...`            ← 서버에서만 사용

---

# 1) App Router (권장) — 기본 위젯 방식

## (1) 클라이언트 컴포넌트

Turnstile 스크립트를 로드하고, 위젯을 렌더합니다.

```tsx
// app/components/TurnstileWidget.tsx
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!containerRef.current) return;
    // 이미 렌더된 경우 중복 방지
    if (containerRef.current.dataset.rendered) return;

    // @ts-ignore - turnstile 전역
    window.turnstile?.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        // 필요시 state/hidden input에 저장
        const input = document.querySelector<HTMLInputElement>("#cf-turnstile-response");
        if (input) input.value = token;
      },
    });

    containerRef.current.dataset.rendered = "true";
  }, [loaded, siteKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setLoaded(true)}
      />
      {/* Turnstile가 여기에 렌더됨 */}
      <div ref={containerRef} className="cf-turnstile" />
      {/* 폼 제출 시 서버로 보낼 토큰 보관용 */}
      <input type="hidden" id="cf-turnstile-response" name="cf-turnstile-response" />
    </>
  );
}
```

## (2) 폼 + 서버 액션(또는 route handler) 검증

### A. 서버 액션으로 바로 검증

```tsx
// app/(auth)/signup/page.tsx
import TurnstileWidget from "@/app/components/TurnstileWidget";

async function verifyTurnstile(token: string) {
  "use server";

  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
    // Edge에서도 동작 가능. (Node.js 런타임도 OK)
    cache: "no-store",
  }).then(r => r.json() as Promise<TurnstileVerifyResponse>);

  if (!res.success) {
    // 필요시 에러코드 로깅: res["error-codes"]
    throw new Error("Turnstile verification failed");
  }
}

type TurnstileVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

export default function Page() {
  async function action(formData: FormData) {
    "use server";
    const token = formData.get("cf-turnstile-response") as string | null;
    if (!token) throw new Error("Missing Turnstile token");

    await verifyTurnstile(token);

    // ✅ 여기서 회원가입/로그인 등 실제 처리
    // ...
  }

  return (
    <form action={action} className="space-y-3">
      <input name="email" required placeholder="email" className="border p-2" />
      <TurnstileWidget />
      <button type="submit" className="border px-4 py-2">Submit</button>
    </form>
  );
}
```

### B. `route.ts`(API 라우트)로 검증

```ts
// app/api/turnstile/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });

  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
    cache: "no-store",
  }).then(r => r.json());

  return NextResponse.json({ ok: !!resp.success, raw: resp }, { status: resp.success ? 200 : 403 });
}
```

---

# 2) Invisible 모드 (버튼 클릭 시 백그라운드 발급)

UI 없이 제출 시 자동 검증이 필요할 때:

```tsx
// app/components/TurnstileInvisible.tsx
"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function TurnstileInvisible({ action = "submit" }: { action?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    // 사전 렌더는 필요 없음 (execute 때 생성)
  }, [ready]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // @ts-ignore
    const token: string = await window.turnstile.execute(e.currentTarget, { sitekey: siteKey, action });
    (e.currentTarget.querySelector("#cf-turnstile-response") as HTMLInputElement).value = token;
    e.currentTarget.submit();
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setReady(true)}
      />
      <input type="hidden" id="cf-turnstile-response" name="cf-turnstile-response" />
      {/* form 바깥이 아니라 form 내부에서 onSubmit 핸들링 */}
      {/* 사용 예: <form onSubmit={handleSubmit}> ... */}
      <script dangerouslySetInnerHTML={{ __html: "" }} />
      {/* 핸들러를 외부로 노출 */}
      {/* Tip: 이 컴포넌트를 form 내부에서 렌더하고, form에 onSubmit={handleSubmit} 바인딩 */}
      {/* 또는 이 컴포넌트가 form 자체를 포함하도록 만들어도 됨 */}
      {/* 아래는 헬퍼 반환용 */}
      <button style={{ display: "none" }} onClick={() => {}} />
      {/* 반환을 위해 함수 export */}
      {/* 실제로는 위 컴포넌트를 커스텀 폼 컴포넌트에 통합하세요 */}
      {/* 예시는 간단화를 위해 생략 */}
    </>
  );
}
```

> 핵심: `turnstile.execute(form, { sitekey, action })` → 토큰을 받아 hidden input에 넣고 제출.

---

# 3) Pages Router (대체안)

**프론트**
`pages/_app.tsx`에서 스크립트 로드하거나, 페이지 내에서 `<Script />`로 로드 후 위젯 렌더링.

**API 라우트**

```ts
// pages/api/turnstile/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.body?.token || req.query?.token;
  if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: String(token),
    }),
  }).then(r => r.json());

  return res.status(resp.success ? 200 : 403).json({ ok: !!resp.success, raw: resp });
}
```

---

# 4) 테스트 키 & 운영 전환

* **테스트용 Site Key**: `1x00000000000000000000AA`
* **테스트용 Secret Key**: `1x0000000000000000000000000000000AA`

개발/스테이징에서 테스트 키로 동작 확인 후, 운영 배포 시 **대시보드에서 발급받은 키**로 교체하세요.
(운영 키는 클라이언트에선 `NEXT_PUBLIC_...`, 서버에선 `.env`로 안전하게 분리)

---

# 5) 타입, 에러 처리, 보안 베스트프랙티스

* **응답 타입**(공용)

  ```ts
  type TurnstileVerifyResponse = {
    success: boolean;
    "error-codes"?: string[];
    challenge_ts?: string;
    hostname?: string;
    action?: string;
    cdata?: string;
  };
  ```
* **액션 고정**: Invisible 모드 사용 시 `action` 값을 서버에서 검증(예: `signup`만 허용).
* **CSRF**: Turnstile은 봇 구분용. **CSRF 토큰**은 별도로 유지.
* **Rate limit**: 실패/재시도 회수 제한(아이디/세션/IP 기준).
* **프록시 환경**: 실제 클라 IP가 필요한 경우 `X-Forwarded-For` 처리.
* **재렌더/리셋**: SPA 내에서 폼을 여러 번 제출한다면 `turnstile.reset()` 고려.
* **다중 위젯**: 페이지 내 여러 폼에 각각 위젯 렌더 가능(각 컨테이너 별로 `render` 호출).

---

# 6) 빠른 체크리스트

* [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` 설정
* [ ] `<Script src=".../api.js" async defer />` 로드
* [ ] 위젯 렌더(`render`) 또는 Invisible `execute`
* [ ] `cf-turnstile-response` 토큰을 폼으로 서버 전송
* [ ] 서버에서 `siteverify` 호출 후 `success` 확인
* [ ] 실패 케이스 UI/로깅/재시도 처리
* [ ] 운영 전환 시 실제 키로 교체

---

필요하면 이걸 **리포에 바로 붙일 수 있는 최소 샘플(Next.js App Router, TS, ESLint OK)** 형태로 깔끔한 템플릿도 만들어줄게.
원하는 라우팅 구조(예: `/auth/signup`)랑 UI 프레임워크(Tailwind/Chakra/shadcn) 알려주면 거기에 맞춰 드릴게!
