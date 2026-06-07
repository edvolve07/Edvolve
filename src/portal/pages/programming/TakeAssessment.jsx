import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle, Save, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import CodeEditor from '../../components/CodeEditor';
import { DEFAULT_CODE, PROGRAMMING_LANGUAGES as LANGUAGES, pickDefaultLanguage } from '../../utils/programmingLanguages';

export default function TakeAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [problems, setProblems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [codes, setCodes] = useState({});
  const [languages, setLanguages] = useState({});
  const [saving, setSaving] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState('');
  const saveTimerRef = useRef({});

  useEffect(() => {
    async function init() {
      try {
        const res = await apiFetch(`/api/programming-assessment/student/assessments/${assessmentId}/start`, { method: 'POST' });
        setAttempt(res.attempt);
        setAssessment(res.assessment);
        setProblems(res.problems);
        const initialCodes = {};
        const initialLangs = {};
        for (const p of res.problems) {
          const selectedLanguage = p.answer?.language || pickDefaultLanguage(p.languages || []);
          initialCodes[p.id] = p.answer?.code || p.starter_code?.[selectedLanguage] || DEFAULT_CODE[selectedLanguage] || '';
          initialLangs[p.id] = selectedLanguage;
        }
        setCodes(initialCodes);
        setLanguages(initialLangs);
      } catch {
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [assessmentId]);

  const activeProblem = problems[activeIndex];

  function handleCodeChange(problemId, value) {
    setCodes((prev) => ({ ...prev, [problemId]: value }));
  }

  function handleLanguageChange(problemId, lang) {
    setLanguages((prev) => ({ ...prev, [problemId]: lang }));
    const problem = problems.find((p) => p.id === problemId);
    if (!codes[problemId] || codes[problemId].trim() === (problem?.answer?.code || '').trim()) {
      setCodes((prev) => ({
        ...prev,
        [problemId]: problem?.starter_code?.[lang] || DEFAULT_CODE[lang] || '',
      }));
    }
  }

  const autoSave = useCallback(async (problemId) => {
    if (!attempt) return;
    setSaving((prev) => ({ ...prev, [problemId]: true }));
    try {
      await apiFetch(`/api/programming-assessment/student/attempts/${attempt.id}/answers/${problemId}`, {
        method: 'PUT',
        body: JSON.stringify({ code: codes[problemId] || '', language: languages[problemId] || 'javascript' }),
      });
    } catch {
    } finally {
      setSaving((prev) => ({ ...prev, [problemId]: false }));
    }
  }, [attempt, codes, languages]);

  useEffect(() => {
    if (!attempt || !activeProblem) return;
    const timer = setTimeout(() => autoSave(activeProblem.id), 2000);
    return () => clearTimeout(timer);
  }, [attempt, activeProblem?.id, codes[activeProblem?.id], autoSave]);

  async function handleSaveNow() {
    if (!attempt || !activeProblem) return;
    await autoSave(activeProblem.id);
  }

  async function handleSubmit() {
    if (!window.confirm('Submit all answers? This action cannot be undone.')) return;
    if (!attempt) return;
    setSubmitting(true);
    setError('');
    try {
      for (const p of problems) {
        await apiFetch(`/api/programming-assessment/student/attempts/${attempt.id}/answers/${p.id}`, {
          method: 'PUT',
          body: JSON.stringify({ code: codes[p.id] || '', language: languages[p.id] || 'javascript' }),
        });
      }
      const res = await apiFetch(`/api/programming-assessment/student/attempts/${attempt.id}/submit`, { method: 'POST' });
      setSubmitResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton label="Loading assessment" />;

  if (error && !attempt) {
    return (
      <section className="page-stack">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </section>
    );
  }

  if (submitResult) {
    return (
      <section className="page-stack">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-3 text-xl font-bold text-emerald-800">Assessment Submitted!</h2>
          <p className="mt-1 text-emerald-600">
            Score: {submitResult.attempt.obtained_marks}/{submitResult.attempt.total_marks}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate(`/programming/assessments/results/${submitResult.attempt.id}`)}
              className="btn-primary"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/programming/assessments')}
              className="btn-secondary"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="flex items-center justify-between">
        <Link
          to="/programming/assessments"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {activeIndex + 1} / {problems.length} problems
          </span>
          <button
            onClick={handleSaveNow}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving[activeProblem?.id] ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Submit All</>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {problems.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
              i === activeIndex
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : codes[p.id]?.trim()
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
          >
            {i + 1}. {p.title}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>
      ) : null}

      {activeProblem ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{activeProblem.title}</h2>
              <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
                activeProblem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                activeProblem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {activeProblem.difficulty}
              </span>
              <span className="text-xs text-slate-400">({activeProblem.marks} marks)</span>
            </div>
            <p className="text-sm text-slate-500">{activeProblem.concept}</p>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {activeProblem.description}
            </div>

            {activeProblem.constraints ? (
              <div>
                <h3 className="text-sm font-bold text-slate-900">Constraints</h3>
                <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{activeProblem.constraints}</p>
              </div>
            ) : null}

            {activeProblem.sample_test_cases?.length ? (
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sample Test Cases</h3>
                <div className="mt-2 space-y-3">
                  {activeProblem.sample_test_cases.map((tc, i) => (
                    <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">Sample {i + 1}</p>
                      <div className="mt-1 grid gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-slate-600">Input:</span>
                          <pre className="mt-0.5 rounded bg-slate-100 p-2 text-xs">{tc.input || '(empty)'}</pre>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Output:</span>
                          <pre className="mt-0.5 rounded bg-slate-100 p-2 text-xs">{tc.output || '(empty)'}</pre>
                        </div>
                        {tc.explanation ? (
                          <div>
                            <span className="font-semibold text-slate-600">Explanation:</span>
                            <p className="mt-0.5 text-xs text-slate-600">{tc.explanation}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <select
                value={languages[activeProblem.id] || 'javascript'}
                onChange={(e) => handleLanguageChange(activeProblem.id, e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {(activeProblem.languages || ['javascript']).map((lang) => {
                  const l = LANGUAGES.find((l) => l.id === lang);
                  return <option key={lang} value={lang}>{l?.label || lang}</option>;
                })}
              </select>
              <span className="text-xs text-slate-400">
                Time: {activeProblem.time_limit}s | Mem: {activeProblem.memory_limit}MB
              </span>
            </div>

            <CodeEditor
              value={codes[activeProblem.id] || ''}
              onChange={(value) => handleCodeChange(activeProblem.id, value)}
              language={languages[activeProblem.id] || 'javascript'}
              minHeight={560}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
