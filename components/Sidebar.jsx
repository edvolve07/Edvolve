import { Link, usePathname } from "@/src/navigation";
import { ChevronRight, Crown, Headphones, LogOut, Sparkles } from "lucide-react";
import clsx from "clsx";
import { APP_NAME, NAV_ITEMS } from "@/src/constants";
import { useAuth } from "@/src/portal/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ open = false, onClose = () => {} }) {
  const path = usePathname();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userModules = user?.modules_access || ["both"];
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role)) return false;
    if (item.modules && !item.modules.some((m) => userModules.includes(m))) return false;
    return true;
  });
  const activeHref = visibleItems
    .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  function handleLogout() {
    logout();
    onClose();
    navigate("/login");
  }

  return (
    <aside
      className={clsx(
        "sidebar fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-72 flex-col border-r border-white/10 bg-[radial-gradient(circle_at_30%_0%,rgba(5,150,105,0.35),transparent_34%),linear-gradient(180deg,#064e3b_0%,#053f31_48%,#042f25_100%)] shadow-sidebar transition-transform duration-200 sm:w-72",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center gap-3 px-6 pb-7 pt-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-emerald-900 shadow-sm">
          <Sparkles size={18} className="text-emerald-700" />
        </div>
        <div>
          <p className="text-[22px] font-black leading-none tracking-normal text-white">
            {APP_NAME} AI
          </p>
          <p className="mt-2 text-[13px] font-medium text-emerald-50">Practice. Improve. Crack it.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-5">
        {visibleItems.map(({ href, icon: Icon, label }) => {
          const active = activeHref === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={clsx("group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-bold transition-all duration-150",
                active ? "bg-emerald-600/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_22px_rgba(0,0,0,0.12)]" : "text-emerald-50 hover:bg-white/10 hover:text-white")}>
              <Icon size={20} className={clsx("transition-colors", active ? "text-white" : "text-emerald-100/80 group-hover:text-white")} />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {active && <ChevronRight size={15} className="text-emerald-100" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-5 px-5 pb-5">
        

        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
          <div className="flex items-center gap-3">
            <Headphones size={24} className="text-emerald-100" />
            <div>
              <p className="text-sm font-bold text-white">Need Help?</p>
              <p className="text-xs text-emerald-50">Contact Support</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
