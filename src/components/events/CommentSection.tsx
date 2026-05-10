"use client";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { useEvents } from "@/context/EventsContext";
import { useAuth } from "@/context/AuthContext";
import type { Comment, FamilyMember } from "@/types/app";

const GUEST_AUTHOR: FamilyMember = {
  id: "guest",
  name: "ゲスト",
  displayName: "ゲスト",
  role: "parent",
};

interface Props {
  eventId: string;
  comments: Comment[];
  commentCount: number;
}

function timeAgo(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

export default function CommentSection({ eventId, comments, commentCount }: Props) {
  const { addComment } = useEvents();
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const author: FamilyMember = user
      ? { id: user.id, name: user.name, displayName: user.displayName, role: user.role }
      : GUEST_AUTHOR;
    addComment(eventId, trimmed, author);
    setText("");
    setSending(false);
  };

  return (
    <div>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
      >
        <span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
        <span>
          {commentCount === 0
            ? "コメントする"
            : open
            ? "閉じる"
            : `コメントを見る（${commentCount}）`}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Comment list */}
          {comments.length > 0 && (
            <div className="space-y-3 border-t border-gray-50 pt-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-warm-100 flex items-center justify-center text-xs font-bold text-warm-600 shrink-0">
                    {c.author.displayName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-gray-700">{c.author.displayName}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="コメントする..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all placeholder:text-gray-300"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-xl bg-warm-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-warm-400 active:scale-95 transition-all shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
