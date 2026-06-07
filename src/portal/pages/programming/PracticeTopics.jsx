import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Layers, AlertTriangle } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { apiFetch } from '../../utils/api';

export default function PracticeTopics() {
  const [topics, setTopics] = useState([]);
  const [counts, setCounts] = useState({});
  const [solvedCounts, setSolvedCounts] = useState({});
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiFetch('/programming/student/concepts')
      .then((res) => {
        if (cancelled) return;
        const conceptList = res.concepts || [];
        const countsMap = res.counts || {};
        const solvedMap = res.solved_counts || {};
        const progressMap = res.progress || {};

        setTopics(conceptList);
        setCounts(countsMap);
        setSolvedCounts(solvedMap);
        setProgress(progressMap);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load topics');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalProblems = topics.reduce((sum, topic) => sum + (counts[topic] || 0), 0);
  const totalSolved = topics.reduce((sum, topic) => sum + (solvedCounts[topic] || 0), 0);
  const overallProgress = totalProblems ? Math.round((totalSolved / totalProblems) * 100) : 0;

  if (loading) return <LoadingSkeleton label="Loading topics" />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-3 text-sm font-bold text-red-700">Failed to load topics</p>
        <p className="mt-1 text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="page-stack max-w-5xl mx-auto pb-16">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Programming Practice</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Choose a Topic</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Select a topic below to practice coding problems and sharpen your skills
          </p>
        </div>
        <div className="min-w-[220px] rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Overall progress</p>
            <p className="text-sm font-black text-emerald-800">{overallProgress}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {totalSolved} of {totalProblems} problems solved
          </p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">No topics available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => {
            const total = counts[topic] || 0;
            const solved = solvedCounts[topic] || 0;
            const percent = progress[topic] || 0;
            const complete = total > 0 && solved >= total;

            return (
              <Link
                key={topic}
                to={`/programming/practice/topics/${encodeURIComponent(topic)}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-600">
                    {percent}%
                  </span>
                </div>
                <div className="mt-3">
                  <p className="font-bold text-slate-900 text-lg group-hover:text-emerald-800 transition-colors">
                    {topic}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {solved} solved of {total} problems
                  </p>
                </div>
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-emerald-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-emerald-600">
                    {complete ? 'Topic completed' : solved > 0 ? 'Keep going' : 'Start practicing'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-800 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
