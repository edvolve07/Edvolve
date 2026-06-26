import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb,
  BarChart3,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { COMMUNICATION_METRICS } from '@/src/constants';
import LoadingSkeleton from '@/src/portal/components/LoadingSkeleton';

function MetricBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm font-semibold text-slate-600">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right text-sm font-bold text-slate-800">{value}/10</span>
    </div>
  );
}

export default function CommunicationReport() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    apiFetch(`/api/communication/student/reports/${sessionId}`).then(setReport);
  }, [sessionId]);

  if (!report) return <LoadingSkeleton label="Loading report" />;

  const { overall, exchange_breakdown, strengths, areas_to_improve, tips } = report;
  const metrics = overall?.metrics || {};

  return (
    <section className="page-stack mx-auto max-w-5xl">
      <Link
        to="/communication"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Interview Practice
      </Link>

      <div className={`rounded-2xl border p-6 text-center ${
        overall?.grade === 'A' ? 'border-emerald-200 bg-emerald-50' :
        overall?.grade === 'B' ? 'border-blue-200 bg-blue-50' :
        overall?.grade === 'C' ? 'border-amber-200 bg-amber-50' :
        'border-red-200 bg-red-50'
      }`}>
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black text-white ${
          overall?.grade === 'A' ? 'bg-emerald-500' :
          overall?.grade === 'B' ? 'bg-blue-500' :
          overall?.grade === 'C' ? 'bg-amber-500' :
          'bg-red-500'
        }`}>
          {overall?.grade}
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900">
          {overall?.grade_label}
        </h2>
        <p className="mt-1 text-lg font-semibold text-slate-500">
          {overall?.percentage}% · {overall?.total_score}/{overall?.max_score}
        </p>
        <p className="mt-1 text-sm text-slate-400">{report.category} · {report.generated_date}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
          Interview Communication Scores
        </h3>
        <div className="space-y-3">
          {Object.entries(COMMUNICATION_METRICS).map(([key, { label, color }]) => (
            <MetricBar key={key} label={label} value={metrics[key] || 0} color={color} />
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Interview Strengths</h3>
          </div>
          <ul className="space-y-2">
            {(strengths || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
            {(!strengths || strengths.length === 0) && (
              <li className="text-sm text-emerald-600">No strengths recorded.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800">Areas to Improve</h3>
          </div>
          <ul className="space-y-2">
            {(areas_to_improve || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
            {(!areas_to_improve || areas_to_improve.length === 0) && (
              <li className="text-sm text-amber-600">Keep up the good work!</li>
            )}
          </ul>
        </div>
      </div>

      {tips && tips.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Interview Tips</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-bold text-amber-600">{i + 1}.</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {exchange_breakdown && exchange_breakdown.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Question Breakdown
              </h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {exchange_breakdown.map((ex, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <span>Q{ex.number}</span>
                  <span className="text-xs text-slate-400">
                    {ex.evaluation?.clarity || '?'}/{ex.evaluation?.structure || '?'}/{ex.evaluation?.conciseness || '?'}/{ex.evaluation?.relevance || '?'}/{ex.evaluation?.confidence_tone || '?'}
                  </span>
                </summary>
                <div className="border-t border-slate-100 px-5 py-3">
                  <p className="mb-1 text-xs font-semibold text-slate-400">Interviewer:</p>
                  <p className="mb-3 text-sm text-slate-700">{ex.prompt}</p>
                  <p className="mb-1 text-xs font-semibold text-slate-400">Your answer:</p>
                  <p className="text-sm text-slate-700">{ex.answer}</p>
                  {ex.evaluation && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {Object.entries(COMMUNICATION_METRICS).map(([key, { label, color }]) => (
                        <div key={key} className="rounded bg-slate-50 p-2 text-center">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm font-bold" style={{ color }}>{ex.evaluation[key] || 0}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link to="/communication" className="btn-primary gap-2">
          <ArrowLeft className="h-4 w-4" />
          Practice More Questions
        </Link>
      </div>
    </section>
  );
}
