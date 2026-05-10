"use client";
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import SidebarNav from "@/components/layout/SidebarNav";
import { useEvents } from "@/context/EventsContext";
import { Clock } from "lucide-react";
import type { ChildRecordHistory } from "@/types/app";

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RecordPage() {
  const { children, records, saveChildRecord, getRecordHistory } = useEvents();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length > 0 ? children[0].id : null
  );
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [allergies, setAllergies] = useState("");
  const [interests, setInterests] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<ChildRecordHistory[]>([]);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const selectedRecord = records.find((r) => r.childId === selectedChildId);

  // 選択子供が変わった時に、その子供の記録を読み込む
  useEffect(() => {
    if (!selectedChildId) return;
    const record = records.find((r) => r.childId === selectedChildId);
    if (record) {
      setLikes(record.likes || "");
      setDislikes(record.dislikes || "");
      setAllergies(record.allergies || "");
      setInterests(record.interests || "");
    } else {
      setLikes("");
      setDislikes("");
      setAllergies("");
      setInterests("");
    }
  }, [selectedChildId, records]);

  // 履歴読み込み
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedRecord) {
        setHistory([]);
        return;
      }
      const h = await getRecordHistory(selectedRecord.id);
      setHistory(h);
    };
    loadHistory();
  }, [selectedRecord, getRecordHistory]);

  const handleSave = async () => {
    if (!selectedChildId) return;
    setSaving(true);
    await saveChildRecord(selectedChildId, {
      childId: selectedChildId,
      likes: likes || undefined,
      dislikes: dislikes || undefined,
      allergies: allergies || undefined,
      interests: interests || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fff8f0]">
      <SidebarNav />

      <main className="flex-1 px-4 pt-6 pb-28 md:pb-8 md:px-8 max-w-2xl mx-auto w-full space-y-6">
        <h1 className="text-xl font-bold text-gray-800">記録</h1>

        {children.length === 0 ? (
          <div className="card py-8 text-center text-gray-500">
            <p>記録する子供を「家族」で登録してください</p>
          </div>
        ) : (
          <>
            {/* 子供選択 */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                子供選択
              </label>
              <select
                value={selectedChildId || ""}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </section>

            {selectedChild && (
              <>
                {/* 情報編集フォーム */}
                <section className="card space-y-4">
                  <h2 className="font-bold text-gray-800">📝 情報を記録</h2>

                  {/* 好きな食べ物 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      好きな食べ物
                    </label>
                    <input
                      type="text"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      placeholder="例）いちご、バナナ、パン"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                    />
                  </div>

                  {/* 苦手な食べ物 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      苦手な食べ物
                    </label>
                    <input
                      type="text"
                      value={dislikes}
                      onChange={(e) => setDislikes(e.target.value)}
                      placeholder="例）にんじん、トマト"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                    />
                  </div>

                  {/* アレルギー */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      アレルギー
                    </label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="例）卵、牛乳、エビ"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                    />
                  </div>

                  {/* 趣味・興味 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      趣味・興味
                    </label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="例）お絵かき、ブロック、砂場遊び"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                </section>

                {/* 更新履歴 */}
                {selectedRecord && (
                  <section className="space-y-3">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <Clock size={18} />
                      📅 更新履歴
                    </h2>

                    {history.length === 0 ? (
                      <div className="card text-center py-6 text-gray-400 text-sm">
                        更新履歴がありません
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((entry) => (
                          <div key={entry.id} className="card p-4">
                            <p className="text-xs font-semibold text-warm-600 mb-3">
                              {formatDate(entry.changedAt)}
                            </p>
                            <div className="space-y-2 text-sm">
                              {entry.likes && (
                                <div>
                                  <span className="font-semibold text-gray-700">好きな食べ物:</span>
                                  <p className="text-gray-600 ml-2">{entry.likes}</p>
                                </div>
                              )}
                              {entry.dislikes && (
                                <div>
                                  <span className="font-semibold text-gray-700">苦手な食べ物:</span>
                                  <p className="text-gray-600 ml-2">{entry.dislikes}</p>
                                </div>
                              )}
                              {entry.allergies && (
                                <div>
                                  <span className="font-semibold text-gray-700">アレルギー:</span>
                                  <p className="text-gray-600 ml-2">{entry.allergies}</p>
                                </div>
                              )}
                              {entry.interests && (
                                <div>
                                  <span className="font-semibold text-gray-700">趣味・興味:</span>
                                  <p className="text-gray-600 ml-2">{entry.interests}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
