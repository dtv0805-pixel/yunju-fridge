# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**윤주의 냉장고를 부탁해** — 냉장고 재료 기반 레시피 추천 앱.  
Next.js 14 App Router + TypeScript + Tailwind CSS. 모바일 우선 반응형.

## Commands

```bash
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
npm run lint      # ESLint 검사 (eslint@8 + eslint-config-next@14 조합 필요)
```

## Architecture

- **`app/page.tsx`** — 단일 페이지 앱. `view: 'input' | 'loading' | 'result'` 상태로 세 화면을 전환한다. 라우팅 없음.
- **`app/layout.tsx`** — Noto Sans KR 폰트, 메타데이터, OG 태그. `APP_URL` 상수를 실제 배포 URL로 교체해야 OG 태그가 올바르게 동작한다.
- **`components/`** — 재사용 UI 컴포넌트 (예: `Header.tsx`).
- **`lib/recommend.ts`** — `recommendRecipes(userIngredients)`: 완성도(60%) + 활용도(40%) 가중 점수로 레시피를 정렬하고 카테고리 다양성을 보정해 상위 5개 반환. 부분 문자열 양방향 매칭.
- **`lib/utils.ts`** — `cn()` 클래스 병합, 레시피 필터링 유틸.
- **`types/recipe.ts`** — `Recipe` 인터페이스 (정규 타입 위치). `types/index.ts`는 re-export 역할.
- **`data/recipes.ts`** — 정적 레시피 34개 (한식 22, 양식 6, 일식 5, 중식 4). 레시피 추가 시 이 파일만 수정하면 된다.

## Styling

- CSS 변수: `--primary` (#FF8C42 오렌지), `--background` (#fffdf7 아이보리).
- Tailwind 커스텀 컬러: `bg-primary`, `text-primary` 등으로 사용 가능.
- 인라인 style로 직접 색상을 쓰는 패턴도 혼용 중 (CSS 변수가 Tailwind JIT에서 동적으로 안 잡히는 경우).
- 모바일 기준 `max-w-md` 컨테이너로 중앙 정렬. 모든 터치 버튼은 `minHeight: 44px`.

## ESLint 주의사항

`eslint-config-next`는 Next.js 14와 같은 메이저 버전(`eslint-config-next@14`)을 설치해야 하며, ESLint 자체는 v8이어야 한다. v9는 flat config 방식으로 바뀌어 `next lint`와 충돌한다.
