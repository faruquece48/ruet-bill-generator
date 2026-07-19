"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/bills/create", label: "Bill" },
  { href: "/bills/preview", label: "Preview" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount, always render the inactive state so the server-rendered
  // HTML matches the very first client render exactly (no hydration mismatch).
  // After mount, update to reflect the real active tab.
  const active = mounted && pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-black text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function BillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <span className="mr-4 text-lg font-bold">
            Examination Bill Generator
          </span>
          {tabs.map((tab) => (
            <NavLink key={tab.href} href={tab.href} label={tab.label} />
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}