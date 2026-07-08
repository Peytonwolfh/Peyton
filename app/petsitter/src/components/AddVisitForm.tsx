"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "./Sheet";
import { addVisit } from "@/lib/actions";
import { PlusIcon, DollarIcon } from "./Icons";
import { todayISO } from "@/lib/format";

const SERVICES = [
  "Drop-in visit",
  "Dog walk",
  "Overnight stay",
  "Daily sitting",
  "Boarding",
  "Pet taxi",
  "Medication visit",
];

export default function AddVisitForm({
  clients,
  variant = "header",
}: {
  clients: { id: string; name: string }[];
  variant?: "header" | "block";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("paid", paid ? "true" : "false");
    const res = await addVisit(fd);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setPaid(false);
    router.refresh();
  }

  return (
    <>
      {variant === "header" ? (
        <button className="add-btn" onClick={() => setOpen(true)}>
          <PlusIcon size={17} strokeWidth={2.6} /> Log visit
        </button>
      ) : (
        <button className="btn" onClick={() => setOpen(true)}>
          <PlusIcon size={19} strokeWidth={2.6} /> Log your first visit
        </button>
      )}

      <Sheet open={open} title="Log a visit" onClose={() => setOpen(false)}>
        {clients.length === 0 ? (
          <div className="notice notice--ok" style={{ marginBottom: 16 }}>
            Add a client first — visits are always linked to a client.
          </div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            <div className="field-group">
              <label className="label" htmlFor="v-client">
                Client *
              </label>
              <select id="v-client" name="client_id" className="select" required defaultValue="">
                <option value="" disabled>
                  Choose a client…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row2">
              <div className="field-group">
                <label className="label" htmlFor="v-date">
                  Date *
                </label>
                <input
                  id="v-date"
                  name="visit_date"
                  className="input"
                  type="date"
                  defaultValue={todayISO()}
                  required
                />
              </div>
              <div className="field-group">
                <label className="label" htmlFor="v-rate">
                  Rate ($)
                </label>
                <input
                  id="v-rate"
                  name="rate"
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="35.00"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="label" htmlFor="v-service">
                Service
              </label>
              <select id="v-service" name="service" className="select" defaultValue={SERVICES[0]}>
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="label" htmlFor="v-status">
                Status
              </label>
              <select id="v-status" name="status" className="select" defaultValue="Booked">
                <option>Booked</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <label className="switch">
              <div>
                <div className="switch__label">
                  <DollarIcon size={16} /> Paid
                </div>
                <div className="switch__hint">Completed &amp; unpaid visits show in red.</div>
              </div>
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              <span className="switch__track" />
            </label>

            <div className="field-group">
              <label className="label" htmlFor="v-notes">
                Notes
              </label>
              <textarea
                id="v-notes"
                name="notes"
                className="textarea"
                placeholder="Fed dinner, 25-min walk, all good."
              />
            </div>

            {error && <div className="notice notice--error">{error}</div>}

            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save visit"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </button>
          </form>
        )}
      </Sheet>
    </>
  );
}
