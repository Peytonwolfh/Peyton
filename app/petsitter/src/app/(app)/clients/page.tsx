import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddClientForm from "@/components/AddClientForm";
import { UsersIcon, PawIcon, ChevronRightIcon, AlertIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  status: string;
  pets: { caution: boolean }[] | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id,name,phone,address,status,pets(caution)")
    .order("name", { ascending: true });

  const clients = (data ?? []) as unknown as ClientRow[];

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__sub">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </div>
          <h1 className="topbar__title">Clients</h1>
        </div>
        <AddClientForm variant="header" />
      </header>

      <main className="app-main">
        {clients.length === 0 ? (
          <div className="empty">
            <div className="empty__icon">
              <UsersIcon size={30} />
            </div>
            <div className="empty__title">No clients yet</div>
            <p className="empty__text">
              Add your first client to store their door codes, pet care details, vet, and
              emergency contacts — all in one place.
            </p>
            <div style={{ maxWidth: 320, margin: "18px auto 0" }}>
              <AddClientForm variant="block" />
            </div>
          </div>
        ) : (
          <div className="list">
            {clients.map((c) => {
              const petCount = c.pets?.length ?? 0;
              const hasCaution = (c.pets ?? []).some((p) => p.caution);
              return (
                <Link key={c.id} href={`/clients/${c.id}`} className="row">
                  <span className="row__avatar">{initials(c.name) || "?"}</span>
                  <div className="row__body">
                    <div className="row__title">
                      {c.name}
                      {hasCaution && (
                        <span className="chip chip--danger">
                          <AlertIcon size={11} /> Caution
                        </span>
                      )}
                    </div>
                    <div className="row__meta">
                      {c.phone || c.address || "No contact info"}
                    </div>
                  </div>
                  <span className="chip">
                    <PawIcon size={12} /> {petCount}
                  </span>
                  <ChevronRightIcon size={20} className="row__chev" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
