"use client";
import { useState } from "react";
import { Sparkles, Utensils, TrendingUp, CalendarDays, Loader2 } from "lucide-react";
import SidebarNav from "@/components/layout/SidebarNav";
import BottomNav from "@/components/layout/BottomNav";
import { useEvents } from "@/context/EventsContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type Feature = "food-analysis" | "growth-summary" | "weekend-plan";

function calcAge(birthday?: string): string {
  if (!birthday) return "年齢不明";
  const birth = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear()
    - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return `${age}歳`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function ResultCard({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="mt-4 bg-warm-50 rounded-2xl px-5 py-4 text-sm text-gray-700 leading-relaxed space-y-1 border border-warm-100">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return <p key={i} className="font-bold text-warm-600 mt-3 text-base">{line.replace("## ", "")}</p>;
        }
        if (line.startsWith("### ")) {
          return <p key={i} className="font-bold text-gray-800 mt-4 text-base">{line.replace("### ", "")}</p>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold text-gray-700 mt-1">{line.replaceAll("**", "")}</p>;
        }
        if (line.match(/^\*\*.*\*\*:/)) {
          const [label, ...rest] = line.split(":");
          return (
            <p key={i} className="mt-1">
              <span className="font-semibold text-gray-700">{label.replaceAll("**", "")}:</span>
              {rest.join(":")}
            </p>
          );
        }
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function AiPage() {
  const { loading }          = useAuthGuard();
  const { events, children } = useEvents();

  const [activeFeature, setActiveFeature] = useState<Feature>("weekend-plan");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [period, setPeriod]   = useState<"month" | "year">("month");
  const [year, setYear]       = useState(new Date().getFullYear());
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [result, setResult]   = useState<Record<Feature, string>>({
    "food-analysis": "",
    "growth-summary": "",
    "weekend-plan": "",
  });
  const [generating, setGenerating] = useState<Feature | null>(null);
  const [error, setError]     = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fff8f0]">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const callAI = async (feature: Feature, data: Record<string, unknown>) => {
    setGenerating(feature);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, data }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "エラーが発生しました");
      setResult((prev) => ({ ...prev, [feature]: json.text }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGenerating(null);
    }
  };

  const handleFoodAnalysis = () => {
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) { setError("子供を選択してください"); return; }
    const foodEvents = events.filter(
      (e) => e.category === "food" && e.childrenIds.includes(selectedChildId)
    );
    callAI("food-analysis", {
      childName: child.name,
      events: foodEvents.map((e) => ({ date: e.date, title: e.title, diary: e.diary })),
    });
  };

  const handleGrowthSummary = () => {
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) { setError("子供を選択してください"); return; }
    const filtered = events.filter((e) => {
      const [y, m] = e.date.split("-").map(Number);
      if (period === "year") return y === year && e.childrenIds.includes(selectedChildId);
      return y === year && m === month && e.childrenIds.includes(selectedChildId);
    });
    const label = period === "year" ? `${year}年` : `${year}年${month}月`;
    callAI("growth-summary", {
      childName: child.name,
      period: label,
      events: filtered.map((e) => ({ date: e.date, category: e.category, title: e.title, diary: e.diary })),
    });
  };

  const handleWeekendPlan = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEvents = events.filter((e) => new Date(e.date) >= thirtyDaysAgo);
    callAI("weekend-plan", {
      children: children.map((c) => ({ name: c.name, age: calcAge(c.birthday) })),
      recentEvents: recentEvents.map((e) => ({ date: e.date, category: e.category, title: e.title })),
      today: todayStr(),
    });
  };

  const FEATURES: { id: Feature; icon: React.ReactNode; label: string; color: string }[] = [
    { id: "weekend-plan",   icon: <CalendarDays size={18} />, label: "週末プラン",   color: "text-blue-500"   },
    { id: "food-analysis",  icon: <Utensils size={18} />,     label: "食の分析",     color: "text-green-500"  },
    { id: "growth-summary", icon: <TrendingUp size={18} />,   label: "成長サマリー", color: "text-purple-500" },
  ];

  const currentResult = result[activeFeature];
  const isGenerating  = generating === activeFeature;

  return (
    <div className="flex min-h-screen bg-[#fff8f0]">
      <SidebarNav />

      <main className="flex-1 px-4 pt-6 pb-28 md:pb-8 md:px-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={22} className="text-warm-500" />
          <h1 className="text-xl font-bold text-gray-800">AI アシスタント</h1>
        </div>

        {/* Feature tabs */}
        <div className="flex gap-2 mb-6">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setActiveFeature(f.id); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium transition-all border ${
                activeFeature === f.id
                  ? "bg-white border-warm-300 text-warm-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:bg-white/60"
              }`}
            >
              <span className={activeFeature === f.id ? f.color : ""}>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── 週末プラン ── */}
        {activeFeature === "weekend-plan" && (
          <div className="card space-y-4">
            <div>
              <h2 className="font-bold text-gray-800 mb-1">🗓️ 週末の過ごし方を提案</h2>
              <p className="text-sm text-gray-400">登録された子供の情報と最近の活動傾向をもとにAIがプランを3案提案します。</p>
            </div>
            {children.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                子供が未登録です。家族ページから先に登録してください。
              </p>
            )}
            <button
              type="button"
              onClick={handleWeekendPlan}
              disabled={isGenerating || children.length === 0}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <><Loader2 size={16} className="animate-spin" />生成中...</> : <><Sparkles size={16} />プランを提案してもらう</>}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {currentResult && <ResultCard text={currentResult} />}
          </div>
        )}

        {/* ── 食の分析 ── */}
        {activeFeature === "food-analysis" && (
          <div className="card space-y-4">
            <div>
              <h2 className="font-bold text-gray-800 mb-1">🍽️ 食の変化・好き嫌い分析</h2>
              <p className="text-sm text-gray-400">食べ物カテゴリのイベントからAIが食の傾向をまとめます。</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">対象の子供</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 bg-white"
              >
                <option value="">選択してください</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleFoodAnalysis}
              disabled={isGenerating || !selectedChildId}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <><Loader2 size={16} className="animate-spin" />分析中...</> : <><Sparkles size={16} />食の変化を分析する</>}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {currentResult && <ResultCard text={currentResult} />}
          </div>
        )}

        {/* ── 成長サマリー ── */}
        {activeFeature === "growth-summary" && (
          <div className="card space-y-4">
            <div>
              <h2 className="font-bold text-gray-800 mb-1">📈 成長サマリー生成</h2>
              <p className="text-sm text-gray-400">指定した期間のイベントからAIが成長レポートを作成します。</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">対象の子供</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 bg-white"
              >
                <option value="">選択してください</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">期間</label>
              <div className="flex gap-2 mb-3">
                {(["month", "year"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      period === p ? "bg-warm-50 border-warm-400 text-warm-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {p === "month" ? "月次" : "年次"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="flex-1 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 bg-white"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
                {period === "month" && (
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="flex-1 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-warm-400 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m}月</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleGrowthSummary}
              disabled={isGenerating || !selectedChildId}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <><Loader2 size={16} className="animate-spin" />生成中...</> : <><Sparkles size={16} />成長レポートを生成する</>}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {currentResult && <ResultCard text={currentResult} />}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
