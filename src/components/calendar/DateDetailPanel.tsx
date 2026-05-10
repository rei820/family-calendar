"use client";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import type { Event } from "@/types/app";

interface Props {
  dateStr: string | null;
  events: Event[];
  onClose: () => void;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

export default function DateDetailPanel({ dateStr, events, onClose }: Props) {
  if (!dateStr) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <span className="text-5xl mb-4">📅</span>
        <p className="text-gray-400 text-sm">日付を選択すると<br />詳細が表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={16} />
          戻る
        </button>
        <h2 className="text-sm font-bold text-gray-700">{formatDateFull(dateStr)}</h2>
        <Link
          href={`/events/new?date=${dateStr}`}
          className="w-8 h-8 rounded-full bg-warm-500 flex items-center justify-center text-white hover:bg-warm-400 transition-colors shadow-sm"
        >
          <Plus size={16} />
        </Link>
      </div>

      {/* Events */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10">
          <span className="text-3xl mb-3">✨</span>
          <p className="text-gray-400 text-sm text-center">この日の思い出を<br />記録しよう</p>
          <Link
            href={`/events/new?date=${dateStr}`}
            className="mt-4 btn-primary text-sm py-2 px-5"
          >
            記録する
          </Link>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-0.5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
