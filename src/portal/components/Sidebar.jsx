import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Code2,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/assessments/create', label: 'Create Assessment', icon: FilePlus2 },
  { to: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/admin/programming', label: 'Programming Problems', icon: Code2 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/assessments', label: 'Available Assessments', icon: BookOpenCheck },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;
  const home = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function renderLinks(compact = false) {
    return links.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            compact
              ? `inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold shadow-sm ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-emerald-100 bg-white text-emerald-900 hover:bg-emerald-50'
                }`
              : `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`
          }
        >
          {({ isActive }) => (
            <>
              {!compact ? (
                <span
                  className={`absolute left-0 h-6 w-1 rounded-r ${
                    isActive ? 'bg-emerald-400' : 'bg-transparent'
                  }`}
                />
              ) : null}
              <Icon
                className={`h-4 w-4 ${
                    isActive
                      ? compact
                      ? 'text-emerald-900'
                      : 'text-emerald-200'
                    : compact
                      ? 'text-emerald-700'
                      : 'text-emerald-200/75 group-hover:text-white'
                }`}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      );
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="sidebar fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 p-5 text-white shadow-sidebar lg:block">
        <Link to={home} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="text-lg font-black">PrepUp</span>
            <span className="block text-xs font-semibold text-emerald-100">
              {role === 'admin' ? 'Assessment Admin' : 'Student Prep'}
            </span>
          </span>
        </Link>

        <div className="mt-5 rounded-md border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-bold uppercase text-emerald-100/70">{role}</p>
          <p className="mt-1 truncate text-sm font-bold text-white">{user?.name}</p>
          <p className="truncate text-xs text-emerald-100/80">{user?.email}</p>
        </div>

        <div className="mt-7 border-t border-white/10 pt-5">
          <p className="mb-3 px-3 text-xs font-bold uppercase text-emerald-100/70">Navigation</p>
          <nav className="space-y-1.5">{renderLinks()}</nav>
        </div>

        <button
          onClick={handleLogout}
          className="focus-ring absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">{role === 'admin' ? 'Admin Console' : 'Student Portal'}</p>
              <h1 className="text-lg font-black text-emerald-900">{user?.name}</h1>
            </div>
            <button onClick={handleLogout} className="btn-secondary px-3 py-2 lg:hidden">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">{renderLinks(true)}</nav>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
