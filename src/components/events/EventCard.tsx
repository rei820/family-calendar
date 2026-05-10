"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Heart, Edit, Trash2 } from "lucide-react";
import type { Event } from "@/types/app";
import { CATEGORIES } from "@/constants/categories";
import { useEvents } from "@/context/EventsContext";
import CommentSection from "./CommentSection";

interface Props {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: Props) {
  const { toggleLike, children: familyChildren, deleteEvent } = useEvents();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 -mr-1 shrink-0 ml-2 p-1"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/events/edit/${event.id}`);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit size={16} />
                編集
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          )}
        </div>
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

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <h3 className="font-bold text-gray-800">このイベントを削除しますか？</h3>
            <p className="text-sm text-gray-600">削除したイベントは復元できません</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await deleteEvent(event.id);
                  setConfirmDelete(false);
                  setMenuOpen(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
