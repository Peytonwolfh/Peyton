import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import {
  UsersIcon,
  PawIcon,
  CalendarIcon,
  CalendarCheckIcon,
  DollarIcon,
  TrendingIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/components/Icons";
import { money, todayISO, startOfWeekISO, startOfMonthISO } from "@/lib/format";
import type { VisitWithClient } from "@/lib/types";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayISO();
  const weekStart = startOfWeekISO();
  const monthStart = startOfMonthISO();

  const [clientsRes, petsRes, visitsRes, todayRes] = await Promise.all([
    supabase.from("clients").select("id,status"),
    supabase.from("pets").select("id", { count: "exact", head: true }),
    supabase.from("visits").select("visit_date,rate,paid,status"),
    supabase
      .from("visits")
      .select("id,visit_date,service,rate,status,paid,clients(name)")
      .eq("visit_date", today)
      .order("created_at", { ascending: true }),
  ]);

  const clients = clientsRes.data ?? [];
  const visits = visitsRes.data ?? [];
  const todayVisits = (todayRes.data ?? []) as unknown as VisitWithClient[];

  const activeClients = clients.filter(
    (c) => (c.status ?? "Active").toLowerCase() === "active"
  ).length;
  const petCount = petsRes.count ?? 0;

  const isCompleted = (s: string | null) => (s ?? "").toLowerCase() === "completed";

  const visitsThisWeek = visits.filter(
    (v) => v.visit_date >= weekStart && v.visit_date <= addDays(weekStart, 6)
  ).length;
  const visitsToday = visits.filter((v) => v.visit_date === today).length;

  const unpaidBalance = visits
    .filter((v) => isCompleted(v.status) && !v.paid)
    .reduce((sum, v) => sum + Number(v.rate ?? 0), 0);

  const revenueThisMonth = visits
    .filter((v) => isCompleted(v.status) && v.visit_date >= monthStart)
    .reduce((sum, v) => sum + Number(v.rate ?? 0), 0);

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__sub">{greeting()}</div>
          <h1 className="topbar__title">Dashboard</h1>
        </div>
        <SignOutButton />
      </header>

      <main className="app-main">
        <div className="stat-grid">
          <Stat
            icon={<UsersIcon size={19} />}
            value={activeClients}
            label="Active clients"
          />
          <Stat icon={<PawIcon size={19} />} value={petCount} label="Pets under care" />
          <Stat
            icon={<CalendarIcon size={19} />}
            value={visitsThisWeek}
            label="Visits this week"
          />
          <Stat
            icon={<CalendarCheckIcon size={19} />}
            value={visitsToday}
            label="Visits today"
          />
          <Stat
            variant={unpaidBalance > 0 ? "danger" : undefined}
            icon={<DollarIcon size={19} />}
            value={money(unpaidBalance)}
            label="Unpaid balance"
          />
          <Stat
            variant="accent"
            icon={<TrendingIcon size={19} />}
            value={money(revenueThisMonth)}
            label="Revenue this month"
          />
        </div>

        <h2 className="section-title">Today&apos;s schedule</h2>
        {todayVisits.length === 0 ? (
          <div className="card" style={{ padding: "22px 16px" }}>
            <div className="row-between">
              <div className="muted" style={{ fontSize: 14 }}>
                No visits scheduled for today.
              </div>
              <Link href="/visits" className="chip">
                Plan one
              </Link>
            </div>
          </div>
        ) : (
          <div className="list">
            {todayVisits.map((v) => (
              <Link key={v.id} href="/visits" className="row row--today">
                <span className="row__avatar">
                  <ClockIcon size={20} />
                </span>
                <div className="row__body">
                  <div className="row__title">{v.clients?.name ?? "Client"}</div>
                  <div className="row__meta">
                    {v.service || "Visit"} · {money(Number(v.rate ?? 0))}
                  </div>
                </div>
                {isCompleted(v.status) && !v.paid ? (
                  <span className="chip chip--danger">Unpaid</span>
                ) : (
                  <span className="chip chip--muted">{v.status}</span>
                )}
              </Link>
            ))}
          </div>
        )}

        <h2 className="section-title">Quick actions</h2>
        <div className="list">
          <Link href="/clients" className="row">
            <span className="row__avatar">
              <UsersIcon size={21} />
            </span>
            <div className="row__body">
              <div className="row__title">Clients &amp; pets</div>
              <div className="row__meta">Codes, care details, emergency contacts</div>
            </div>
            <ChevronRightIcon size={20} className="row__chev" />
          </Link>
          <Link href="/visits" className="row">
            <span className="row__avatar">
              <CalendarIcon size={21} />
            </span>
            <div className="row__body">
              <div className="row__title">Visits &amp; billing</div>
              <div className="row__meta">Log a visit, track what&apos;s unpaid</div>
            </div>
            <ChevronRightIcon size={20} className="row__chev" />
          </Link>
        </div>
      </main>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
  variant,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  variant?: "accent" | "danger" | "gold";
}) {
  return (
    <div className={`stat${variant ? ` stat--${variant}` : ""}`}>
      <span className="stat__icon">{icon}</span>
      <div>
        <div className="stat__value">{value}</div>
        <div className="stat__label">{label}</div>
      </div>
    </div>
  );
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
