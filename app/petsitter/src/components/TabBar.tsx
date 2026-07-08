"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, CalendarIcon } from "./Icons";

const TABS = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/clients", label: "Clients", Icon: UsersIcon },
  { href: "/visits", label: "Visits", Icon: CalendarIcon },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map(({ href, label, Icon }) => {
        const active =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="tab"
            data-active={active}
            aria-current={active ? "page" : undefined}
          >
            <span className="tab__icon">
              <Icon size={23} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span>{label}</span>
            <span className="tab__dot" />
          </Link>
        );
      })}
    </nav>
  );
}
