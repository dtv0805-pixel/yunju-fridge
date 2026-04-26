export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  description: string;
  cookingTime: number;
  category: "한식" | "양식" | "일식" | "중식" | "기타";
}
