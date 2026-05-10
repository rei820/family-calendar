import type { Event } from "@/types/app";
import { CATEGORIES } from "@/constants/categories";

interface Props {
  date: Date | null;
  events: Event[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

export default function CalendarDay({ date, events, isToday, isSelected, isCurrentMonth, onClick }: Props) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const day = date.getDate();
  const dow = date.getDay();
  const isSunday   = dow === 0;
  const isSaturday = dow === 6;

  const dateColor = isSelected
    ? "text-white"
    : isToday
    ? "text-warm-500"
    : isSunday
    ? "text-red-400"
    : isSaturday
    ? "text-blue-400"
    : isCurrentMonth
    ? "text-gray-700"
    : "text-gray-300";

  return (
    <button
      onClick={onClick}
      className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-xl transition-all relative
        ${isSelected ? "bg-warm-500 shadow-md" : isToday ? "bg-warm-50 ring-1 ring-warm-400" : "hover:bg-gray-50"}
      `}
    >
      <span className={`text-sm font-semibold leading-none ${dateColor}`}>{day}</span>

      {/* Event indicators */}
      {events.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-0.5">
          {events.slice(0, 3).map((evt, i) =>
            evt.photos.length > 0 ? (
              <div
                key={evt.id}
                className="w-4 h-4 rounded-md overflow-hidden bg-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={evt.photos[0].url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <span key={evt.id} className="text-[9px] leading-none">
                {CATEGORIES[evt.category].emoji}
              </span>
            )
          )}
          {events.length > 3 && (
            <span className={`text-[8px] font-bold ${isSelected ? "text-white/80" : "text-gray-400"}`}>
              +{events.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
