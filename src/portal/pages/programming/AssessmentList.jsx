import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardCheck, Play, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AssessmentList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    apiFetch('/api/programming-assessment/student/assessments').then(setData);
  }, []);

  async function handleStart(id) {
    setStarting(id);
    try {
      const res = await apiFetch(`/api/programming-assessment/student/assessments/${id}/start`, { method: 'POST' });
      navigate(`/programming/assessments/${id}`, { state: { attempt: res.attempt, problems: res.problems, assessment: res.assessment } });
    } catch {
      setStarting(null);
    }
  }

  if (!data) return <LoadingSkeleton label="Loading assessments" />;

  return (
    <section className="page-stack">
      <Link
        to="/programming"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Programming
      </Link>

      <h1 className="text-3xl font-black text-slate-900">Programming Assessments</h1>
      <p className="text-slate-500">Curated multi-problem coding tests — start anytime, submit when ready</p>

      {data.assessments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-500">No assessments available yet</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.assessments.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900">{a.title}</h3>
              {a.description ? (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{a.description}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {a.problem_count} problems
                </span>
              </div>
              {a.attempt ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3">
                  {a.attempt.status === 'submitted' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-slate-600">
                        Score: {a.attempt.obtained_marks}/{a.attempt.total_marks}
                      </span>
                      <button
                        onClick={() => navigate(`/programming/assessments/results/${a.attempt.id}`)}
                        className="ml-auto text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        View
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/programming/assessments/${a.id}`, { state: {} })}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      <Play className="h-4 w-4" />
                      Resume
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleStart(a.id)}
                  disabled={starting === a.id}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {starting === a.id ? 'Starting...' : 'Start Assessment'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
