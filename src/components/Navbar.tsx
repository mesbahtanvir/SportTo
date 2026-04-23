"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Calendar, Info, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/centers", label: "Centers", icon: MapPin },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-text-primary/60"
            />
            <span className="text-sm font-medium text-text-primary tracking-tight">
              SportTo
            </span>
          </Link>
          <div className="flex items-center gap-5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1 text-sm transition-colors ${
                    isActive
                      ? "text-text-primary border-b border-text-primary/60"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar — honours iOS safe-area */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-border md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex justify-around items-stretch h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span
                  className={`text-[11px] ${
                    isActive ? "font-medium" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
