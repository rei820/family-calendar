"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/app";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, signup } = useAuth();
  const [tab, setTab] = useState<Tab>("login");

  // login form
  const [loginName,     setLoginName]     = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError,    setLoginError]    = useState<string | null>(null);

  // signup form
  const [signupName,        setSignupName]        = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [signupRole,        setSignupRole]        = useState<Role>("parent");
  const [signupPassword,    setSignupPassword]    = useState("");
  const [signupError,       setSignupError]       = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/calendar");
  }, [loading, user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(loginName.trim(), loginPassword);
    if (err) { setLoginError(err); return; }
    router.replace("/calendar");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim())        { setSignupError("お名前を入力してください"); return; }
    if (!signupDisplayName.trim()) { setSignupError("表示名を入力してください"); return; }
    if (signupPassword.length < 6) { setSignupError("パスワードは6文字以上で入力してください"); return; }
    const err = signup(signupName.trim(), signupDisplayName.trim(), signupRole, signupPassword);
    if (err) { setSignupError(err); return; }
    router.replace("/calendar");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fff8f0]">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f0] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-4xl">🌱</span>
        <div>
          <p className="text-xs text-gray-400 leading-none">家族成長</p>
          <p className="text-2xl font-bold text-gray-800 leading-tight">カレンダー</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-6">
        {/* Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setTab("login"); setLoginError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === "login" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setTab("signup"); setSignupError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === "signup" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            新規登録
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">名前</label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => { setLoginName(e.target.value); setLoginError(null); }}
                placeholder="登録した名前を入力"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">パスワード</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => { setLoginPassword(e.target.value); setLoginError(null); }}
                placeholder="パスワードを入力"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              />
            </div>
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button type="submit" className="w-full btn-primary text-base py-3">
              ログイン
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">お名前</label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => { setSignupName(e.target.value); setSignupError(null); }}
                placeholder="田中 太郎"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">表示名</label>
              <input
                type="text"
                required
                value={signupDisplayName}
                onChange={(e) => { setSignupDisplayName(e.target.value); setSignupError(null); }}
                placeholder="パパ / ママ / おじいちゃん など"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">役割</label>
              <div className="flex gap-3">
                {(["parent", "grandparent"] as Role[]).map((r) => (
                  <label
                    key={r}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-sm font-medium cursor-pointer transition-all ${
                      signupRole === r
                        ? "border-warm-400 bg-warm-50 text-warm-500"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={signupRole === r}
                      onChange={() => setSignupRole(r)}
                      className="sr-only"
                    />
                    {r === "parent" ? "👨‍👩‍👧 親" : "👴 祖父母"}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                パスワード <span className="font-normal text-gray-400">（6文字以上）</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={signupPassword}
                onChange={(e) => { setSignupPassword(e.target.value); setSignupError(null); }}
                placeholder="パスワードを入力"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
              />
            </div>
            {signupError && <p className="text-xs text-red-400">{signupError}</p>}
            <button type="submit" className="w-full btn-primary text-base py-3">
              登録してはじめる
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        データはこのブラウザにのみ保存されます
      </p>
    </div>
  );
}
