"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "./Sheet";
import { addPet } from "@/lib/actions";
import { PlusIcon, AlertIcon } from "./Icons";

export default function AddPetForm({
  clientId,
  variant = "header",
}: {
  clientId: string;
  variant?: "header" | "block";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [caution, setCaution] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("caution", caution ? "true" : "false");
    const res = await addPet(fd);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setCaution(false);
    router.refresh();
  }

  return (
    <>
      {variant === "header" ? (
        <button className="add-btn" onClick={() => setOpen(true)}>
          <PlusIcon size={17} strokeWidth={2.6} /> Pet
        </button>
      ) : (
        <button className="btn btn--ghost" onClick={() => setOpen(true)}>
          <PlusIcon size={19} strokeWidth={2.6} /> Add a pet
        </button>
      )}

      <Sheet open={open} title="New pet" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={onSubmit}>
          <input type="hidden" name="client_id" value={clientId} />

          <div className="row2">
            <div className="field-group">
              <label className="label" htmlFor="p-name">
                Pet name *
              </label>
              <input id="p-name" name="name" className="input" placeholder="Biscuit" required />
            </div>
            <div className="field-group">
              <label className="label" htmlFor="p-species">
                Species
              </label>
              <input id="p-species" name="species" className="input" placeholder="Dog" />
            </div>
          </div>

          <div className="row2">
            <div className="field-group">
              <label className="label" htmlFor="p-breed">
                Breed
              </label>
              <input id="p-breed" name="breed" className="input" placeholder="Beagle" />
            </div>
            <div className="field-group">
              <label className="label" htmlFor="p-age">
                Age
              </label>
              <input id="p-age" name="age" className="input" placeholder="4 yrs" />
            </div>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="p-feeding">
              Feeding
            </label>
            <textarea
              id="p-feeding"
              name="feeding"
              className="textarea"
              placeholder="1 cup dry, 7am &amp; 6pm. Treats in pantry."
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="p-meds">
              Medications
            </label>
            <input
              id="p-meds"
              name="medications"
              className="input"
              placeholder="Apoquel 1 tab with breakfast"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="p-walk">
              Walk routine
            </label>
            <input
              id="p-walk"
              name="walk_routine"
              className="input"
              placeholder="2 walks/day, 20 min, no dog parks"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="p-behavior">
              Behavior notes
            </label>
            <textarea
              id="p-behavior"
              name="behavior_notes"
              className="textarea"
              placeholder="Nervous around strangers; resource-guards toys."
            />
          </div>

          <label className={`switch${caution ? " switch--danger" : ""}`}>
            <div>
              <div className="switch__label">
                <AlertIcon size={17} /> Caution flag
              </div>
              <div className="switch__hint">
                Shows a red warning banner for this pet (bites, guarding, escape risk…).
              </div>
            </div>
            <input
              type="checkbox"
              checked={caution}
              onChange={(e) => setCaution(e.target.checked)}
            />
            <span className="switch__track" />
          </label>

          {error && <div className="notice notice--error">{error}</div>}

          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save pet"}
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
