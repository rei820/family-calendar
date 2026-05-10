"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X, Check } from "lucide-react";
import CategoryPicker from "@/components/events/CategoryPicker";
import ChildTargetPicker from "@/components/events/ChildTargetPicker";
import VisibilityPicker from "@/components/events/VisibilityPicker";
import PhotoUploader, { type PhotoPreview } from "@/components/events/PhotoUploader";
import { useEvents } from "@/context/EventsContext";
import { useAuth } from "@/context/AuthContext";
import type { Category, FamilyMember, Visibility } from "@/types/app";

const GUEST_AUTHOR: FamilyMember = {
  id: "guest",
  name: "ゲスト",
  displayName: "ゲスト",
  role: "parent",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NewEventForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { addEvent, children: familyChildren } = useEvents();
  const { user } = useAuth();

  const [category,    setCategory]    = useState<Category>("memory");
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [date,        setDate]        = useState(searchParams.get("date") ?? todayStr());
  const [title,       setTitle]       = useState("");
  const [diary,       setDiary]       = useState("");
  const [visibility,  setVisibility]  = useState<Visibility>("all");
  const [photos,      setPhotos]      = useState<PhotoPreview[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "タイトルを入力してください";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    const author: FamilyMember = user
      ? { id: user.id, name: user.name, displayName: user.displayName, role: user.role }
      : GUEST_AUTHOR;
    addEvent({
      date,
      category,
      title: title.trim(),
      diary: diary.trim() || undefined,
      visibility,
      childrenIds,
      createdBy: author,
      photos: photos.map((p, i) => ({ id: `new-photo-${i}`, url: p.url })),
    });
    router.push("/calendar");
  };

  const handleCancel = () => router.back();

  return (
    <div className="min-h-screen bg-[#fff8f0] flex flex-col">
      {/* Fixed header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            <X size={18} />
            キャンセル
          </button>
          <h1 className="font-bold text-gray-800">新しいイベント</h1>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-warm-500 text-white text-sm font-semibold px-4 py-1.5 rounded-xl disabled:opacity-50 hover:bg-warm-400 active:scale-95 transition-all"
          >
            <Check size={15} />
            保存
          </button>
        </div>
      </header>

      {/* Scrollable form body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6 pb-10">

        {/* Category */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-3">カテゴリ</label>
          <CategoryPicker value={category} onChange={setCategory} />
        </section>

        {/* Target children */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-3">対象</label>
          {familyChildren.length === 0 ? (
            <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
              子供が登録されていません。<Link href="/family" className="text-warm-500 underline">家族ページ</Link>から追加してください。
            </p>
          ) : (
            <ChildTargetPicker
              familyChildren={familyChildren}
              selectedIds={childrenIds}
              onChange={setChildrenIds}
            />
          )}
        </section>

        {/* Date */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-2">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all bg-white"
          />
        </section>

        {/* Title */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-2">
            タイトル <span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: "" })); }}
            placeholder="例）公園でたくさん遊んだよ"
            className={`w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-warm-100 transition-all bg-white ${
              errors.title ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-warm-400"
            }`}
          />
          {errors.title && <p className="text-xs text-red-400 mt-1 ml-1">{errors.title}</p>}
        </section>

        {/* Photos */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-2">写真</label>
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </section>

        {/* Diary */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-2">
            日記 <span className="text-gray-400 text-xs font-normal ml-1">（任意）</span>
          </label>
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="今日のことを記録しましょう…"
            rows={4}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all bg-white resize-none leading-relaxed"
          />
        </section>

        {/* Visibility */}
        <section>
          <label className="block text-sm font-bold text-gray-600 mb-3">公開範囲</label>
          <VisibilityPicker value={visibility} onChange={setVisibility} />
        </section>

        {/* Save button (bottom) */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary text-base py-4 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </main>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">読み込み中...</p></div>}>
      <NewEventForm />
    </Suspense>
  );
}
