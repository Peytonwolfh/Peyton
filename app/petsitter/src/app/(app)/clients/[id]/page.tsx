import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddPetForm from "@/components/AddPetForm";
import type { Client, Pet } from "@/lib/types";
import {
  ArrowLeftIcon,
  PhoneIcon,
  MailIcon,
  PinIcon,
  KeypadIcon,
  ShieldIcon,
  KeyIcon,
  HeartIcon,
  UserIcon,
  AlertIcon,
  PawIcon,
  BowlIcon,
  CrossMedIcon,
  NoteIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!clientData) notFound();
  const client = clientData as Client;

  const { data: petData } = await supabase
    .from("pets")
    .select("*")
    .eq("client_id", params.id)
    .order("created_at", { ascending: true });
  const pets = (petData ?? []) as Pet[];

  const cautionPets = pets.filter((p) => p.caution);

  return (
    <>
      <header className="topbar">
        <div style={{ minWidth: 0 }}>
          <Link href="/clients" className="back-link">
            <ArrowLeftIcon size={16} /> Clients
          </Link>
          <h1 className="topbar__title" style={{ marginTop: 2 }}>
            {client.name}
          </h1>
        </div>
        <AddPetForm clientId={client.id} variant="header" />
      </header>

      <main className="app-main">
        <div className="row-between" style={{ margin: "0 2px 4px" }}>
          <span className={`chip${statusClass(client.status)}`}>{client.status}</span>
        </div>

        {cautionPets.length > 0 && (
          <div className="caution" style={{ marginTop: 12 }}>
            <span className="caution__icon">
              <AlertIcon size={26} />
            </span>
            <div>
              <div className="caution__title">Caution on file</div>
              <div className="caution__text">
                {cautionPets.map((p) => p.name).join(", ")} flagged — review behavior notes
                before every visit.
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <h2 className="section-title">Contact</h2>
        <div className="field-card">
          <Field icon={<PhoneIcon size={16} />} label="Phone">
            {client.phone ? (
              <a href={`tel:${client.phone}`}>{client.phone}</a>
            ) : (
              <span className="muted">Not set</span>
            )}
          </Field>
          <Field icon={<MailIcon size={16} />} label="Email">
            {client.email ? (
              <a href={`mailto:${client.email}`}>{client.email}</a>
            ) : (
              <span className="muted">Not set</span>
            )}
          </Field>
          <Field icon={<PinIcon size={16} />} label="Address">
            {client.address || <span className="muted">Not set</span>}
          </Field>
        </div>

        {/* Access & security — the differentiator */}
        <h2 className="section-title">Access &amp; security</h2>
        <div className="field-card field-card--secure">
          <div className="secure-head">
            <ShieldIcon size={16} /> Keep private
          </div>
          <Field icon={<KeypadIcon size={16} />} label="Door / gate code" secure>
            {client.door_code || <span className="muted">Not set</span>}
          </Field>
          <Field icon={<ShieldIcon size={16} />} label="Alarm info" secure>
            {client.alarm_info || <span className="muted">Not set</span>}
          </Field>
          <Field icon={<KeyIcon size={16} />} label="Key location" secure>
            {client.key_location || <span className="muted">Not set</span>}
          </Field>
        </div>

        {/* Vet & emergency */}
        <h2 className="section-title">Vet &amp; emergency</h2>
        <div className="field-card">
          <Field icon={<HeartIcon size={16} />} label="Vet clinic">
            {client.vet_clinic || <span className="muted">Not set</span>}
          </Field>
          <Field icon={<PhoneIcon size={16} />} label="Vet phone">
            {client.vet_phone ? (
              <a href={`tel:${client.vet_phone}`}>{client.vet_phone}</a>
            ) : (
              <span className="muted">Not set</span>
            )}
          </Field>
          <Field icon={<UserIcon size={16} />} label="Emergency contact">
            {client.emergency_contact || <span className="muted">Not set</span>}
          </Field>
        </div>

        {client.notes && (
          <>
            <h2 className="section-title">Notes</h2>
            <div className="field-card">
              <Field icon={<NoteIcon size={16} />} label="Notes">
                {client.notes}
              </Field>
            </div>
          </>
        )}

        {/* Pets */}
        <div className="row-between" style={{ margin: "26px 4px 10px" }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            Pets ({pets.length})
          </h2>
          {pets.length > 0 && <AddPetForm clientId={client.id} variant="header" />}
        </div>

        {pets.length === 0 ? (
          <div className="card" style={{ padding: "22px 18px", textAlign: "center" }}>
            <div className="empty__icon" style={{ width: 52, height: 52, marginBottom: 12 }}>
              <PawIcon size={26} />
            </div>
            <div className="empty__title" style={{ fontSize: 16 }}>
              No pets yet
            </div>
            <p className="empty__text" style={{ fontSize: 13.5, marginBottom: 16 }}>
              Add each pet&apos;s feeding, meds, walk routine, and behavior notes.
            </p>
            <div style={{ maxWidth: 260, margin: "0 auto" }}>
              <AddPetForm clientId={client.id} variant="block" />
            </div>
          </div>
        ) : (
          <div className="list">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  const subtitle = [pet.species, pet.breed, pet.age].filter(Boolean).join(" · ");
  return (
    <div className="field-card" style={pet.caution ? { borderColor: "rgba(192,57,43,.4)" } : undefined}>
      <div className="field" style={{ borderTop: "none", alignItems: "center" }}>
        <span
          className="field__icon"
          style={
            pet.caution
              ? { background: "var(--danger-tint)", color: "var(--danger)", width: 38, height: 38 }
              : { width: 38, height: 38 }
          }
        >
          <PawIcon size={19} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="field__value" style={{ fontSize: 17, marginTop: 0 }}>
            {pet.name}
          </div>
          {subtitle && <div className="field__label" style={{ marginTop: 2 }}>{subtitle}</div>}
        </div>
        {pet.caution && (
          <span className="chip chip--danger">
            <AlertIcon size={11} /> Caution
          </span>
        )}
      </div>

      {pet.caution && (
        <div style={{ padding: "0 13px 12px" }}>
          <div className="caution">
            <span className="caution__icon">
              <AlertIcon size={22} />
            </span>
            <div>
              <div className="caution__title">Handle with care</div>
              <div className="caution__text">
                {pet.behavior_notes || "Flagged for caution — take extra care on every visit."}
              </div>
            </div>
          </div>
        </div>
      )}

      {pet.feeding && (
        <Field icon={<BowlIcon size={16} />} label="Feeding">
          {pet.feeding}
        </Field>
      )}
      {pet.medications && (
        <Field icon={<CrossMedIcon size={16} />} label="Medications">
          {pet.medications}
        </Field>
      )}
      {pet.walk_routine && (
        <Field icon={<PawIcon size={16} />} label="Walk routine">
          {pet.walk_routine}
        </Field>
      )}
      {pet.behavior_notes && !pet.caution && (
        <Field icon={<NoteIcon size={16} />} label="Behavior notes">
          {pet.behavior_notes}
        </Field>
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  secure,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  secure?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`field${secure ? " field--secure" : ""}`}>
      <span className="field__icon">{icon}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="field__label">{label}</div>
        <div className="field__value">{children}</div>
      </div>
    </div>
  );
}

function statusClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "active") return "";
  if (s === "lead") return " chip--gold";
  return " chip--muted";
}
