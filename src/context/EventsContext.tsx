"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { MOCK_EVENTS } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import type { Event, Comment, Child, FamilyMember } from "@/types/app";

export const AVATAR_COLORS = [
  { value: "bg-pink-400",   label: "ピンク"   },
  { value: "bg-blue-400",   label: "ブルー"   },
  { value: "bg-green-400",  label: "グリーン" },
  { value: "bg-yellow-400", label: "イエロー" },
  { value: "bg-purple-400", label: "パープル" },
  { value: "bg-orange-400", label: "オレンジ" },
];

const GUEST_USER: FamilyMember = {
  id: "guest",
  name: "ゲスト",
  displayName: "ゲスト",
  role: "parent",
};

interface EventsContextValue {
  events: Event[];
  children: Child[];
  addEvent: (event: Omit<Event, "id" | "likeCount" | "commentCount" | "likedByMe" | "comments" | "createdBy">) => void;
  addComment: (eventId: string, text: string) => void;
  toggleLike: (eventId: string) => void;
  addChild: (name: string, birthday: string, avatarColor: string) => void;
  removeChild: (id: string) => void;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children: providerChildren }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents]     = useState<Event[]>(MOCK_EVENTS);
  const [children, setChildren] = useState<Child[]>([]);

  const currentUser: FamilyMember = user
    ? { id: user.id, name: user.name, displayName: user.displayName, role: user.role }
    : GUEST_USER;

  const addEvent = (data: Omit<Event, "id" | "likeCount" | "commentCount" | "likedByMe" | "comments" | "createdBy">) => {
    const newEvent: Event = {
      ...data,
      id: `evt-${Date.now()}`,
      createdBy: currentUser,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      comments: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const addComment = (eventId: string, text: string) => {
    const comment: Comment = {
      id: `c-${Date.now()}`,
      eventId,
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, comments: [...e.comments, comment], commentCount: e.commentCount + 1 }
          : e
      )
    );
  };

  const toggleLike = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          likedByMe: !e.likedByMe,
          likeCount: e.likedByMe ? e.likeCount - 1 : e.likeCount + 1,
        };
      })
    );
  };

  const addChild = (name: string, birthday: string, avatarColor: string) => {
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: name.trim(),
      birthday: birthday || undefined,
      avatarColor,
    };
    setChildren((prev) => [...prev, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, children, addEvent, addComment, toggleLike, addChild, removeChild }}>
      {providerChildren}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
