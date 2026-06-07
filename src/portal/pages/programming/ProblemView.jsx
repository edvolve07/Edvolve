import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, BookOpen, Terminal, Beaker, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CodeEditor from '../../components/CodeEditor';
import { DEFAULT_CODE, PROGRAMMING_LANGUAGES as LANGUAGES, pickDefaultLanguage } from '../../utils/programmingLanguages';

const STATUS_ICONS = {
  accepted: CheckCircle2,
  wrong_answer: XCircle,
  time_limit_exceeded: Clock,
  runtime_error: AlertTriangle,
  compilation_error: AlertTriangle,
};

const STATUS_LABELS = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong Answer',
  time_limit_exceeded: 'Time Limit Exceeded',
  runtime_error: 'Runtime Error',
  compilation_error: 'Compilation Error',
  pending: 'Pending',
  running: 'Running',
};

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

function cleanDescription(text) {
  const markers = [
    /\n{1,2}\*\*Input\s*Format:?\s*\*\*/,
    /\n{1,2}\*\*Output\s*Format:?\s*\*\*/,
    /\n{1,2}\*\*Constraints:?\s*\*\*/,
  ];
  let earliest = text.length;
  for (const m of markers) {
    const idx = text.search(m);
    if (idx !== -1 && idx < earliest) earliest = idx;
  }
  return text.slice(0, earliest).trim();
}

function SectionCard({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-emerald-50/50"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-emerald-900">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-emerald-500" /> : <ChevronRight className="h-4 w-4 text-emerald-500" />}
      </button>
      {open && <div className="border-t border-emerald-50 px-5 py-4">{children}</div>}
    </div>
  );
}

export default function ProblemView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/programming/student/problems/${id}`).then((data) => {
      setProblem(data.problem);
      const lang = pickDefaultLanguage(data.problem.languages);
      setLanguage(lang);
      setCode(data.problem.starter_code?.[lang] || DEFAULT_CODE[lang] || '');
    });
  }, [id]);

  function handleLanguageChange(lang) {
    setLanguage(lang);
    setCode(problem?.starter_code?.[lang] || DEFAULT_CODE[lang] || '');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    setError('');
    try {
      const data = await apiFetch(`/programming/student/problems/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ code, language }),
      });
      setResult(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!problem) return <LoadingSkeleton label="Loading problem" />;

  const StatusIcon = result ? STATUS_ICONS[result.status] || null : null;

  return (
    <section className="page-stack mx-auto max-w-7xl">
      <Link
        to="/programming/practice"
        className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Problems
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-900">{problem.title}</h2>
            <p className="text-sm text-slate-500">{problem.concept}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-md border px-3 py-1 text-xs font-bold ${DIFFICULTY_STYLES[problem.difficulty] || ''}`}>
            {problem.difficulty}
          </span>
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Time: {problem.time_limit}s
          </span>
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Memory: {problem.memory_limit}MB
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-card">
            <div className="px-6 py-5">
              <div className="prose prose-sm max-w-none">
                <div className="text-[15px] leading-7 text-slate-700 whitespace-pre-wrap font-[450]">
                  {cleanDescription(problem.description)}
                </div>
              </div>
            </div>

            {(problem.input_format || problem.output_format) ? (
              <div className="grid gap-px bg-emerald-100 sm:grid-cols-2">
                {problem.input_format ? (
                  <div className="bg-white px-6 py-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <Terminal className="h-3.5 w-3.5" />
                      Input Format
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{problem.input_format}</p>
                  </div>
                ) : null}
                {problem.output_format ? (
                  <div className="bg-white px-6 py-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <Terminal className="h-3.5 w-3.5" />
                      Output Format
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{problem.output_format}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {problem.constraints ? (
              <div className="border-t border-emerald-50 bg-emerald-50/45 px-6 py-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <ListChecks className="h-3.5 w-3.5" />
                  Constraints
                </div>
                <div className="text-sm text-slate-700 leading-relaxed font-mono">
                  {problem.constraints.split(/,\s*/).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500 text-emerald-300" />
                      <span>{c.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <SectionCard icon={Beaker} title="Sample Test Cases">
            <div className="space-y-4">
              {problem.sample_test_cases.map((tc, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-emerald-100 bg-white">
                  <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-2">
                    <Beaker className="h-3.5 w-3.5 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-800">Sample {i + 1}</span>
                  </div>
                  <div className="grid gap-3 p-4 text-sm">
                    <div>
                      <span className="text-xs font-bold text-emerald-700">Input</span>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-emerald-950 p-3 font-mono text-xs text-emerald-100">{tc.input || '(empty)'}</pre>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-700">Output</span>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-emerald-950 p-3 font-mono text-xs text-emerald-100">{tc.output || '(empty)'}</pre>
                    </div>
                    {tc.explanation ? (
                      <div>
                        <span className="text-xs font-bold text-emerald-700">Explanation</span>
                        <p className="mt-1 text-sm text-slate-600">{tc.explanation}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              {problem.languages.map((lang) => {
                const l = LANGUAGES.find((l) => l.id === lang);
                return <option key={lang} value={lang}>{l?.label || lang}</option>;
              })}
            </select>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            minHeight={560}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !code.trim()}
              className="btn-primary flex-1 justify-center rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Submit Solution
                </>
              )}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-bold">Error</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          ) : null}

          {result ? (
            <div className="space-y-4">
              <div className={`rounded-xl border p-5 ${
                result.status === 'accepted'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3">
                  {StatusIcon ? (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      result.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                  ) : null}
                  <div>
                    <p className={`font-bold ${
                      result.status === 'accepted' ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      {STATUS_LABELS[result.status] || result.status}
                    </p>
                    <p className="text-sm text-slate-600">
                      Passed {result.passed_test_cases}/{result.total_test_cases} test cases
                      {result.execution_time_ms ? ` \u00b7 ${result.execution_time_ms}ms` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {result.test_results?.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Test Case Details</p>
                  <div className="divide-y divide-emerald-50 rounded-xl border border-emerald-100 bg-white shadow-card">
                    {result.test_results.map((tr, i) => (
                      <div key={i} className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {tr.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-semibold text-emerald-900">Test Case {i + 1}</span>
                          {tr.execution_time_ms ? (
                            <span className="text-xs text-slate-400">({tr.execution_time_ms}ms)</span>
                          ) : null}
                        </div>
                        {tr.error ? (
                          <p className="mt-2 text-xs text-red-600 font-mono whitespace-pre-wrap rounded-lg bg-red-50 p-2">{tr.error}</p>
                        ) : null}
                        {tr.input || tr.expected_output || tr.actual_output ? (
                          <div className="mt-2 grid gap-2 text-xs">
                            {tr.input ? (
                              <div>
                                <span className="font-bold text-slate-500">Input:</span>
                                <pre className="mt-0.5 rounded-md bg-emerald-50 p-2 font-mono">{tr.input}</pre>
                              </div>
                            ) : null}
                            {tr.expected_output ? (
                              <div>
                                <span className="font-bold text-slate-500">Expected:</span>
                                <pre className="mt-0.5 rounded-md bg-emerald-50 p-2 font-mono">{tr.expected_output}</pre>
                              </div>
                            ) : null}
                            {tr.actual_output ? (
                              <div>
                                <span className="font-bold text-slate-500">Output:</span>
                                <pre className="mt-0.5 rounded-md bg-emerald-50 p-2 font-mono">{tr.actual_output}</pre>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
