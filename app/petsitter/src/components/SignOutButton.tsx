"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutIcon } from "./Icons";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      className="topbar__spark"
      onClick={signOut}
      disabled={busy}
      aria-label="Sign out"
      title="Sign out"
      style={{
        background: "transparent",
        color: "var(--muted)",
        boxShadow: "none",
        border: "1.5px solid var(--border)",
      }}
    >
      <LogoutIcon size={22} />
    </button>
  );
}
