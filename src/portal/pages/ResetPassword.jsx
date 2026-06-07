import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, ...form }),
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.details?.join(', ') || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-md border border-white/70 bg-white shadow-card-hover">
        <div className="bg-night px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-900">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-black">PrepUp</p>
              <p className="text-xs font-semibold text-slate-300">Create a new password</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-800">Secure reset</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Set new password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Reset links expire after 5 minutes. Request a new link if this one no longer works.
          </p>

          {!token ? (
            <div className="mt-6 rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              This reset link is missing a token.
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-bold text-slate-700">
            New password
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                minLength="8"
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="field pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Confirm password
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                minLength="8"
                required
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                className="field pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button disabled={loading || !token} className="btn-primary mt-6 w-full">
            <KeyRound className="h-4 w-4" />
            {loading ? 'Resetting...' : 'Reset password'}
          </button>

          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-800" to="/login">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </form>
      </section>
    </main>
  );
}
