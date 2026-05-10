"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import MonthView from "@/components/calendar/MonthView";
import ListView from "@/components/calendar/ListView";
import DateDetailPanel from "@/components/calendar/DateDetailPanel";
import BottomNav from "@/components/layout/BottomNav";
import SidebarNav from "@/components/layout/SidebarNav";
import { getEventsByDate } from "@/lib/mockData";
import { useEvents } from "@/context/EventsContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function CalendarPage() {
  const { loading } = useAuthGuard();
  const { events, children } = useEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fff8f0]">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }
  const today = new Date();
  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth() + 1);
  const [view, setView]             = useState<"month" | "list">("month");
  const [filterChildId, setFilter]  = useState<string | null>(null);
  const [selectedDate, setSelected] = useState<string | null>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  const filteredEvents = useMemo(() => {
    if (!filterChildId) return events;
    return events.filter((e) => e.childrenIds.includes(filterChildId));
  }, [events, filterChildId]);

  const monthEvents = useMemo(() =>
    filteredEvents.filter((e) => {
      const [y, m] = e.date.split("-").map(Number);
      return y === year && m === month;
    }),
    [filteredEvents, year, month]
  );

  const eventsByDate = useMemo(() => getEventsByDate(monthEvents), [monthEvents]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelected(dateStr);
  };

  return (
    <div className="flex min-h-screen bg-[#fff8f0]">
      <SidebarNav />

      <main className="flex-1 flex flex-col md:flex-row min-h-screen">
        {/* Left / Calendar panel */}
        <div className="flex-1 min-w-0 px-4 pt-6 pb-24 md:pb-8 md:px-6 md:max-w-xl lg:max-w-2xl space-y-4">
          <CalendarHeader
            year={year}
            month={month}
            view={view}
            filterChildId={filterChildId}
            familyChildren={children}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onViewChange={setView}
            onFilterChange={setFilter}
          />

          <div className="card">
            {view === "month" ? (
              <MonthView
                year={year}
                month={month}
                eventsByDate={eventsByDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            ) : (
              <ListView events={monthEvents} />
            )}
          </div>

          {/* Mobile: selected date events */}
          {view === "month" && selectedDate && (
            <div className="md:hidden space-y-1">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-gray-600">
                  日付の詳細
                </h3>
                <Link
                  href={`/events/new?date=${selectedDate}`}
                  className="text-xs text-warm-500 font-medium flex items-center gap-1"
                >
                  <Plus size={13} />
                  追加
                </Link>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-gray-400 text-sm">この日の思い出を記録しよう</p>
                  <Link
                    href={`/events/new?date=${selectedDate}`}
                    className="mt-3 inline-block btn-primary text-sm py-2 px-5"
                  >
                    記録する
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <div key={event.id} className="card hover:shadow-card-hover transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        {event.photos[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.photos[0].url}
                            alt={event.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{event.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">by {event.createdBy.displayName}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>❤️ {event.likeCount}</span>
                            <span>💬 {event.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right / Detail panel — PC only */}
        <div className="hidden md:block w-80 lg:w-96 shrink-0 border-l border-gray-100 px-5 pt-6 pb-8 overflow-y-auto">
          <div className="sticky top-6">
            <h2 className="text-sm font-bold text-gray-500 mb-4">日付の詳細（一覧）</h2>
            <DateDetailPanel
              dateStr={selectedDate}
              events={selectedEvents}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      </main>

      <BottomNav />

      {/* FAB — mobile */}
      <Link
        href="/events/new"
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 rounded-full bg-warm-500 text-white flex items-center justify-center shadow-lg hover:bg-warm-400 active:scale-95 transition-all z-40"
      >
        <Plus size={26} />
      </Link>
    </div>
  );
}
