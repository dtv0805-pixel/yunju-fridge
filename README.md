# 🥬 윤주의 냉장고를 부탁해

냉장고 속 재료를 입력하면 만들 수 있는 요리를 추천해주는 웹 앱입니다.

## 주요 기능

- **재료 태그 입력** — 입력창에 재료 입력 후 Enter 또는 추가 버튼. 쉼표(`,`)로 여러 재료 동시 입력 가능
- **빠른 재료 선택** — 자주 쓰는 재료(양파, 계란, 감자 등) 칩 클릭으로 즉시 추가
- **스마트 레시피 추천** — 보유 재료 매칭 점수 + 카테고리 다양성 알고리즘으로 최대 5개 추천
- **부분 문자열 매칭** — "돼지"를 입력해도 "돼지고기" 포함 레시피 매칭
- **빈 상태 안내** — 결과 없을 때 대체 재료 추천으로 재검색 유도
- **모바일 최적화** — 터치 타겟 44px 이상, 자동 포커스, 반응형 레이아웃

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 폰트 | Noto Sans KR (Google Fonts) |
| 배포 | Vercel |

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm run start

# 린트 검사
npm run lint
```

## 폴더 구조

```
├── app/
│   ├── layout.tsx       # 루트 레이아웃 (폰트, 메타데이터, OG 태그)
│   ├── page.tsx         # 메인 화면 (입력 → 로딩 → 결과 뷰)
│   └── globals.css      # CSS 변수 및 글로벌 스타일
├── components/
│   └── Header.tsx       # 공통 헤더 컴포넌트
├── data/
│   └── recipes.ts       # 정적 레시피 데이터 (34개)
├── lib/
│   ├── recommend.ts     # 레시피 추천 알고리즘
│   └── utils.ts         # cn() 유틸, 레시피 필터링
├── types/
│   ├── recipe.ts        # Recipe 인터페이스
│   └── index.ts         # 공통 타입 re-export
└── public/
    └── favicon.svg      # 이모지 기반 SVG favicon
```

## 추천 알고리즘

`lib/recommend.ts`의 `recommendRecipes()` 함수:

1. **매칭 점수 계산** — 사용자 재료 ↔ 레시피 재료 부분 문자열 매칭
2. **완성도 점수** (60%) — 매칭된 재료 수 / 레시피 전체 재료 수
3. **활용도 점수** (40%) — 레시피에 쓰인 사용자 재료 수 / 입력 재료 수
4. **다양성 보정** — 카테고리가 연속으로 편중되지 않도록 순서 조정
5. **상위 5개 반환**

## Vercel 배포

별도 환경변수나 서버 설정이 필요 없는 정적 앱입니다.

```bash
# Vercel CLI 사용 시
npm i -g vercel
vercel
```

또는 [vercel.com](https://vercel.com)에서 GitHub 저장소를 연결하면 자동 배포됩니다.  
빌드 설정은 기본값(`next build`)으로 충분하며 `vercel.json`은 불필요합니다.

배포 후 `app/layout.tsx`의 `APP_URL` 상수를 실제 배포 URL로 교체하면 OG 태그가 올바르게 동작합니다.

## 향후 확장 가능한 기능

- **레시피 상세 페이지** — 단계별 조리법, 재료 분량 표시
- **즐겨찾기** — localStorage 기반 레시피 저장
- **재료 카테고리 필터** — 채소/육류/해산물 등 카테고리별 탐색
- **AI 추천 고도화** — 외부 레시피 API 또는 LLM 연동
- **레시피 데이터 확장** — 사용자 제보 또는 크롤링 기반 DB 구축
- **다국어 지원** — 영어/일본어 버전 추가
"# yunju-fridge" 
"# yunju-fridge" 
