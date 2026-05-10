"use client";
import CalendarDay from "./CalendarDay";
import type { Event } from "@/types/app";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

interface Props {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export default function MonthView({ year, month, eventsByDate, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build 42-cell grid (6 weeks × 7 days)
  // Monday-first calendar (Japanese standard)
  const firstDay = new Date(year, month - 1, 1);
  const firstDow = firstDay.getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // offset from Monday

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month - 1, d));
  while (cells.length < 42) cells.push(null);

  const toStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-medium py-1 ${
              i === 5 ? "text-blue-400" : i === 6 ? "text-red-400" : "text-gray-400"
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
          const dateStr = toStr(date);
          const events = eventsByDate[dateStr] ?? [];
          return (
            <CalendarDay
              key={dateStr}
              date={date}
              events={events}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              isCurrentMonth={date.getMonth() === month - 1}
              onClick={() => onSelectDate(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
