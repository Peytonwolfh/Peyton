"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null as string | null };
  return { supabase, userId: user.id };
}

/* --------------------------------------------------------------- clients -- */

export async function addClient(fd: FormData): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Client name is required." };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      name,
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      address: str(fd, "address"),
      door_code: str(fd, "door_code"),
      alarm_info: str(fd, "alarm_info"),
      key_location: str(fd, "key_location"),
      emergency_contact: str(fd, "emergency_contact"),
      vet_clinic: str(fd, "vet_clinic"),
      vet_phone: str(fd, "vet_phone"),
      status: str(fd, "status") ?? "Active",
      notes: str(fd, "notes"),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

/* ------------------------------------------------------------------ pets -- */

export async function addPet(fd: FormData): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const name = str(fd, "name");
  const clientId = str(fd, "client_id");
  if (!name) return { ok: false, error: "Pet name is required." };
  if (!clientId) return { ok: false, error: "Missing client." };

  const { error } = await supabase.from("pets").insert({
    user_id: userId,
    client_id: clientId,
    name,
    species: str(fd, "species"),
    breed: str(fd, "breed"),
    age: str(fd, "age"),
    feeding: str(fd, "feeding"),
    medications: str(fd, "medications"),
    walk_routine: str(fd, "walk_routine"),
    behavior_notes: str(fd, "behavior_notes"),
    caution: fd.get("caution") === "on" || fd.get("caution") === "true",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ---------------------------------------------------------------- visits -- */

export async function addVisit(fd: FormData): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const clientId = str(fd, "client_id");
  const visitDate = str(fd, "visit_date");
  if (!clientId) return { ok: false, error: "Please choose a client." };
  if (!visitDate) return { ok: false, error: "Please choose a date." };

  const rateRaw = str(fd, "rate");
  const rate = rateRaw ? Number(rateRaw.replace(/[^0-9.]/g, "")) : 0;

  const { error } = await supabase.from("visits").insert({
    user_id: userId,
    client_id: clientId,
    visit_date: visitDate,
    service: str(fd, "service"),
    rate: Number.isFinite(rate) ? rate : 0,
    status: str(fd, "status") ?? "Booked",
    paid: fd.get("paid") === "on" || fd.get("paid") === "true",
    notes: str(fd, "notes"),
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/visits");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setVisitPaid(id: string, paid: boolean): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase.from("visits").update({ paid }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/visits");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setVisitStatus(id: string, status: string): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase.from("visits").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/visits");
  revalidatePath("/dashboard");
  return { ok: true };
}
