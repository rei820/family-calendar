"use client";
import { MoreHorizontal, Heart } from "lucide-react";
import type { Event } from "@/types/app";
import { CATEGORIES } from "@/constants/categories";
import { useEvents } from "@/context/EventsContext";
import CommentSection from "./CommentSection";

interface Props {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: Props) {
  const { toggleLike, children: familyChildren } = useEvents();
  const cat = CATEGORIES[event.category];

  // Resolve child objects for display
  const targetChildren = familyChildren.filter((c) => event.childrenIds.includes(c.id));

  return (
    <article className="card hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={`category-badge ${cat.bgColor} ${cat.textColor}`}>
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>
          {/* Child chips */}
          {targetChildren.map((child) => (
            <span
              key={child.id}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${child.avatarColor} text-white`}
            >
              {child.name}
            </span>
          ))}
        </div>
        <button className="text-gray-400 hover:text-gray-600 -mr-1 shrink-0 ml-2">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Title + poster */}
      <h3 className="font-bold text-gray-800 text-base leading-snug mb-0.5">{event.title}</h3>
      <p className="text-xs text-gray-400 mb-3">by {event.createdBy.displayName}</p>

      {/* Photos */}
      {event.photos.length > 0 && (
        <div
          className={`grid gap-1.5 mb-3 ${
            event.photos.length === 1
              ? "grid-cols-1"
              : event.photos.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {event.photos.slice(0, compact ? 3 : 6).map((photo, i) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`写真 ${i + 1}`} className="w-full h-full object-cover" />
              {compact && i === 2 && event.photos.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                  <span className="text-white font-bold text-lg">+{event.photos.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Diary */}
      {event.diary && !compact && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{event.diary}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
        <button
          onClick={() => toggleLike(event.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            event.likedByMe ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
          }`}
        >
          <Heart size={17} fill={event.likedByMe ? "currentColor" : "none"} />
          <span>{event.likeCount}</span>
        </button>

        <CommentSection
          eventId={event.id}
          comments={event.comments}
          commentCount={event.commentCount}
        />
      </div>
    </article>
  );
}
