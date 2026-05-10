"use client";
import { useState } from "react";
import { Plus, Trash2, Baby, ChevronUp } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import SidebarNav from "@/components/layout/SidebarNav";
import { useEvents, AVATAR_COLORS } from "@/context/EventsContext";

function formatBirthday(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日生まれ`;
}

function calcAge(birthday: string): string {
  if (!birthday) return "";
  const birth = new Date(birthday + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 1) {
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return `${months}ヶ月`;
  }
  return `${age}歳`;
}

export default function FamilyPage() {
  const { children: registeredChildren, addChild, removeChild } = useEvents();

  const [showForm,   setShowForm]   = useState(false);
  const [name,       setName]       = useState("");
  const [birthday,   setBirthday]   = useState("");
  const [color,      setColor]      = useState(AVATAR_COLORS[0].value);
  const [nameError,  setNameError]  = useState("");
  const [confirmId,  setConfirmId]  = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) {
      setNameError("名前を入力してください");
      return;
    }
    addChild(name, birthday, color);
    setName("");
    setBirthday("");
    setColor(AVATAR_COLORS[0].value);
    setNameError("");
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    if (confirmId === id) {
      removeChild(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fff8f0]">
      <SidebarNav />

      <main className="flex-1 px-4 pt-6 pb-28 md:pb-8 md:px-8 max-w-lg mx-auto w-full space-y-6">
        <h1 className="text-xl font-bold text-gray-800">家族管理</h1>

        {/* ── 子供の情報 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-600">子供の情報</h2>
            <button
              onClick={() => { setShowForm((v) => !v); setNameError(""); }}
              className="flex items-center gap-1 text-sm text-warm-500 font-medium bg-warm-50 px-3 py-1.5 rounded-xl hover:bg-warm-100 transition-colors"
            >
              {showForm ? <ChevronUp size={14} /> : <Plus size={14} />}
              {showForm ? "閉じる" : "子供を追加"}
            </button>
          </div>

          {/* 登録フォーム */}
          {showForm && (
            <div className="card mb-4 space-y-4 border-2 border-warm-100">
              <h3 className="font-bold text-gray-700 text-sm">子供を登録</h3>

              {/* 名前 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  名前 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="例）ゆい、そうた"
                  autoFocus
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-warm-100 transition-all ${
                    nameError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-warm-400"
                  }`}
                />
                {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
              </div>

              {/* 誕生日 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  誕生日 <span className="text-gray-400 font-normal">（任意）</span>
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                />
              </div>

              {/* アバターカラー */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  アバターカラー
                </label>
                <div className="flex gap-3 flex-wrap">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.label}
                      className={`w-10 h-10 rounded-full ${c.value} transition-all ${
                        color === c.value
                          ? "ring-2 ring-offset-2 ring-warm-400 scale-110"
                          : "opacity-50 hover:opacity-80 hover:scale-105"
                      }`}
                    />
                  ))}
                </div>

                {/* プレビュー */}
                {name.trim() && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-xl">
                    <div
                      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-base shrink-0`}
                    >
                      {name.trim()[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{name.trim()}</span>
                    {birthday && (
                      <span className="text-xs text-gray-400 ml-auto">{calcAge(birthday)}</span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleAdd}
                className="w-full btn-primary py-3 text-base"
              >
                登録する
              </button>
            </div>
          )}

          {/* 子供一覧 */}
          {registeredChildren.length === 0 ? (
            <div className="card flex flex-col items-center py-12 text-center">
              <Baby size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">子供が登録されていません</p>
              <p className="text-gray-400 text-xs mt-1">上の「子供を追加」ボタンから登録してください</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 btn-primary text-sm py-2 px-6"
                >
                  今すぐ追加する
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {registeredChildren.map((child) => (
                <div key={child.id} className="card flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${child.avatarColor} flex items-center justify-center text-white text-lg font-bold shrink-0`}
                  >
                    {child.name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{child.name}</p>
                    {child.birthday && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatBirthday(child.birthday)}
                        <span className="ml-2 font-semibold text-warm-500">
                          {calcAge(child.birthday)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {confirmId === child.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleRemove(child.id)}
                          className="text-xs text-white bg-red-400 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          削除する
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(child.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 家族メンバー ── */}
        <section>
          <h2 className="text-sm font-bold text-gray-600 mb-3">家族メンバー</h2>
          <div className="card text-center py-8 text-gray-400 text-sm">
            招待機能は今後実装予定です
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
