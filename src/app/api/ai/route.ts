import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-lite";

function buildPrompt(feature: string, data: Record<string, unknown>): string {
  if (feature === "food-analysis") {
    const childName = data.childName as string;
    const events = (data.events as { date: string; title: string; diary?: string }[])
      .map((e) => `[${e.date}] ${e.title}${e.diary ? `\n  日記: ${e.diary}` : ""}`)
      .join("\n");
    return `あなたは家族の育児記録を分析する優しいアシスタントです。
以下は${childName}の食べ物に関するイベント記録です。
この記録を分析して、食の変化や好き嫌いの傾向をまとめてください。

【記録】
${events || "（記録なし）"}

以下の形式で日本語でレポートを作成してください：

## 🍽️ 食べられるようになったもの・好きなもの

## 🙅 苦手なもの・食べなかったもの

## 📈 最近の食の変化・気づき

## 💡 食事のアドバイス`;
  }

  if (feature === "growth-summary") {
    const childName = data.childName as string;
    const period = data.period as string;
    const events = (data.events as { date: string; category: string; title: string; diary?: string }[])
      .map((e) => `[${e.date}][${e.category}] ${e.title}${e.diary ? `\n  日記: ${e.diary}` : ""}`)
      .join("\n");
    return `あなたは家族の育児記録を分析する優しいアシスタントです。
以下は${childName}の${period}のイベント記録です。
この期間の成長をまとめた温かいレポートを作成してください。

【記録】
${events || "（記録なし）"}

以下の形式で日本語でレポートを作成してください：

## 🌱 ${period}の成長ポイント

## ✨ できるようになったこと

## 💝 印象的な思い出TOP3

## 🌟 ${childName}へのメッセージ`;
  }

  if (feature === "weekend-plan") {
    const childrenInfo = (data.children as { name: string; age: string }[])
      .map((c) => `・${c.name}（${c.age}）`)
      .join("\n");
    const recentEvents = (data.recentEvents as { date: string; category: string; title: string }[])
      .map((e) => `[${e.date}][${e.category}] ${e.title}`)
      .join("\n");
    const today = data.today as string;
    return `あなたは家族の週末プランを提案する楽しいアシスタントです。
以下の家族情報と最近の活動傾向をもとに、今週末の過ごし方を3つ提案してください。

【子供の情報】
${childrenInfo || "（未登録）"}

【最近1ヶ月の活動】
${recentEvents || "（記録なし）"}

【今日の日付】${today}

それぞれ以下の形式で提案してください（日本語で）：

### 🎉 プラン1: [タイトル]
**内容**:
**所要時間**:
**おすすめポイント**:
**必要な準備**:

### 🌿 プラン2: [タイトル]
**内容**:
**所要時間**:
**おすすめポイント**:
**必要な準備**:

### 🏠 プラン3: [タイトル]
**内容**:
**所要時間**:
**おすすめポイント**:
**必要な準備**: `;
  }

  return "不明な機能です。";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。Vercelの環境変数にGEMINI_API_KEYを設定してください。" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { feature, data } = body as { feature: string; data: Record<string, unknown> };

    const prompt = buildPrompt(feature, data);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text ?? "生成に失敗しました。";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "AI生成中にエラーが発生しました。しばらくしてから再試行してください。" },
      { status: 500 }
    );
  }
}
