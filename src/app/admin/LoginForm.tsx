"use client";

import { useState } from "react";
import { SHOP } from "@/config/shop";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setError("Incorrect password.");
    }
    setLoading(false);
  }

  return (
    <div
      style={{ background: "var(--bg)", color: "var(--text)" }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <p
          style={{ color: "var(--gold)", letterSpacing: "0.2em" }}
          className="text-xs uppercase font-semibold text-center mb-3"
        >
          {SHOP.name}
        </p>
        <h1 className="text-3xl font-black uppercase text-center mb-8" style={{ letterSpacing: "-0.01em" }}>
          Admin
        </h1>
        <form onSubmit={login} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              borderRadius: 6,
              padding: "12px 14px",
              width: "100%",
              fontSize: 15,
            }}
            autoFocus
          />
          {error && (
            <p className="text-sm" style={{ color: "#e05555" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            style={{
              width: "100%",
              background: password ? "var(--gold)" : "var(--border)",
              color: password ? "#000" : "var(--muted)",
              border: "none",
              borderRadius: 6,
              padding: "13px",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: password ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
