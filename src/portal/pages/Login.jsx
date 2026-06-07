import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
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
    'Practice interviews that feel close to the real round',
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
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-md border border-white/70 bg-white shadow-card-hover lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-night p-8 text-white lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-900">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-black">PrepUp</p>
              <p className="text-xs font-semibold text-slate-300">Placement readiness, made sharper</p>
            </div>
          </div>
          <div className="mt-16">
            <p className="text-sm font-bold uppercase text-teal-300">Your placement command center</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              Train smarter. Test faster. Walk into interviews prepared.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              PrepUp brings mock interviews &  aptitude practice into one focused workspace.
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            {platformHighlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-white/[0.06] p-3">
                <CheckCircle2 className="h-4 w-4 text-teal-300" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-10">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-night text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-xl font-black text-slate-900">PrepUp</p>
            </div>
          </div>
          <p className="mt-8 text-sm font-bold uppercase text-emerald-800 lg:mt-0">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in to PrepUp</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pick up exactly where you left off: interviews, aptitude practice, scorecards, and progress analytics.
          </p>
          {errorMessage ? (
            <div className="mt-5 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}
          

          <label className="mt-8 block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="field"
              placeholder="you@example.com"
            />
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            Password
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="field pr-10"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="mt-3 flex justify-end">
            <Link className="text-sm font-black text-emerald-800" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button disabled={loading} className="btn-primary mt-6 w-full">
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1 text-center text-sm text-slate-600">
            New here?
            <Link className="inline-flex items-center gap-1 font-black text-emerald-800" to="/signup">
              Create account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
