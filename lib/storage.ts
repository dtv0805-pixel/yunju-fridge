import { Recipe } from "@/types/recipe";
import { recipes as builtinRecipes } from "@/data/recipes";

const CUSTOM_KEY = "yoonju_custom_recipes";
const OVERRIDE_KEY = "yoonju_recipe_overrides";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getCustomRecipes(): Recipe[] {
  return readJSON<Recipe[]>(CUSTOM_KEY, []);
}

export function getRecipeOverrides(): Record<string, Recipe> {
  return readJSON<Record<string, Recipe>>(OVERRIDE_KEY, {});
}

/** 기본 레시피(오버라이드 반영) + 커스텀 레시피를 합친 전체 목록 */
export function getAllRecipes(): Recipe[] {
  const overrides = getRecipeOverrides();
  const merged = builtinRecipes.map((r) => overrides[r.id] ?? r);
  return [...merged, ...getCustomRecipes()];
}

/** 레시피 저장 (커스텀이면 custom 배열에, 기본이면 override 맵에) */
export function upsertRecipe(recipe: Recipe): void {
  if (recipe.id.startsWith("custom_")) {
    const list = getCustomRecipes();
    const idx = list.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) list[idx] = recipe;
    else list.push(recipe);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } else {
    const overrides = getRecipeOverrides();
    overrides[recipe.id] = recipe;
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
  }
}

/** 커스텀 레시피 삭제 */
export function deleteCustomRecipe(id: string): void {
  if (!id.startsWith("custom_")) return;
  const list = getCustomRecipes().filter((r) => r.id !== id);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

/** 기본 레시피를 원본으로 복원 */
export function restoreBuiltinRecipe(id: string): void {
  const overrides = getRecipeOverrides();
  delete overrides[id];
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
}

/** 새 커스텀 레시피용 고유 ID */
export function generateCustomId(): string {
  return `custom_${Date.now()}`;
}

/** 특정 ID가 커스텀인지 여부 */
export function isCustomRecipe(id: string): boolean {
  return id.startsWith("custom_");
}

/** 특정 기본 레시피가 수정된 상태인지 여부 */
export function isOverridden(id: string): boolean {
  return id in getRecipeOverrides();
}
