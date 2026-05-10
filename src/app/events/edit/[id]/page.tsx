"use client";
import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { X, Check } from "lucide-react";
import CategoryPicker from "@/components/events/CategoryPicker";
import ChildTargetPicker from "@/components/events/ChildTargetPicker";
import VisibilityPicker from "@/components/events/VisibilityPicker";
import PhotoUploader, { type PhotoPreview } from "@/components/events/PhotoUploader";
import { useEvents } from "@/context/EventsContext";
import { useAuth } from "@/context/AuthContext";
import type { Category, FamilyMember, Visibility, EventPhoto } from "@/types/app";

function EditEventForm() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { events, updateEvent, children: familyChildren } = useEvents();
  const { user } = useAuth();

  // イベントを取得
  const event = events.find((e) => e.id === eventId);

  const [category, setCategory] = useState<Category>(event?.category ?? "memory");
  const [childrenIds, setChildrenIds] = useState<string[]>(event?.childrenIds ?? []);
  const [date, setDate] = useState(event?.date ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const [diary, setDiary] = useState(event?.diary ?? "");
  const [visibility, setVisibility] = useState<Visibility>(event?.visibility ?? "all");
  const [photos, setPhotos] = useState<(PhotoPreview | EventPhoto)[]>(event?.photos ?? []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "タイトルを入力してください";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);

    await updateEvent(eventId, {
      date,
      category,
      title: title.trim(),
      diary: diary.trim() || undefined,
      visibility,
      childrenIds,
      createdBy: event!.createdBy,
      photos: photos.map((p, i) =>
        "url" in p && "id" in p
          ? (p as EventPhoto)
          : { id: `new-photo-${i}`, url: (p as PhotoPreview).url }
      ),
    });

    router.push("/calendar");
  };

  const handleCancel = () => router.back();

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center">
        <p className="text-gray-500">イベントが見つかりません</p>
      </div>
    );
  }

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
          <h1 className="font-bold text-gray-800">イベントを編集</h1>
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
          <label className="block text-xs font-semibold text-gray-500 mb-3">
            カテゴリ
          </label>
          <CategoryPicker value={category} onChange={setCategory} />
        </section>

        {/* Children target */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-3">
            対象
          </label>
          <ChildTargetPicker
            selectedIds={childrenIds}
            onChange={setChildrenIds}
            familyChildren={familyChildren}
          />
        </section>

        {/* Date */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
          />
        </section>

        {/* Title */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: "" })); }}
            placeholder="例）公園でたくさん遊んだよ"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-warm-100 transition-all ${
              errors.title ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-warm-400"
            }`}
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
        </section>

        {/* Photos */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-3">
            写真（任意）
          </label>
          <PhotoUploader
            value={photos as PhotoPreview[]}
            onChange={setPhotos}
          />
        </section>

        {/* Diary */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            日記（任意）
          </label>
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="この日の思い出や子供の様子を記録..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all resize-none"
          />
        </section>

        {/* Visibility */}
        <section>
          <label className="block text-xs font-semibold text-gray-500 mb-3">
            公開範囲
          </label>
          <VisibilityPicker value={visibility} onChange={setVisibility} />
        </section>
      </main>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      }
    >
      <EditEventForm />
    </Suspense>
  );
}
