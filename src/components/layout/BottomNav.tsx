"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, PlusCircle, Users, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/calendar",   icon: CalendarDays, label: "カレンダー" },
  { href: "/events/new", icon: PlusCircle,   label: "イベント"   },
  { href: "/family",     icon: Users,        label: "家族"       },
  { href: "/record",     icon: BookOpen,     label: "記録"       },
  { href: "/ai",         icon: Sparkles,     label: "AI"         },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 safe-area-bottom z-50 md:hidden">
      <div className="flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? "text-warm-500" : "text-gray-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
