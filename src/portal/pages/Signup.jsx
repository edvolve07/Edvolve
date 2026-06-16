import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpenCheck, Eye, EyeOff, Mic2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

function homeForRole(role) {
  if (role === 'master_admin') return '/master-admin-dashboard';
  if (role === 'admin') return '/admin-dashboard';
  return '/dashboard';
}

export default function Signup() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const platformCards = [
    {
      title: 'Interview arena',
      description: 'Practice with AI questions, answer naturally, and get a scorecard.',
      icon: Mic2,
    },
    {
      title: 'Aptitude edge',
      description: 'Take published tests, track attempts, and spot weak topics fast.',
      icon: BookOpenCheck,
    },
    {
      title: 'Live progress',
      description: 'See fresh analytics for students, lecturers, and master admins.',
      icon: BarChart3,
    },
  ];

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      loginWithToken(data.token, data.user);
      toast.success('Account created');
      navigate(homeForRole(data.user.role));
    } catch (error) {
      toast.error(error.details?.join(', ') || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-3xl overflow-hidden rounded-md border border-white/70 bg-white shadow-card-hover">
        <div className="bg-night px-6 py-5 text-white sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-900">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-black">Edvolve</p>
                <p className="text-xs font-semibold text-slate-300">Build your placement-ready profile</p>
              </div>
            </div>
            <ShieldCheck className="hidden h-6 w-6 text-teal-300 sm:block" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {platformCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-md bg-white/[0.06] p-3">
                <Icon className="h-4 w-4 text-teal-300" />
                <p className="mt-2 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-800">Start your Edvolve journey</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create one account for interviews, aptitude practice, reports, and analytics. New users start as students, while lecturer and master admin access is assigned from approved emails.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Full Name
              <input
                required
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  minLength="8"
                  required
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  className="field pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Confirm Password
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  minLength="8"
                  required
                  value={form.confirmPassword}
                  onChange={(event) => update('confirmPassword', event.target.value)}
                  className="field pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </div>
          <button disabled={loading} className="btn-primary mt-6 w-full">
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1 text-center text-sm text-slate-600">
            Already have an account?
            <Link className="inline-flex items-center gap-1 font-black text-emerald-800" to="/login">
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
