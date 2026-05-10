"use client";
import type { Visibility } from "@/types/app";

const OPTIONS: { value: Visibility; label: string; desc: string; emoji: string }[] = [
  { value: "all",               label: "家族全員",   desc: "家族みんなが見られます",     emoji: "👨‍👩‍👧‍👦" },
  { value: "parents_only",      label: "親のみ",     desc: "ママとパパだけが見られます",  emoji: "👫" },
  { value: "grandparents_only", label: "祖父母のみ", desc: "祖父母だけが見られます",      emoji: "👴👵" },
];

interface Props {
  value: Visibility;
  onChange: (v: Visibility) => void;
}

export default function VisibilityPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
            value === opt.value
              ? "border-warm-400 bg-warm-50"
              : "border-gray-100 bg-gray-50 hover:border-gray-200"
          }`}
        >
          <span className="text-xl shrink-0">{opt.emoji}</span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${value === opt.value ? "text-warm-600" : "text-gray-700"}`}>
              {opt.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
          </div>
          <div
            className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              value === opt.value ? "border-warm-500 bg-warm-500" : "border-gray-300"
            }`}
          >
            {value === opt.value && <span className="block w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}
