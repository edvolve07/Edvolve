import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "../../navigation";
import LoadingSkeleton from "./LoadingSkeleton";
import { getStudentAssessments, isUnauthorizedError } from "@/lib/api";

function formatDateTime(value) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(new Date(value));
}

export default function StudentAssessments() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      if (!active) return;
      setError("API request timed out. Backend may be offline.");
      setLoading(false);
    }, 5000);
    
    getStudentAssessments()
      .then((data) => {
        if (!active) return;
        clearTimeout(timeout);
        setAssessments(data.assessments || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        clearTimeout(timeout);
        if (isUnauthorizedError(err)) {
          navigate("/login", { replace: true });
          return;
        }
        setError(err.message || "Unable to load assessments");
        setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (loading) return <LoadingSkeleton label="Loading assessments" />;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-sm">Make sure the backend API is running at http://localhost:8000</p>
        </div>
      </div>
    );
  }

  if (!assessments) return <LoadingSkeleton label="Loading assessments" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-600">Assessment library</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Available aptitude assessments</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Choose an assessment and continue your latest in-progress attempt when available.
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
          No assessments are available right now.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {assessments.map((assessment) => {
            const assessmentId = assessment.id || assessment._id;
            return (
            <article
              key={assessmentId}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{assessment.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">{assessment.concept}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{assessment.difficulty}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/aptitude/${assessmentId}/start`)}
                  disabled={!assessmentId}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  <Play size={16} />
                  Start
                </button>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-3 py-3">Duration: {assessment.duration_minutes} min</div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">Total marks: {assessment.total_marks}</div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">Passing: {assessment.passing_marks}</div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">Starts {formatDateTime(assessment.start_time)}</div>
              </div>
            </article>
          );
          })}
        </div>
      )}
    </div>
  );
}
