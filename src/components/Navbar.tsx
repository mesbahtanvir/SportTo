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
      <nav className="sticky top-0 z-50 bg-white border-b border-border hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏸</span>
            <span className="text-xl font-bold text-primary">
              Sport<span className="text-accent">To</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:hidden">
        <div className="flex justify-around items-center h-16">
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
                className={`flex flex-col items-center gap-1 py-1 px-3 ${
                  isActive ? "text-primary" : "text-text-secondary"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
