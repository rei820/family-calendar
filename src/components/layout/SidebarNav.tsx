"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, PlusCircle, Users, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/calendar",    icon: CalendarDays, label: "カレンダー" },
  { href: "/record",      icon: BookOpen,     label: "記録"       },
  { href: "/events/new",  icon: PlusCircle,   label: "イベント作成" },
  { href: "/family",      icon: Users,        label: "家族"       },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-xs text-gray-400 leading-none">家族成長</p>
            <p className="font-bold text-gray-800 leading-tight">カレンダー</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-warm-50 text-warm-500"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {user && (
          <div className="px-3 py-2 rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-700 truncate">{user.displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user.name}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
