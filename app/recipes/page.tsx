"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { Recipe } from "@/types/recipe";
import {
  getAllRecipes,
  upsertRecipe,
  deleteCustomRecipe,
  restoreBuiltinRecipe,
  generateCustomId,
  isCustomRecipe,
  isOverridden,
} from "@/lib/storage";

const CATEGORIES: Recipe["category"][] = ["한식", "양식", "일식", "중식", "기타"];

const CATEGORY_COLOR: Record<Recipe["category"], { bg: string; text: string }> = {
  한식: { bg: "#fff0e8", text: "#c95f10" },
  양식: { bg: "#eff6ff", text: "#1d4ed8" },
  일식: { bg: "#f0fdf4", text: "#166534" },
  중식: { bg: "#fdf4ff", text: "#7e22ce" },
  기타: { bg: "#f9fafb", text: "#374151" },
};

type FilterTab = "전체" | Recipe["category"];

const EMPTY_FORM = {
  name: "",
  category: "한식" as Recipe["category"],
  cookingTime: "",
  description: "",
  ingredients: [] as string[],
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<FilterTab>("전체");
  const [search, setSearch] = useState("");

  // 폼 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [ingInput, setIngInput] = useState("");
  const [formError, setFormError] = useState("");

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  function refresh() {
    setRecipes(getAllRecipes());
  }

  // ── 필터 ──
  const displayed = recipes.filter((r) => {
    const matchCat = filter === "전체" || r.category === filter;
    const matchSearch =
      search.trim() === "" ||
      r.name.includes(search.trim()) ||
      r.ingredients.some((i) => i.includes(search.trim()));
    return matchCat && matchSearch;
  });

  // ── 폼 열기 ──
  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, ingredients: [] });
    setIngInput("");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(recipe: Recipe) {
    setEditTarget(recipe);
    setForm({
      name: recipe.name,
      category: recipe.category,
      cookingTime: String(recipe.cookingTime),
      description: recipe.description,
      ingredients: [...recipe.ingredients],
    });
    setIngInput("");
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
  }

  // ── 재료 입력 ──
  function addIng(raw: string) {
    const tokens = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!tokens.length) return;
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        ...tokens.filter((t) => !prev.ingredients.includes(t)),
      ],
    }));
    setIngInput("");
  }

  function removeIng(target: string) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i !== target),
    }));
  }

  function handleIngKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addIng(ingInput);
    }
  }

  // ── 저장 ──
  function handleSave() {
    if (!form.name.trim()) return setFormError("요리 이름을 입력해주세요.");
    if (!form.cookingTime || isNaN(Number(form.cookingTime)))
      return setFormError("조리 시간을 숫자로 입력해주세요.");
    if (form.ingredients.length === 0)
      return setFormError("재료를 1개 이상 추가해주세요.");

    const recipe: Recipe = {
      id: editTarget?.id ?? generateCustomId(),
      name: form.name.trim(),
      category: form.category,
      cookingTime: Number(form.cookingTime),
      description: form.description.trim(),
      ingredients: form.ingredients,
    };
    upsertRecipe(recipe);
    refresh();
    closeModal();
  }

  // ── 삭제 ──
  function handleDelete(recipe: Recipe) {
    setDeleteTarget(recipe);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteCustomRecipe(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  }

  // ── 복원 ──
  function handleRestore(id: string) {
    restoreBuiltinRecipe(id);
    refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header
        className="bg-white border-b border-orange-100 px-4 py-3 sticky top-0 z-20"
        style={{ boxShadow: "0 2px 8px rgba(255,140,66,0.08)" }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-orange-50"
              aria-label="메인으로 돌아가기"
            >
              <span className="text-lg">←</span>
            </Link>
            <h1 className="text-base font-bold text-foreground">
              레시피 목록
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({recipes.length}개)
              </span>
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1 text-sm font-bold text-white px-4 rounded-xl active:scale-95 transition-transform"
            style={{ backgroundColor: "#FF8C42", minHeight: "40px" }}
            aria-label="새 레시피 추가"
          >
            <span>+</span> 레시피 추가
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 flex flex-col gap-3">
        {/* 검색 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="레시피 이름 또는 재료로 검색"
          className="w-full border rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none transition"
          style={{ borderColor: "#ffe0c8", backgroundColor: "#fffaf6" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#FF8C42"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#ffe0c8"; }}
          aria-label="레시피 검색"
        />

        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {(["전체", ...CATEGORIES] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={
                filter === tab
                  ? { backgroundColor: "#FF8C42", color: "#fff", borderColor: "#FF8C42" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
              }
              aria-pressed={filter === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 레시피 카드 목록 */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-gray-500 text-sm">
              {search ? "검색 결과가 없어요." : "레시피가 없어요."}
            </p>
            <button
              onClick={openAdd}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white active:scale-95 transition-transform"
              style={{ backgroundColor: "#FF8C42" }}
            >
              + 레시피 추가하기
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 pb-8">
            {displayed.map((recipe) => {
              const color = CATEGORY_COLOR[recipe.category];
              const custom = isCustomRecipe(recipe.id);
              const overridden = !custom && isOverridden(recipe.id);
              return (
                <li
                  key={recipe.id}
                  className="bg-white rounded-2xl p-4 flex flex-col gap-2"
                  style={{ border: "1px solid #ffe0c8", boxShadow: "0 2px 10px rgba(255,140,66,0.07)" }}
                >
                  {/* 상단: 이름 + 배지들 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm text-foreground">{recipe.name}</h2>
                      {custom && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "#fff0e8", color: "#FF8C42", border: "1px solid #ffe0c8" }}>
                          직접 추가
                        </span>
                      )}
                      {overridden && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                          수정됨
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {recipe.category}
                    </span>
                  </div>

                  {/* 설명 */}
                  {recipe.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{recipe.description}</p>
                  )}

                  {/* 재료 + 시간 */}
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {recipe.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                      >
                        {ing}
                      </span>
                    ))}
                    <span className="text-xs px-2 py-0.5 rounded ml-auto"
                      style={{ backgroundColor: "#fff8f2", color: "#b8621a" }}>
                      ⏱ {recipe.cookingTime}분
                    </span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 mt-1 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => openEdit(recipe)}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors active:scale-95"
                      style={{ borderColor: "#FF8C42", color: "#FF8C42" }}
                      aria-label={`${recipe.name} 수정`}
                    >
                      ✏️ 수정
                    </button>
                    {custom ? (
                      <button
                        onClick={() => handleDelete(recipe)}
                        className="flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors active:scale-95"
                        style={{ borderColor: "#ef4444", color: "#ef4444" }}
                        aria-label={`${recipe.name} 삭제`}
                      >
                        🗑 삭제
                      </button>
                    ) : overridden ? (
                      <button
                        onClick={() => handleRestore(recipe.id)}
                        className="flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors active:scale-95"
                        style={{ borderColor: "#d97706", color: "#d97706" }}
                        aria-label={`${recipe.name} 기본값으로 복원`}
                      >
                        ↩ 복원
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ── 추가/수정 모달 ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end">
          {/* 딤 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />
          {/* 바텀 시트 */}
          <div
            className="relative bg-white rounded-t-3xl px-4 pt-5 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
          >
            {/* 핸들 */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-1 mb-1" />

            <h2 className="font-bold text-base text-foreground">
              {editTarget ? "레시피 수정" : "새 레시피 추가"}
            </h2>

            {/* 요리 이름 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                요리 이름 <span style={{ color: "#FF8C42" }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 김치찌개"
                className="border rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={{ borderColor: "#ffe0c8", minHeight: "44px" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#FF8C42"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#ffe0c8"; }}
              />
            </div>

            {/* 카테고리 + 조리 시간 */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-600">
                  카테고리 <span style={{ color: "#FF8C42" }}>*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Recipe["category"] })}
                  className="border rounded-xl px-3 text-sm focus:outline-none bg-white transition"
                  style={{ borderColor: "#ffe0c8", minHeight: "44px" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-28">
                <label className="text-xs font-semibold text-gray-600">
                  조리 시간(분) <span style={{ color: "#FF8C42" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.cookingTime}
                  onChange={(e) => setForm({ ...form, cookingTime: e.target.value })}
                  placeholder="20"
                  className="border rounded-xl px-3 text-sm focus:outline-none transition"
                  style={{ borderColor: "#ffe0c8", minHeight: "44px" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF8C42"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#ffe0c8"; }}
                />
              </div>
            </div>

            {/* 한 줄 설명 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">한 줄 설명</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="예: 얼큰하고 깊은 맛의 국민 찌개"
                className="border rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={{ borderColor: "#ffe0c8", minHeight: "44px" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#FF8C42"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#ffe0c8"; }}
              />
            </div>

            {/* 재료 입력 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                재료 <span style={{ color: "#FF8C42" }}>*</span>
                <span className="ml-1 font-normal text-gray-400">(쉼표로 여러 개 입력 가능)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingInput}
                  onChange={(e) => setIngInput(e.target.value)}
                  onKeyDown={handleIngKeyDown}
                  placeholder="예: 김치, 돼지고기"
                  className="flex-1 border rounded-xl px-4 text-sm focus:outline-none transition"
                  style={{ borderColor: "#ffe0c8", minHeight: "44px" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF8C42"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#ffe0c8"; }}
                />
                <button
                  onClick={() => addIng(ingInput)}
                  className="text-white font-bold text-sm px-4 rounded-xl shrink-0 active:scale-95 transition-transform"
                  style={{ backgroundColor: "#FF8C42", minHeight: "44px" }}
                  aria-label="재료 추가"
                >
                  추가
                </button>
              </div>
              {form.ingredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full"
                      style={{ backgroundColor: "#ffe0c8", color: "#c95f10" }}
                    >
                      {ing}
                      <button
                        onClick={() => removeIng(ing)}
                        className="leading-none hover:opacity-60 transition-opacity"
                        style={{ color: "#e06b1f" }}
                        aria-label={`${ing} 삭제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 에러 */}
            {formError && (
              <p className="text-xs font-medium" style={{ color: "#ef4444" }}>
                ⚠ {formError}
              </p>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 mt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-colors active:scale-95"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                aria-label="취소"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-transform"
                style={{ backgroundColor: "#FF8C42", boxShadow: "0 4px 12px rgba(255,140,66,0.30)" }}
                aria-label="저장"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-xs flex flex-col gap-4 text-center"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <span className="text-4xl">🗑️</span>
            <div>
              <p className="font-bold text-base text-foreground">레시피를 삭제할까요?</p>
              <p className="text-sm text-gray-500 mt-1">
                <b>{deleteTarget.name}</b> 레시피가 영구적으로 삭제됩니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
