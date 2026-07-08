"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "./Sheet";
import { addClient } from "@/lib/actions";
import { PlusIcon, KeypadIcon, ShieldIcon, KeyIcon, HeartIcon } from "./Icons";

export default function AddClientForm({
  variant = "header",
}: {
  variant?: "header" | "block";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await addClient(fd);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {variant === "header" ? (
        <button className="add-btn" onClick={() => setOpen(true)}>
          <PlusIcon size={17} strokeWidth={2.6} /> Add
        </button>
      ) : (
        <button className="btn" onClick={() => setOpen(true)}>
          <PlusIcon size={19} strokeWidth={2.6} /> Add your first client
        </button>
      )}

      <Sheet open={open} title="New client" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={onSubmit}>
          <div className="field-group">
            <label className="label" htmlFor="c-name">
              Client name *
            </label>
            <input id="c-name" name="name" className="input" placeholder="Jamie Rivera" required />
          </div>

          <div className="row2">
            <div className="field-group">
              <label className="label" htmlFor="c-phone">
                Phone
              </label>
              <input
                id="c-phone"
                name="phone"
                className="input"
                type="tel"
                inputMode="tel"
                placeholder="(555) 010-2233"
              />
            </div>
            <div className="field-group">
              <label className="label" htmlFor="c-status">
                Status
              </label>
              <select id="c-status" name="status" className="select" defaultValue="Active">
                <option>Active</option>
                <option>Lead</option>
                <option>Paused</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-email">
              Email
            </label>
            <input
              id="c-email"
              name="email"
              className="input"
              type="email"
              inputMode="email"
              placeholder="jamie@example.com"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-address">
              Home address
            </label>
            <input id="c-address" name="address" className="input" placeholder="14 Maple Court" />
          </div>

          <div
            className="section-title"
            style={{ margin: "6px 2px 0", display: "flex", alignItems: "center", gap: 6 }}
          >
            <ShieldIcon size={15} /> Access &amp; security
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-door">
              <KeypadIcon size={13} /> Door / gate code
            </label>
            <input id="c-door" name="door_code" className="input" placeholder="#4821" />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-alarm">
              Alarm info
            </label>
            <input
              id="c-alarm"
              name="alarm_info"
              className="input"
              placeholder="Disarm 7788, panel by garage"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-key">
              <KeyIcon size={13} /> Key location
            </label>
            <input
              id="c-key"
              name="key_location"
              className="input"
              placeholder="Lockbox on back gate"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-emerg">
              Emergency contact
            </label>
            <input
              id="c-emerg"
              name="emergency_contact"
              className="input"
              placeholder="Sam (brother) 555-0147"
            />
          </div>

          <div className="row2">
            <div className="field-group">
              <label className="label" htmlFor="c-vet">
                <HeartIcon size={13} /> Vet clinic
              </label>
              <input id="c-vet" name="vet_clinic" className="input" placeholder="Oak Animal Hosp." />
            </div>
            <div className="field-group">
              <label className="label" htmlFor="c-vetphone">
                Vet phone
              </label>
              <input
                id="c-vetphone"
                name="vet_phone"
                className="input"
                type="tel"
                inputMode="tel"
                placeholder="555-0199"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="c-notes">
              Notes
            </label>
            <textarea
              id="c-notes"
              name="notes"
              className="textarea"
              placeholder="Prefers text updates, mail on counter…"
            />
          </div>

          {error && <div className="notice notice--error">{error}</div>}

          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save client"}
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
      </Sheet>
    </>
  );
}
