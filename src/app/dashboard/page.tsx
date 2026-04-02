"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type LogItem = {
  id: string;
  apiPath: string;
  method: string;
  calledAt: string;
  guidStatus: string;
  countryCode: string | null;
  languageCode: string | null;
  responseStatus: number;
  responseCode: string;
  delayMs: number;
};

type Stats = {
  total: number;
  success: number;
  fail: number;
  successRate: number;
  guidStatuses: Record<string, number>;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [delayMs, setDelayMs] = useState(2000);
  const [origins, setOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    success: 0,
    fail: 0,
    successRate: 0,
    guidStatuses: {},
  });
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);

    const [logsRes, statsRes, settingsRes, corsRes] = await Promise.all([
      fetch("/api/admin/logs"),
      fetch("/api/admin/stats"),
      fetch("/api/admin/settings"),
      fetch("/api/admin/cors"),
    ]);

    const logsJson = await logsRes.json();
    const statsJson = await statsRes.json();
    const settingsJson = await settingsRes.json();
    const corsJson = await corsRes.json();

    setLogs(logsJson.logs ?? []);
    setStats(statsJson);
    setDelayMs(settingsJson.delayMs ?? 2000);
    setOrigins(corsJson.origins ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function updateDelay(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delayMs }),
    });
    await loadAll();
  }

  async function addOrigin(e: FormEvent) {
    e.preventDefault();
    if (!newOrigin.trim()) return;

    await fetch("/api/admin/cors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: newOrigin.trim() }),
    });
    setNewOrigin("");
    await loadAll();
  }

  async function deleteOrigin(origin: string) {
    await fetch("/api/admin/cors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin }),
    });
    await loadAll();
  }

  if (loading) {
    return (
      <main className="container">
        <p>대시보드 로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="container grid">
      <div className="card" style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>관리자 대시보드</h1>
        <button className="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
          로그아웃
        </button>
      </div>

      <section className="grid grid-2">
        <div className="card">
          <h3>호출 통계</h3>
          <p>Total: {stats.total}</p>
          <p>Success: {stats.success}</p>
          <p>Fail: {stats.fail}</p>
          <p>Success Rate: {stats.successRate}%</p>
        </div>

        <div className="card">
          <h3>API Delay 설정(ms)</h3>
          <form onSubmit={updateDelay} className="grid">
            <input
              type="number"
              min={0}
              max={10000}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
            />
            <button type="submit">저장</button>
          </form>
        </div>
      </section>

      <section className="card">
        <h3>CORS 허용 Origin</h3>
        <form onSubmit={addOrigin} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            placeholder="https://example.com 또는 *"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
          />
          <button type="submit">추가</button>
        </form>
        <div className="grid">
          {origins.length === 0 && <p>등록된 Origin이 없습니다.</p>}
          {origins.map((origin) => (
            <div
              key={origin}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <code>{origin}</code>
              <button className="secondary" onClick={() => deleteOrigin(origin)}>
                삭제
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>최근 API 호출 로그</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Code</th>
                <th>Guid</th>
                <th>Country</th>
                <th>Lang</th>
                <th>Delay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.calledAt).toLocaleString()}</td>
                  <td>{log.responseStatus}</td>
                  <td>{log.responseCode}</td>
                  <td>{log.guidStatus}</td>
                  <td>{log.countryCode ?? "-"}</td>
                  <td>{log.languageCode ?? "-"}</td>
                  <td>{log.delayMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
