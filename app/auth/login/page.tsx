"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      // 로그인
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      // 회원가입
      if (!inviteCode.trim()) {
        setError("초대코드를 입력해주세요.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "가입에 실패했습니다.");
        setLoading(false);
        return;
      }

      // 가입 성공 → 바로 로그인
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("가입은 되었지만 로그인에 실패했습니다. 다시 시도해주세요.");
      } else {
        router.push("/");
        router.refresh();
      }

      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            비밀클럽
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            {mode === "login"
              ? "초대받은 사람만 들어올 수 있습니다"
              : "초대코드를 입력하고 가입하세요"}
          </p>
        </div>

        {/* 탭 */}
        <div className="flex mb-8 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              mode === "login"
                ? "text-white border-b-2 border-white"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              mode === "register"
                ? "text-white border-b-2 border-white"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            가입하기
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-400 mb-1.5"
            >
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-400 mb-1.5"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          {/* 초대코드 - 가입 모드에서만 표시 */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="inviteCode"
                className="block text-sm font-medium text-zinc-400 mb-1.5"
              >
                초대코드
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="초대코드를 입력하세요"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : mode === "login" ? "들어가기" : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
