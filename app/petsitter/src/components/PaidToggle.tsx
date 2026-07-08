"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setVisitPaid } from "@/lib/actions";
import { CheckIcon, DollarIcon } from "./Icons";

export default function PaidToggle({
  id,
  paid,
  completed,
}: {
  id: string;
  paid: boolean;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(paid);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !optimistic;
    setOptimistic(next);
    start(async () => {
      const res = await setVisitPaid(id, next);
      if (!res.ok) setOptimistic(!next);
      router.refresh();
    });
  }

  if (optimistic) {
    return (
      <button className="chip chip--paid" onClick={toggle} disabled={pending} aria-label="Mark unpaid">
        <CheckIcon size={12} /> Paid
      </button>
    );
  }

  return (
    <button
      className={`chip ${completed ? "chip--danger" : "chip--muted"}`}
      onClick={toggle}
      disabled={pending}
      aria-label="Mark paid"
    >
      <DollarIcon size={12} /> {completed ? "Mark paid" : "Unpaid"}
    </button>
  );
}
