/** Row shapes for the Supabase tables (public schema). */

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  door_code: string | null;
  alarm_info: string | null;
  key_location: string | null;
  emergency_contact: string | null;
  vet_clinic: string | null;
  vet_phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  species: string | null;
  breed: string | null;
  age: string | null;
  feeding: string | null;
  medications: string | null;
  walk_routine: string | null;
  behavior_notes: string | null;
  caution: boolean;
  created_at: string;
}

export interface Visit {
  id: string;
  user_id: string;
  client_id: string | null;
  visit_date: string;
  service: string | null;
  rate: number | null;
  status: string;
  paid: boolean;
  notes: string | null;
  created_at: string;
}

/** A visit joined with its client name, for list views. */
export type VisitWithClient = Visit & { clients: Pick<Client, "name"> | null };
