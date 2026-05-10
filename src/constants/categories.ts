import type { Category } from "@/types/app";

export interface CategoryMeta {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  memory:   { label: "今日の思い出", emoji: "📸", bgColor: "bg-yellow-100",  textColor: "text-yellow-700" },
  hajimete: { label: "はじめて",     emoji: "🚲", bgColor: "bg-pink-100",    textColor: "text-pink-700"   },
  hospital: { label: "病院",         emoji: "🏥", bgColor: "bg-blue-100",    textColor: "text-blue-700"   },
  birthday: { label: "誕生日",       emoji: "🎂", bgColor: "bg-purple-100",  textColor: "text-purple-700" },
  nursery:  { label: "保育園/学校",  emoji: "🎒", bgColor: "bg-green-100",   textColor: "text-green-700"  },
  outing:   { label: "おでかけ",     emoji: "🚗", bgColor: "bg-orange-100",  textColor: "text-orange-700" },
  food:     { label: "ごはん",       emoji: "🍽", bgColor: "bg-red-100",     textColor: "text-red-700"    },
  growth:   { label: "成長記録",     emoji: "📏", bgColor: "bg-teal-100",    textColor: "text-teal-700"   },
  other:    { label: "その他",       emoji: "✨", bgColor: "bg-gray-100",    textColor: "text-gray-700"   },
};
