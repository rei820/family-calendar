import EventCard from "@/components/events/EventCard";
import type { Event } from "@/types/app";

interface Props {
  events: Event[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

export default function ListView({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-gray-500 text-sm">この月の思い出はまだありません</p>
        <p className="text-gray-400 text-xs mt-1">日付をタップして記録しよう</p>
      </div>
    );
  }

  // Group by date
  const grouped = events.reduce<Record<string, Event[]>>((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = [];
    acc[evt.date].push(evt);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <section key={date}>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warm-400 inline-block" />
            {formatDateLabel(date)}
          </h3>
          <div className="space-y-3">
            {grouped[date].map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
