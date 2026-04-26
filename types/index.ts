export interface Ingredient {
  id: string;
  name: string;
  category: "채소" | "육류" | "해산물" | "유제품" | "곡물" | "양념" | "기타";
}

export type { Recipe } from "./recipe";
