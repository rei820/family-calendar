"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Event, Comment, Child, FamilyMember, Category, Visibility } from "@/types/app";

export const AVATAR_COLORS = [
  { value: "bg-pink-400",   label: "ピンク"   },
  { value: "bg-blue-400",   label: "ブルー"   },
  { value: "bg-green-400",  label: "グリーン" },
  { value: "bg-yellow-400", label: "イエロー" },
  { value: "bg-purple-400", label: "パープル" },
  { value: "bg-orange-400", label: "オレンジ" },
];

type NewEventData = Omit<Event, "id" | "likeCount" | "commentCount" | "likedByMe" | "comments">;

interface EventsContextValue {
  events: Event[];
  children: Child[];
  dataLoading: boolean;
  addEvent: (event: NewEventData) => Promise<void>;
  addComment: (eventId: string, text: string, author: FamilyMember) => Promise<void>;
  toggleLike: (eventId: string) => Promise<void>;
  addChild: (name: string, birthday: string, avatarColor: string) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEvent(row: any): Event {
  return {
    id: row.id,
    date: row.date,
    category: row.category as Category,
    title: row.title,
    diary: row.diary ?? undefined,
    visibility: row.visibility as Visibility,
    childrenIds: row.children_ids ?? [],
    createdBy: row.created_by ?? { id: "", name: "", displayName: "", role: "parent" },
    photos: row.photos ?? [],
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    likedByMe: row.liked_by_me ?? false,
    comments: row.comments ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToChild(row: any): Child {
  return {
    id: row.id,
    name: row.name,
    birthday: row.birthday ?? undefined,
    avatarColor: row.avatar_color,
  };
}

export function EventsProvider({ children: providerChildren }: { children: ReactNode }) {
  const { user }   = useAuth();
  const [events,   setEvents]      = useState<Event[]>([]);
  const [children, setChildren]    = useState<Child[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Supabase からデータ読み込み（ユーザーが変わるたびに再取得）
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setChildren([]);
      return;
    }
    const load = async () => {
      setDataLoading(true);
      const [evRes, chRes] = await Promise.all([
        supabase.from("events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("children").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (evRes.data) setEvents(evRes.data.map(rowToEvent));
      if (chRes.data) setChildren(chRes.data.map(rowToChild));
      setDataLoading(false);
    };
    load();
  }, [user?.id]);

  const addEvent = async (data: NewEventData) => {
    const newEvent: Event = {
      ...data,
      id: `evt-${Date.now()}`,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      comments: [],
    };
    setEvents((prev) => [newEvent, ...prev]); // 楽観的更新
    await supabase.from("events").insert({
      id: newEvent.id,
      user_id: user?.id ?? "guest",
      date: newEvent.date,
      category: newEvent.category,
      title: newEvent.title,
      diary: newEvent.diary ?? null,
      visibility: newEvent.visibility,
      children_ids: newEvent.childrenIds,
      created_by: newEvent.createdBy,
      photos: newEvent.photos,
      like_count: 0,
      comment_count: 0,
      liked_by_me: false,
      comments: [],
    });
  };

  const addComment = async (eventId: string, text: string, author: FamilyMember) => {
    const comment: Comment = {
      id: `c-${Date.now()}`,
      eventId,
      author,
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
    // DBから最新のコメント配列を取得してから更新
    const { data } = await supabase.from("events").select("comments, comment_count").eq("id", eventId).single();
    if (data) {
      await supabase.from("events").update({
        comments: [...(data.comments as Comment[]), comment],
        comment_count: (data.comment_count as number) + 1,
      }).eq("id", eventId);
    }
  };

  const toggleLike = async (eventId: string) => {
    let newLikedByMe = false;
    let newLikeCount = 0;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        newLikedByMe = !e.likedByMe;
        newLikeCount = e.likedByMe ? e.likeCount - 1 : e.likeCount + 1;
        return { ...e, likedByMe: newLikedByMe, likeCount: newLikeCount };
      })
    );
    await supabase.from("events").update({
      liked_by_me: newLikedByMe,
      like_count: newLikeCount,
    }).eq("id", eventId);
  };

  const addChild = async (name: string, birthday: string, avatarColor: string) => {
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: name.trim(),
      birthday: birthday || undefined,
      avatarColor,
    };
    setChildren((prev) => [...prev, newChild]);
    await supabase.from("children").insert({
      id: newChild.id,
      user_id: user?.id ?? "guest",
      name: newChild.name,
      birthday: newChild.birthday ?? null,
      avatar_color: newChild.avatarColor,
    });
  };

  const removeChild = async (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("children").delete().eq("id", id);
  };

  return (
    <EventsContext.Provider value={{
      events, children, dataLoading,
      addEvent, addComment, toggleLike, addChild, removeChild,
    }}>
      {providerChildren}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
