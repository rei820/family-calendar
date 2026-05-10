import type { Event } from "@/types/app";

export const MOCK_EVENTS: Event[] = [];

export function getEventsByDate(events: Event[]): Record<string, Event[]> {
  return events.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});
}
