"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const callbackUrl = "/dashboard";

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      loginId,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("로그인 실패: ID/PW를 확인해주세요.");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="container" style={{ maxWidth: 460 }}>
      <div className="card">
        <h1>관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="grid">
          <label>
            ID
            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
