import { Recipe } from "@/types/recipe";
import { recipes as builtinRecipes } from "@/data/recipes";

/** 두 문자열이 부분 포함 관계인지 확인 (양방향) */
function isMatch(userIngredient: string, recipeIngredient: string): boolean {
  const u = userIngredient.trim().toLowerCase();
  const r = recipeIngredient.trim().toLowerCase();
  return u.includes(r) || r.includes(u);
}

interface ScoredRecipe {
  recipe: Recipe;
  /** 레시피 재료 중 매칭된 비율 (0~1) */
  coverageScore: number;
  /** 사용자 재료 중 활용된 비율 (0~1) */
  utilizationScore: number;
  /** 최종 점수 */
  score: number;
  matchedCount: number;
}

function scoreRecipe(recipe: Recipe, userIngredients: string[]): ScoredRecipe {
  const matchedCount = recipe.ingredients.filter((ri) =>
    userIngredients.some((ui) => isMatch(ui, ri))
  ).length;

  const usedUserCount = userIngredients.filter((ui) =>
    recipe.ingredients.some((ri) => isMatch(ui, ri))
  ).length;

  // 레시피 재료를 얼마나 채웠는지 (완성도)
  const coverageScore = matchedCount / recipe.ingredients.length;

  // 사용자 재료를 얼마나 활용하는지 (활용도)
  const utilizationScore =
    userIngredients.length > 0 ? usedUserCount / userIngredients.length : 0;

  // 완성도 60% + 활용도 40% 가중 합산
  const score = coverageScore * 0.6 + utilizationScore * 0.4;

  return { recipe, coverageScore, utilizationScore, score, matchedCount };
}

/**
 * 카테고리 다양성을 고려해 상위 N개를 선택한다.
 * - 먼저 점수 내림차순으로 정렬
 * - 같은 카테고리가 2개 이상 연속으로 들어가지 않도록 후순위로 밀어냄
 */
function diversify(scored: ScoredRecipe[], limit: number): Recipe[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const result: ScoredRecipe[] = [];
  const remaining = [...sorted];

  while (result.length < limit && remaining.length > 0) {
    const lastCategory = result.at(-1)?.recipe.category;

    // 직전 카테고리와 다른 첫 번째 항목 우선 선택
    const idx = remaining.findIndex(
      (s) => s.recipe.category !== lastCategory
    );

    if (idx !== -1) {
      result.push(...remaining.splice(idx, 1));
    } else {
      // 모두 같은 카테고리면 그냥 첫 번째 선택
      result.push(...remaining.splice(0, 1));
    }
  }

  return result.map((s) => s.recipe);
}

/**
 * 사용자가 입력한 재료 목록을 기반으로 레시피를 추천한다.
 * @returns 최대 5개의 추천 레시피 (점수 내림차순, 카테고리 다양성 적용)
 */
export function recommendRecipes(
  userIngredients: string[],
  pool: Recipe[] = builtinRecipes
): Recipe[] {
  if (userIngredients.length === 0) return [];

  const scored = pool
    .map((recipe) => scoreRecipe(recipe, userIngredients))
    .filter((s) => s.matchedCount > 0);

  return diversify(scored, 5);
}
