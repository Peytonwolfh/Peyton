"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PawIcon } from "@/components/Icons";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        // If email confirmation is OFF, a session is returned and we're in.
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }
        // Confirmation is ON — no session yet.
        setMode("signin");
        setNotice(
          "Account created. If email confirmation is on, confirm via the link we emailed, then sign in."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth__hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="auth__mark" src="/icon-192.png" alt="PetSitter CRM" />
        <h1 className="auth__title">PetSitter CRM</h1>
        <p className="auth__tag">Every client, pet &amp; visit — in your pocket.</p>
      </div>

      <div className="auth__card">
        <div className="seg" role="tablist">
          <button
            type="button"
            data-active={mode === "signin"}
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            data-active={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
          >
            Create account
          </button>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="field-group">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="notice notice--error">{error}</div>}
          {notice && <div className="notice notice--ok">{notice}</div>}

          <button className="btn" type="submit" disabled={busy}>
            <PawIcon size={20} />
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      </div>

      <p className="auth__foot">
        Your data is protected per-account with Supabase Row-Level Security.
      </p>
    </main>
  );
}
