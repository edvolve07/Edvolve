import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Code2, Edit, Trash2 } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { apiFetch } from '../../utils/api';

export default function AdminProblems() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch('/programming/admin/problems').then(setData);
  }, []);

  async function handleToggleStatus(problem) {
    const newStatus = problem.status === 'published' ? 'draft' : 'published';
    await apiFetch(`/programming/admin/problems/${problem.id}/status`, {
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
    await apiFetch(`/programming/admin/problems/${id}`, { method: 'DELETE' });
    setData((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== id),
    }));
  }

  if (!data) return <LoadingSkeleton label="Loading problems" />;

  return (
    <section className="page-stack">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Programming Admin</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Manage Problems</h2>
        </div>
        <Link to="/admin/programming/create" className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Problem
        </Link>
      </div>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="dashboard-table w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th>Title</th>
                <th>Concept</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Submissions</th>
                <th>Acceptance</th>
                <th>Actions</th>
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
                  <tr key={problem.id} className="hover:bg-slate-50/70">
                    <td className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-emerald-500" />
                        {problem.title}
                      </div>
                    </td>
                    <td>{problem.concept}</td>
                    <td>
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
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
                    <td>
                      {problem.total_submissions}
                      <p className="text-xs text-slate-500">{problem.total_accepted} accepted</p>
                    </td>
                    <td className="font-bold">{problem.acceptance_rate || 0}%</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/programming/${problem.id}/edit`}
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
      </div>
    </section>
  );
}
