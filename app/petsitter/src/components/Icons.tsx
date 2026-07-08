import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </Base>
);

export const UsersIcon = (p: P) => (
  <Base {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13A4 4 0 0 1 16 11" />
  </Base>
);

export const CalendarIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="3" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Base>
);

export const CalendarCheckIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="3" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    <path d="m9 15 2 2 4-4" />
  </Base>
);

export const PawIcon = (p: P) => (
  <Base {...p}>
    <circle cx="6.5" cy="10.5" r="1.9" />
    <circle cx="10" cy="6.5" r="1.9" />
    <circle cx="14" cy="6.5" r="1.9" />
    <circle cx="17.5" cy="10.5" r="1.9" />
    <path d="M8 15.5c1-1.6 2.3-2.5 4-2.5s3 .9 4 2.5c1.2 1.9.4 3.9-1.7 4.2-.9.1-1.6-.4-2.3-.4s-1.4.5-2.3.4C7.6 19.4 6.8 17.4 8 15.5Z" />
  </Base>
);

export const LeafIcon = (p: P) => (
  <Base {...p}>
    <path d="M11 20A7 7 0 0 1 4 13c0-4.5 3.5-8.5 16-9-0 8.5-4.5 12-9 13Z" />
    <path d="M7 20c2-4.5 5-7 9-8.5" />
  </Base>
);

export const AlertIcon = (p: P) => (
  <Base {...p}>
    <path d="M10.3 3.2 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Base>
);

export const KeyIcon = (p: P) => (
  <Base {...p}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m10.5 12.5 8-8M17 6l2 2M14 9l2 2" />
  </Base>
);

export const KeypadIcon = (p: P) => (
  <Base {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="3" />
    <circle cx="8.5" cy="7" r="0.6" />
    <circle cx="12" cy="7" r="0.6" />
    <circle cx="15.5" cy="7" r="0.6" />
    <circle cx="8.5" cy="11" r="0.6" />
    <circle cx="12" cy="11" r="0.6" />
    <circle cx="15.5" cy="11" r="0.6" />
    <circle cx="12" cy="15" r="0.6" />
  </Base>
);

export const ShieldIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10v-6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const PinIcon = (p: P) => (
  <Base {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
);

export const PhoneIcon = (p: P) => (
  <Base {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </Base>
);

export const MailIcon = (p: P) => (
  <Base {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
    <path d="m3 6 9 6.5L21 6" />
  </Base>
);

export const CrossMedIcon = (p: P) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </Base>
);

export const HeartIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 20.5S3.5 15 3.5 8.9A4.4 4.4 0 0 1 12 6.7a4.4 4.4 0 0 1 8.5 2.2C20.5 15 12 20.5 12 20.5Z" />
  </Base>
);

export const DollarIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 2v20M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Base>
);

export const TrendingIcon = (p: P) => (
  <Base {...p}>
    <path d="m3 16 6-6 4 4 8-8" />
    <path d="M15 6h6v6" />
  </Base>
);

export const PlusIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const ChevronRightIcon = (p: P) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const ArrowLeftIcon = (p: P) => (
  <Base {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Base>
);

export const CheckIcon = (p: P) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const ClockIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const XIcon = (p: P) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);

export const UserIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </Base>
);

export const NoteIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 3.5h16v13l-4 4H4Z" />
    <path d="M15 20.5v-4h4M8 8h8M8 12h6" />
  </Base>
);

export const BowlIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z" />
    <path d="M8 11c0-2 1.8-3 4-3s4 1 4 3" />
  </Base>
);

export const LogoutIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Base>
);

export const SparkleIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
  </Base>
);
