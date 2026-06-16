import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, BookOpenCheck, Clock3, Code2, Download, FilePlus2, Loader2, Mic2, Users } from "lucide-react";
import { Link } from "@/src/navigation";
import { apiFetch, downloadAdminExport, downloadCodingProgressExport } from "@/lib/api";
import { useAuth } from "@/src/portal/context/AuthContext";

function StatCard({ label, value, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-emerald-50 text-emerald-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <p className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">{value ?? 0}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function PrepupAdminDashboard() {
  const { user } = useAuth();
  const userModules = user?.modules_access || ["both"];
  const hasAptitude = userModules.includes("aptitude") || userModules.includes("both");
  const hasInterview = userModules.includes("ai_interview") || userModules.includes("both");
  const hasProgramming = userModules.includes("programming") || userModules.includes("both");
  const [stats, setStats] = useState(null);
  const [programmingStats, setProgrammingStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch("/api/admin/dashboard")
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load admin dashboard.");
      });

    if (hasProgramming) {
      apiFetch("/api/programming/admin/dashboard")
        .then((data) => {
          if (active) setProgrammingStats(data);
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm font-medium text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-500" />
        Loading admin dashboard
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-600">Lecturer workspace</p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Create assessments and review aptitude or interview analytics from dedicated pages.
            </p>
          </div>
          <Link
            href="/admin/assessments/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-emerald-600 sm:w-auto"
          >
            Create assessment <FilePlus2 size={16} />
          </Link>
        </div>
      </section>

      {hasAptitude ? (
        <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Assessments" value={stats.assessments} icon={BookOpenCheck} />
          <StatCard label="Published" value={stats.published} icon={BarChart3} tone="green" />
          <StatCard label="Students" value={stats.students} icon={Users} tone="amber" />
          <StatCard label="Submissions" value={stats.submitted_attempts} icon={Clock3} tone="slate" />
        </section>
      ) : null}

      {hasAptitude ? (
        <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <StatCard label="In progress" value={stats.in_progress_attempts} icon={Clock3} />
          <StatCard label="Aptitude pass rate" value={`${stats.pass_rate ?? 0}%`} icon={BarChart3} tone="green" />
          <StatCard label="Average aptitude score" value={`${stats.average_percentage ?? 0}%`} icon={BookOpenCheck} tone="amber" />
        </section>
      ) : null}

      {hasInterview ? (
        <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4">
          <StatCard label="Interview reports" value={stats.interview_analytics?.reports} icon={Mic2} />
          <StatCard
            label="Average interview score"
            value={`${stats.interview_analytics?.average_percentage ?? 0}%`}
            icon={BarChart3}
            tone="green"
          />
        </section>
      ) : null}

      {hasProgramming && programmingStats ? (
        <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Coding Problems" value={programmingStats.total_problems} icon={Code2} tone="brand" />
          <StatCard label="Published" value={programmingStats.published_problems} icon={BarChart3} tone="green" />
          <StatCard label="Submissions" value={programmingStats.total_submissions} icon={Users} tone="amber" />
          <StatCard label="Acceptance Rate" value={`${programmingStats.acceptance_rate ?? 0}%`} icon={BarChart3} tone="slate" />
        </section>
      ) : null}

      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-950">Detailed Export Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Download Excel or PDF reports for institution review.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["student-performance", "Student performance"],
            ["assessment-results", "Assessment results"],
            ["interview-readiness", "Interview readiness"],
            ["inactive-students", "Inactive students"],
          ].map(([type, label]) => (
            <div key={type} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => downloadAdminExport(type, "xlsx")} className="rounded-lg bg-white p-2 text-emerald-700 hover:bg-emerald-50" title={`${label} Excel`}>
                  <Download className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => downloadAdminExport(type, "pdf")} className="rounded-lg bg-white p-2 text-slate-700 hover:bg-slate-100" title={`${label} PDF`}>
                  PDF
                </button>
              </div>
            </div>
          ))}
          {hasProgramming ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-bold text-slate-700">Coding progress</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => downloadCodingProgressExport("xlsx")} className="rounded-lg bg-white p-2 text-emerald-700 hover:bg-emerald-50" title="Coding progress Excel">
                  <Download className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => downloadCodingProgressExport("pdf")} className="rounded-lg bg-white p-2 text-slate-700 hover:bg-slate-100" title="Coding progress PDF">
                  PDF
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {hasAptitude ? (
          <Link
            href="/admin/analytics/aptitude"
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpenCheck size={19} />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-950 sm:text-xl">Aptitude Analytics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              See each student&apos;s latest aptitude result first, then open all attempts for that student.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Open aptitude analytics <ArrowRight size={15} />
            </span>
          </Link>
        ) : null}

        {hasInterview ? (
          <Link
            href="/admin/analytics/interviews"
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mic2 size={19} />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-950 sm:text-xl">Interview Analytics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review student interview reports, scores, grades, ATS scores, and full report details.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Open interview analytics <ArrowRight size={15} />
            </span>
          </Link>
        ) : null}

        {hasProgramming ? (
          <Link
            href="/admin/programming"
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Code2 size={19} />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-950 sm:text-xl">Programming Problems</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create and manage coding problems, review student submissions and track progress.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Manage problems <ArrowRight size={15} />
            </span>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
