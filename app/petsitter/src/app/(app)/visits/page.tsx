import { createClient } from "@/lib/supabase/server";
import AddVisitForm from "@/components/AddVisitForm";
import PaidToggle from "@/components/PaidToggle";
import { CalendarIcon, ClockIcon, CheckIcon, XIcon } from "@/components/Icons";
import { money, todayISO, prettyDate } from "@/lib/format";
import type { VisitWithClient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [visitsRes, clientsRes] = await Promise.all([
    supabase
      .from("visits")
      .select("id,client_id,visit_date,service,rate,status,paid,notes,user_id,created_at,clients(name)")
      .order("visit_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("clients").select("id,name").order("name"),
  ]);

  const visits = (visitsRes.data ?? []) as unknown as VisitWithClient[];
  const clients = clientsRes.data ?? [];

  const todayVisits = visits.filter((v) => v.visit_date === today);
  const upcoming = visits
    .filter((v) => v.visit_date > today)
    .sort((a, b) => a.visit_date.localeCompare(b.visit_date));
  const recent = visits.filter((v) => v.visit_date < today);

  const unpaidTotal = visits
    .filter((v) => (v.status ?? "").toLowerCase() === "completed" && !v.paid)
    .reduce((s, v) => s + Number(v.rate ?? 0), 0);

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__sub">
            {unpaidTotal > 0 ? (
              <span className="danger-text" style={{ fontWeight: 700 }}>
                {money(unpaidTotal)} unpaid
              </span>
            ) : (
              "All caught up on payments"
            )}
          </div>
          <h1 className="topbar__title">Visits</h1>
        </div>
        <AddVisitForm clients={clients} variant="header" />
      </header>

      <main className="app-main">
        {visits.length === 0 ? (
          <div className="empty">
            <div className="empty__icon">
              <CalendarIcon size={30} />
            </div>
            <div className="empty__title">No visits logged</div>
            <p className="empty__text">
              Log each visit with its service, rate, and payment status — unpaid work shows up
              in red so nothing slips.
            </p>
            <div style={{ maxWidth: 320, margin: "18px auto 0" }}>
              <AddVisitForm clients={clients} variant="block" />
            </div>
          </div>
        ) : (
          <>
            {todayVisits.length > 0 && (
              <>
                <h2 className="section-title">Today</h2>
                <div className="list">
                  {todayVisits.map((v) => (
                    <VisitRow key={v.id} visit={v} highlight />
                  ))}
                </div>
              </>
            )}

            {upcoming.length > 0 && (
              <>
                <h2 className="section-title">Upcoming</h2>
                <div className="list">
                  {upcoming.map((v) => (
                    <VisitRow key={v.id} visit={v} />
                  ))}
                </div>
              </>
            )}

            {recent.length > 0 && (
              <>
                <h2 className="section-title">Recent</h2>
                <div className="list">
                  {recent.map((v) => (
                    <VisitRow key={v.id} visit={v} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

function VisitRow({ visit: v, highlight }: { visit: VisitWithClient; highlight?: boolean }) {
  const completed = (v.status ?? "").toLowerCase() === "completed";
  const cancelled = (v.status ?? "").toLowerCase() === "cancelled";
  const unpaidCompleted = completed && !v.paid;

  const rowClass = [
    "row",
    unpaidCompleted ? "row--danger" : "",
    highlight && !unpaidCompleted ? "row--today" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass}>
      <span
        className="row__avatar"
        style={
          unpaidCompleted
            ? { background: "rgba(192,57,43,.12)", color: "var(--danger)" }
            : undefined
        }
      >
        {cancelled ? <XIcon size={19} /> : completed ? <CheckIcon size={19} /> : <ClockIcon size={19} />}
      </span>
      <div className="row__body">
        <div className="row__title">{v.clients?.name ?? "Client"}</div>
        <div className="row__meta">
          {prettyDate(v.visit_date)} · {v.service || "Visit"} · {money(Number(v.rate ?? 0))}
          {cancelled ? " · Cancelled" : ""}
        </div>
      </div>
      {!cancelled && <PaidToggle id={v.id} paid={v.paid} completed={completed} />}
    </div>
  );
}
