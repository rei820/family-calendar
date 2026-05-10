"use client";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import type { Child } from "@/types/app";

interface Props {
  year: number;
  month: number;
  view: "month" | "list";
  filterChildId: string | null;
  familyChildren: Child[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onViewChange: (v: "month" | "list") => void;
  onFilterChange: (childId: string | null) => void;
}

export default function CalendarHeader({
  year, month, view, filterChildId, familyChildren,
  onPrevMonth, onNextMonth, onViewChange, onFilterChange,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-lg">
          ホーム（カレンダー）
        </h2>
        <button className="flex items-center gap-1.5 text-sm text-warm-500 font-medium bg-warm-50 px-3 py-1.5 rounded-xl hover:bg-warm-100 transition-colors">
          <UserPlus size={15} />
          招待
        </button>
      </div>

      {/* Child filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onFilterChange(null)}
          className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filterChildId === null
              ? "bg-warm-500 text-white border-warm-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          <span>👨‍👩‍👧‍👦</span>
          <span>みんな</span>
        </button>
        {familyChildren.map((child) => (
          <button
            key={child.id}
            onClick={() => onFilterChange(child.id)}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterChildId === child.id
                ? "bg-warm-500 text-white border-warm-500"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className={`w-5 h-5 rounded-full ${child.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
              {child.name[0]}
            </span>
            <span>{child.name}</span>
          </button>
        ))}
      </div>

      {/* Month nav + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-gray-800 text-base w-28 text-center">
            {year}年{month}月
          </span>
          <button
            onClick={onNextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {(["month", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                view === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
              }`}
            >
              {v === "month" ? "月" : "一覧"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
