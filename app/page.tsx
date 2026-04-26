"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import Link from "next/link";
import { recommendRecipes } from "@/lib/recommend";
import { getAllRecipes } from "@/lib/storage";
import { Recipe } from "@/types/recipe";

const QUICK_INGREDIENTS = [
  "양파", "계란", "감자", "당근", "김치",
  "두부", "돼지고기", "닭고기", "대파", "마늘",
  "버섯", "애호박", "시금치", "고추", "토마토",
];

const SUGGESTED_INGREDIENTS = ["양파", "계란", "감자", "당근", "두부"];

type View = "input" | "loading" | "result";

const CATEGORY_COLOR: Record<Recipe["category"], { bg: string; text: string }> = {
  한식: { bg: "#fff0e8", text: "#c95f10" },
  양식: { bg: "#eff6ff", text: "#1d4ed8" },
  일식: { bg: "#f0fdf4", text: "#166534" },
  중식: { bg: "#fdf4ff", text: "#7e22ce" },
  기타: { bg: "#f9fafb", text: "#374151" },
};

export default function Home() {
  const [view, setView] = useState<View>("input");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 입력 화면 진입 시 키보드 자동 포커스
  useEffect(() => {
    if (view === "input") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [view]);

  function addIngredients(raw: string) {
    const tokens = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (tokens.length === 0) return;
    setIngredients((prev) => {
      const next = [...prev];
      for (const token of tokens) {
        if (!next.includes(token)) next.push(token);
      }
      return next;
    });
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredients(inputValue);
    }
  }

  function removeIngredient(target: string) {
    setIngredients((prev) => prev.filter((i) => i !== target));
  }

  function handleRecommend() {
    setView("loading");
    setTimeout(() => {
      const found = recommendRecipes(ingredients, getAllRecipes());
      setResults(found);
      setView("result");
    }, 800);
  }

  function handleReset() {
    setIngredients([]);
    setResults([]);
    setView("input");
  }

  const hasIngredients = ingredients.length > 0;

  // ─── 로딩 화면 ────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div
          className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#ffe0c8", borderTopColor: "#FF8C42" }}
          aria-label="로딩 중"
          role="status"
        />
        <p className="text-base font-semibold" style={{ color: "#FF8C42" }}>
          맛있는 레시피를 찾고 있어요...
        </p>
        <p className="text-xs text-gray-400">입력하신 재료를 분석 중입니다</p>
      </div>
    );
  }

  // ─── 결과 화면 ────────────────────────────────────────────
  if (view === "result") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* 헤더 */}
        <header
          className="bg-white border-b border-orange-100 px-4 py-4 sticky top-0 z-10"
          style={{ boxShadow: "0 2px 8px rgba(255,140,66,0.08)" }}
        >
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥬🍳</span>
              <h1 className="text-lg font-bold" style={{ color: "#FF8C42" }}>
                윤주의 냉장고를 부탁해
              </h1>
            </div>
            <button
              onClick={handleReset}
              className="text-sm font-medium px-3 rounded-lg transition-colors"
              style={{ color: "#FF8C42", minHeight: "44px" }}
              aria-label="재료 다시 입력하기"
            >
              다시 입력
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-4 py-5 flex flex-col gap-4">
          {/* 사용 재료 요약 */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400 mr-1">사용 재료</span>
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: "#ffe0c8", color: "#c95f10" }}
              >
                {ing}
              </span>
            ))}
          </div>

          {results.length === 0 ? (
            /* ── 빈 상태 ── */
            <div className="flex flex-col items-center text-center py-12 gap-4">
              <span className="text-6xl">🥲</span>
              <div className="flex flex-col gap-2">
                <p className="font-bold text-gray-700 text-base leading-snug">
                  음... 입력하신 재료로 만들 수 있는
                  <br />
                  요리를 찾지 못했어요.
                </p>
                <p className="text-sm text-gray-400">
                  다른 재료로 다시 시도해보세요!
                </p>
              </div>
              <div
                className="w-full rounded-xl px-4 py-3 text-left mt-2"
                style={{ backgroundColor: "#fff8f2", border: "1px solid #ffe0c8" }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: "#FF8C42" }}>
                  💡 이런 재료를 추가해보세요
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_INGREDIENTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setIngredients((prev) =>
                          prev.includes(s) ? prev : [...prev, s]
                        );
                        setView("input");
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                      style={{
                        borderColor: "#FF8C42",
                        color: "#FF8C42",
                        minHeight: "32px",
                      }}
                      aria-label={`${s} 추가하고 다시 검색`}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-base mt-2 active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: "#FF8C42",
                  minHeight: "44px",
                  boxShadow: "0 4px 16px rgba(255,140,66,0.30)",
                }}
                aria-label="처음부터 다시 재료 입력하기"
              >
                처음부터 다시 입력하기
              </button>
            </div>
          ) : (
            /* ── 결과 목록 ── */
            <>
              <p className="text-sm font-semibold text-gray-600">
                🎉 {results.length}가지 레시피를 찾았어요!
              </p>
              <ul className="flex flex-col gap-3" role="list">
                {results.map((recipe) => {
                  const color = CATEGORY_COLOR[recipe.category];
                  return (
                    <li
                      key={recipe.id}
                      className="bg-white rounded-2xl p-4 flex flex-col gap-2"
                      style={{
                        border: "1px solid #ffe0c8",
                        boxShadow: "0 2px 12px rgba(255,140,66,0.08)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-foreground leading-snug">
                          {recipe.name}
                        </h3>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                          style={{ backgroundColor: color.bg, color: color.text }}
                        >
                          {recipe.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>⏱ {recipe.cookingTime}분</span>
                        <span className="text-gray-200">|</span>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.map((ing) => {
                            const matched = ingredients.some(
                              (ui) =>
                                ui.includes(ing) || ing.includes(ui)
                            );
                            return (
                              <span
                                key={ing}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={
                                  matched
                                    ? { backgroundColor: "#ffe0c8", color: "#c95f10", fontWeight: 600 }
                                    : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
                                }
                              >
                                {ing}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl font-bold text-base mt-2 active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: "#FF8C42",
                  color: "#fff",
                  minHeight: "44px",
                  boxShadow: "0 4px 16px rgba(255,140,66,0.30)",
                }}
                aria-label="처음으로 돌아가서 재료 다시 입력"
              >
                🔄 다른 재료로 다시 추천받기
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  // ─── 입력 화면 ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header
        className="bg-white border-b border-orange-100 px-4 py-4 sticky top-0 z-10"
        style={{ boxShadow: "0 2px 8px rgba(255,140,66,0.08)" }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🥬🍳</span>
            <h1 className="text-lg font-bold" style={{ color: "#FF8C42" }}>
              윤주의 냉장고를 부탁해
            </h1>
          </div>
          <Link
            href="/recipes"
            className="text-xs font-semibold px-3 py-2 rounded-xl border transition-colors"
            style={{ borderColor: "#ffe0c8", color: "#FF8C42" }}
            aria-label="레시피 목록 관리"
          >
            📋 레시피 관리
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* 서브 타이틀 */}
        <div className="text-center pt-1 pb-0.5">
          <p className="text-sm text-gray-500 leading-relaxed">
            냉장고에 있는 재료를 알려주세요 🧡
            <br />
            딱 맞는 레시피를 찾아드릴게요!
          </p>
        </div>

        {/* 재료 입력 카드 */}
        <section
          className="bg-white rounded-2xl p-5 flex flex-col gap-4"
          style={{ boxShadow: "0 2px 16px rgba(255,140,66,0.10)", border: "1px solid #ffe0c8" }}
          aria-label="재료 입력 영역"
        >
          <h2 className="font-bold text-base text-foreground flex items-center gap-1.5">
            <span aria-hidden="true">🛒</span> 재료 입력
          </h2>

          {/* 입력창 + 추가 버튼 */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="재료를 입력하고 Enter를 눌러주세요. 예: 양파"
              className="flex-1 border rounded-xl px-4 text-sm placeholder:text-gray-300 focus:outline-none transition"
              style={{
                borderColor: "#ffe0c8",
                backgroundColor: "#fffaf6",
                minHeight: "44px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#FF8C42";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,140,66,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ffe0c8";
                e.currentTarget.style.boxShadow = "none";
              }}
              aria-label="재료 입력창. 쉼표로 여러 재료를 한 번에 입력할 수 있습니다"
            />
            <button
              onClick={() => addIngredients(inputValue)}
              className="text-white font-bold text-sm px-5 rounded-xl shrink-0 active:scale-95 transition-transform"
              style={{ backgroundColor: "#FF8C42", minHeight: "44px" }}
              aria-label="재료 추가"
            >
              추가
            </button>
          </div>

          {/* 자주 쓰는 재료 빠른 추가 */}
          <div>
            <p className="text-xs text-gray-400 mb-2">자주 쓰는 재료</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="자주 쓰는 재료 빠른 추가">
              {QUICK_INGREDIENTS.map((item) => {
                const added = ingredients.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => !added && addIngredients(item)}
                    disabled={added}
                    className="text-xs px-3 rounded-full border transition-all"
                    style={{
                      minHeight: "32px",
                      borderColor: added ? "#ffe0c8" : "#e5e7eb",
                      backgroundColor: added ? "#ffe0c8" : "#fff",
                      color: added ? "#c95f10" : "#6b7280",
                      cursor: added ? "default" : "pointer",
                    }}
                    aria-label={added ? `${item} 이미 추가됨` : `${item} 추가`}
                    aria-pressed={added}
                  >
                    {added ? `✓ ${item}` : `+ ${item}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 추가된 재료 태그 */}
          {hasIngredients && (
            <div>
              <p className="text-xs text-gray-400 mb-2">
                추가된 재료 ({ingredients.length}개)
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="추가된 재료 목록">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#ffe0c8", color: "#c95f10" }}
                    role="listitem"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-0.5 leading-none transition-opacity hover:opacity-60 w-4 h-4 flex items-center justify-center"
                      style={{ color: "#e06b1f" }}
                      aria-label={`${ingredient} 삭제`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 전체 초기화 */}
          {hasIngredients && (
            <button
              onClick={() => setIngredients([])}
              className="self-start text-xs underline underline-offset-2 transition-colors text-gray-400 hover:text-gray-600"
              style={{ minHeight: "44px" }}
              aria-label="추가된 재료 전체 삭제"
            >
              전체 초기화
            </button>
          )}
        </section>

        {/* 안내 문구 */}
        <div
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: "#fff8f2", border: "1px solid #ffe0c8" }}
          role="note"
        >
          <p className="text-xs leading-relaxed" style={{ color: "#b8621a" }}>
            💡 기본 재료(쌀, 밀가루)와 조미료(소금, 간장, 설탕 등)는
            있다고 가정합니다
          </p>
        </div>
      </main>

      {/* 하단 CTA */}
      <div
        className="sticky bottom-0 px-4 py-4"
        style={{ backgroundColor: "#fffdf7", borderTop: "1px solid #ffe0c8" }}
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={handleRecommend}
            disabled={!hasIngredients}
            className="w-full rounded-2xl font-bold text-base transition-all active:scale-[0.98]"
            style={{
              minHeight: "52px",
              ...(hasIngredients
                ? {
                    backgroundColor: "#FF8C42",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(255,140,66,0.35)",
                  }
                : {
                    backgroundColor: "#e5e7eb",
                    color: "#9ca3af",
                    cursor: "not-allowed",
                  }),
            }}
            aria-label={
              hasIngredients
                ? `${ingredients.length}개 재료로 레시피 추천받기`
                : "재료를 입력해야 추천받을 수 있습니다"
            }
            aria-disabled={!hasIngredients}
          >
            {hasIngredients
              ? `🍳 레시피 추천받기 (${ingredients.length}개 재료)`
              : "레시피 추천받기"}
          </button>
        </div>
      </div>
    </div>
  );
}
