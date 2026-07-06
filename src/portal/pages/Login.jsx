import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

function homeForRole(role) {
  if (role === 'master_admin') return '/master-admin-dashboard';
  if (role === 'admin') return '/admin-dashboard';
  return '/dashboard';
}

export default function Login() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const platformHighlights = [
    'Mock interviews with AI-driven feedback and scoring',
    'Aptitude tests with instant scores and smart insights',
    'Reports that turn every attempt into a clear next step',
  ];

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      loginWithToken(data.token, data.user);
      toast.success('Logged in successfully');
      navigate(homeForRole(data.user?.role), { replace: true });
    } catch (error) {
      const message = error.message || 'Unable to sign in. Check your backend connection and credentials.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f4f7f6 50%, #ecfdf5 100%)' }}>
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-emerald-200" />
            </span>
            <div>
              <p className="text-2xl font-black tracking-tight">Edvols</p>
              <p className="text-sm font-medium text-emerald-200/80">Placement readiness workspace</p>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Your placement command center</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight text-white">
              Train smarter.<br />Test faster.<br />Walk in prepared.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-emerald-100/80">
              Edvols combines AI mock interviews, aptitude practice, coding challenges, and performance analytics into one focused workspace.
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            {platformHighlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm transition hover:bg-white/15">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                <span className="text-sm font-semibold text-emerald-50">{item}</span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        </div>

        <form onSubmit={submit} className="bg-white p-8 sm:p-12">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-800 to-emerald-900 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <p className="text-xl font-black text-emerald-900">Edvols</p>
            </div>
          </div>

          <div className="mt-10 lg:mt-0">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to Edvols</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Resume your interviews, check aptitude results, and track your progress.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Password</span>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Link className="text-sm font-bold text-emerald-700 transition hover:text-emerald-800" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:from-emerald-600 hover:to-emerald-500 hover:shadow-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            New here?{' '}
            <Link className="font-bold text-emerald-700 transition hover:text-emerald-800" to="/signup">
              Create account <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
