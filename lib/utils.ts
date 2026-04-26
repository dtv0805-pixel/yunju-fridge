import { Recipe, Ingredient } from "@/types";

export function filterRecipesByIngredients(
  recipes: Recipe[],
  selectedIngredients: string[]
): Recipe[] {
  if (selectedIngredients.length === 0) return recipes;
  return recipes.filter((recipe) =>
    selectedIngredients.every((ing) =>
      recipe.ingredients.some((ri) => ri.includes(ing))
    )
  );
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
