import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Code2, Edit, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function MasterAdminProblems() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch('/api/programming/master/problems').then(setData);
  }, []);

  async function handleToggleStatus(problem) {
    const newStatus = problem.status === 'published' ? 'draft' : 'published';
    await apiFetch(`/api/programming/master/problems/${problem.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    setData((prev) => ({
      ...prev,
      problems: prev.problems.map((p) =>
        p.id === problem.id ? { ...p, status: newStatus } : p
      ),
    }));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this problem?')) return;
    await apiFetch(`/api/programming/master/problems/${id}`, { method: 'DELETE' });
    setData((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== id),
    }));
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="h-32 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-600">Master admin tools</p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Programming Challenges
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage coding problems for students.
            </p>
          </div>
          <Link
            to="/master-admin/programming/create"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Create Problem
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Concept</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Acceptance</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.problems.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan="7">
                    No problems yet. Create your first one!
                  </td>
                </tr>
              ) : (
                data.problems.map((problem) => (
                  <tr key={problem.id} className="text-slate-600 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold text-slate-950">{problem.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{problem.concept}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(problem)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold transition ${
                          problem.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {problem.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {problem.total_submissions}
                      <p className="text-xs text-slate-400">{problem.total_accepted} accepted</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold">{problem.acceptance_rate || 0}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/master-admin/programming/${problem.id}/edit`}
                          className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(problem.id)}
                          className="rounded-md border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
