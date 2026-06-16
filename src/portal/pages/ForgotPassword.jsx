import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success('Password reset link sent');
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
              <p className="text-lg font-black">Edvolve</p>
              <p className="text-xs font-semibold text-slate-300">Password recovery</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-800">Reset access</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Forgot password?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your account email and we will send a password reset link that works for 5 minutes.
          </p>

          {sent ? (
            <div className="mt-6 rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Check your inbox for the reset link. It expires in 5 minutes.
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </label>

          <button disabled={loading} className="btn-primary mt-6 w-full">
            <Mail className="h-4 w-4" />
            {loading ? 'Sending link...' : 'Send reset link'}
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
