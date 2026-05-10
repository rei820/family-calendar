"use client";
import { CATEGORIES } from "@/constants/categories";
import type { Category } from "@/types/app";

interface Props {
  value: Category;
  onChange: (cat: Category) => void;
}

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, meta]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all text-center ${
            value === key
              ? `border-warm-400 ${meta.bgColor}`
              : "border-gray-100 bg-gray-50 hover:border-gray-200"
          }`}
        >
          <span className="text-2xl leading-none">{meta.emoji}</span>
          <span className={`text-xs font-medium leading-tight ${value === key ? meta.textColor : "text-gray-500"}`}>
            {meta.label}
          </span>
        </button>
      ))}
    </div>
  );
}
