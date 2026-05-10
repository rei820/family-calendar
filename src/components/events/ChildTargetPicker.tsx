"use client";
import type { Child } from "@/types/app";

interface Props {
  familyChildren: Child[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ChildTargetPicker({ familyChildren, selectedIds, onChange }: Props) {
  const toggleChild = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const allSelected = selectedIds.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
          allSelected
            ? "border-warm-400 bg-warm-50 text-warm-600"
            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
        }`}
      >
        <span>👨‍👩‍👧‍👦</span>
        <span>家族全体</span>
      </button>

      {familyChildren.map((child) => {
        const selected = selectedIds.includes(child.id);
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => toggleChild(child.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
              selected
                ? "border-warm-400 bg-warm-50 text-warm-600"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className={`w-5 h-5 rounded-full ${child.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
              {child.name[0]}
            </span>
            <span>{child.name}</span>
          </button>
        );
      })}
    </div>
  );
}
