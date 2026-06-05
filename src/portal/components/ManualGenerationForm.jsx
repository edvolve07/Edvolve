import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Minus, Plus, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

const concepts = [
  'All Concepts',
  'Percentages',
  'Profit and Loss',
  'Ratio and Proportion',
  'Time and Work',
  'Time, Speed and Distance',
  'Number System',
  'Simplification',
  'Averages',
  'Mixtures and Allegations',
  'Permutation and Combination',
  'Probability',
  'Simple Interest',
  'Compound Interest',
  'Data Interpretation',
  'Logical Reasoning',
  'Verbal Ability',
  'Coding-Decoding',
  'Blood Relations',
  'Seating Arrangement',
  'Puzzles',
];

const singleConceptCount = concepts.length - 1;

export default function ManualGenerationForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    concept: 'All Concepts',
    difficulty: 'Mixed',
    perConcept: 5,
    totalQuestions: 30,
    duration_minutes: 60,
    marks_per_question: 1,
    negative_marks: 0.25,
    passing_marks: 20,
    start_time: '',
    end_time: '',
    status: 'draft',
    generation_mode: 'fast',
    file: null,
  });

  const questionCount = useMemo(
    () => (form.concept === 'All Concepts' ? form.perConcept * singleConceptCount : form.totalQuestions),
    [form.concept, form.perConcept, form.totalQuestions],
  );

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function step(key, delta, min = 1) {
    setField(key, Math.max(min, Number(form[key]) + delta));
  }

  async function submit(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const payload = new FormData();

    payload.append('title', form.title.trim());
    payload.append('concept', form.concept);
    payload.append('difficulty', form.difficulty);

    payload.append('question_count', String(questionCount));
    payload.append('questionCount', String(questionCount));

    if (form.concept === 'All Concepts') {
      payload.append('questions_per_concept', String(form.perConcept));
      payload.append('questionsPerConcept', String(form.perConcept));
    } else {
      payload.append('total_questions', String(form.totalQuestions));
      payload.append('totalQuestions', String(form.totalQuestions));
    }

    payload.append('duration_minutes', String(form.duration_minutes));
    payload.append('durationMinutes', String(form.duration_minutes));

    payload.append('marks_per_question', String(form.marks_per_question));
    payload.append('marksPerQuestion', String(form.marks_per_question));

    payload.append('negative_marks', String(form.negative_marks));
    payload.append('negativeMarks', String(form.negative_marks));

    payload.append('passing_marks', String(form.passing_marks));
    payload.append('passingMarks', String(form.passing_marks));

    payload.append('status', form.status);
    payload.append('generation_mode', form.generation_mode);

    if (form.start_time) {
      const [datePart, timePart] = form.start_time.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      const startISO = new Date(y, m - 1, d, hh, mm).toISOString();
      payload.append('start_time', startISO);
      payload.append('startTime', startISO);
    }

    if (form.end_time) {
      const [datePart, timePart] = form.end_time.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      const endISO = new Date(y, m - 1, d, hh, mm).toISOString();
      payload.append('end_time', endISO);
      payload.append('endTime', endISO);
    }

    if (form.file) payload.append('file', form.file);

    const data = await apiFetch('/admin/assessments/generate', {
      method: 'POST',
      body: payload,
    });

    toast.success('Questions generated and saved as an assessment');
    navigate(`/admin/assessments/${data.assessment.id}/questions`);
  } catch (error) {
    toast.error(error.details?.join(', ') || error.message || 'Failed to generate assessment');
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={submit} className="page-stack">
      <div className="page-hero">
        <p className="eyebrow">AI Builder</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Create Assessment</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select the assessment shape, then let the backend AI agent build editable MCQs.
        </p>
      </div>

      <section className="surface p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Assessment Title
          <input
            required
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            className="field"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Concept
          <select
            value={form.concept}
            onChange={(event) => setField('concept', event.target.value)}
            className="field"
          >
            {concepts.map((concept) => (
              <option key={concept}>{concept}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Difficulty
          <select
            value={form.difficulty}
            onChange={(event) => setField('difficulty', event.target.value)}
            className="field"
          >
            {['Easy', 'Medium', 'Hard', 'Mixed'].map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Status
          <select
            value={form.status}
            onChange={(event) => setField('status', event.target.value)}
            className="field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Generation Mode
          <select
            value={form.generation_mode}
            onChange={(event) => setField('generation_mode', event.target.value)}
            className="field"
          >
            <option value="fast">Fast</option>
            <option value="ai">AI Enhanced</option>
          </select>
        </label>
      </div>
      </section>

      <section className="rounded-md border border-indigo-100 bg-indigo-50/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-ink">
              {form.concept === 'All Concepts' ? 'Questions Per Concept' : 'Total Questions'}
            </p>
            <p className="text-xs font-semibold text-slate-500">Generated total: {questionCount} questions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(form.concept === 'All Concepts' ? 'perConcept' : 'totalQuestions', -1)}
              className="focus-ring rounded-md border border-slate-200 bg-white p-2"
              title="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-lg font-bold">
              {form.concept === 'All Concepts' ? form.perConcept : form.totalQuestions}
            </span>
            <button
              type="button"
              onClick={() => step(form.concept === 'All Concepts' ? 'perConcept' : 'totalQuestions', 1)}
              className="focus-ring rounded-md border border-slate-200 bg-white p-2"
              title="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="surface p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['duration_minutes', 'Duration in minutes', 1],
          ['marks_per_question', 'Marks per question', 0.25],
          ['negative_marks', 'Negative marks', 0.25],
          ['passing_marks', 'Passing marks', 0.25],
        ].map(([key, label, stepValue]) => (
          <label key={key} className="text-sm font-semibold text-slate-700">
            {label}
            <input
              type="number"
              min="0"
              step={stepValue}
              value={form[key]}
              onChange={(event) => setField(key, event.target.value)}
              className="field"
            />
          </label>
        ))}
        <label className="text-sm font-semibold text-slate-700">
          Start time
          <input
            type="datetime-local"
            value={form.start_time}
            onChange={(event) => setField('start_time', event.target.value)}
            className="field"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          End time
          <input
            type="datetime-local"
            value={form.end_time}
            onChange={(event) => setField('end_time', event.target.value)}
            className="field"
          />
        </label>
      </div>
      </section>

      <section className="surface p-6">
        <label className="block text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand" />
            Optional source file
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setField('file', event.target.files?.[0] || null)}
            className="mt-3 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 focus-ring"
          />
        </label>
      </section>

      <button
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Generating questions...' : 'Generate Questions'}
      </button>
    </form>
  );
}
