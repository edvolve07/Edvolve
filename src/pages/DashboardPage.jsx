import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Award,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  Code2,
  Download,
  FileText,
  Flame,
  ListChecks,
  Mic2,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import { METRIC_LABELS } from "@/src/constants";
import { Link } from "@/src/navigation";
import { useAuth } from "@/src/portal/context/AuthContext";
import { apiFetch, downloadCertificatePdf } from "@/lib/api";
import { getTimeBasedGreeting } from "@/src/utils/timeGreeting";

const moduleLabels = {
  aptitude: "Aptitude",
  ai_interview: "Interview",
  programming: "Programming",
  both: "All modules",
};

const toneClass = {
  brand: "from-emerald-500 to-emerald-800 text-white",
  green: "from-teal-500 to-emerald-800 text-white",
  amber: "from-amber-400 to-amber-600 text-white",
  blue: "from-sky-500 to-emerald-700 text-white",
};

const typeMeta = {
  aptitude: { icon: BrainCircuit, tone: "bg-emerald-600", label: "Aptitude" },
  interview: { icon: Mic2, tone: "bg-sky-600", label: "Interview" },
  programming: { icon: Code2, tone: "bg-amber-500", label: "Coding" },
};

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : "0%";
}

function metricToPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number * 10)));
}

function formatDateTime(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) return "New";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";
  const diffSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(value);
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getRecentWeek(activeDays = []) {
  const active = new Set(activeDays);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: dateKey(date),
      label: new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date),
      active: active.has(dateKey(date)),
      today: index === 6,
    };
  });
}

function getTypeMeta(type) {
  return typeMeta[type] || { icon: Target, tone: "bg-emerald-600", label: "Practice" };
}

function roleHome(role) {
  if (role === "master_admin") return "/master-admin-dashboard";
  if (role === "admin") return "/admin-dashboard";
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [certificateBusy, setCertificateBusy] = useState("");
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting());

  const adminHome = roleHome(user?.role);

  useEffect(() => {
    if (adminHome) return undefined;

    let isMounted = true;
    let intervalId;

    async function loadDashboard({ quiet = false } = {}) {
      if (!quiet) setLoading(true);
      try {
        const data = await apiFetch("/api/student/dashboard");
        if (isMounted) {
          setDashboard(data);
          setAnalyticsError("");
        }
      } catch (error) {
        if (isMounted) setAnalyticsError(error.message || "Unable to load your dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    intervalId = window.setInterval(() => loadDashboard({ quiet: true }), 30 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [adminHome]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeBasedGreeting());
    const intervalId = window.setInterval(updateGreeting, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const modules = dashboard?.user?.modules_access || user?.modules_access || ["both"];
  const hasAllModules = modules.includes("both");
  const hasAptitude = hasAllModules || modules.includes("aptitude");
  const hasInterview = hasAllModules || modules.includes("ai_interview");
  const hasProgramming = hasAllModules || modules.includes("programming");
  const enabledModuleLabels = hasAllModules
    ? ["Aptitude", "Interview", "Programming"]
    : modules.map((module) => moduleLabels[module]).filter(Boolean);

  const interviewAnalytics = dashboard?.interview_analytics || null;
  const programmingAnalytics = dashboard?.programming_analytics || null;
  const studyStreak = dashboard?.study_streak || { current: 0, best: 0, active_days: [] };
  const weeklyGoal = dashboard?.weekly_goal || { target: 5, completed: 0, raw_completed: 0 };
  const continueItem = dashboard?.continue_learning?.[0] || dashboard?.recommendations?.[0] || null;
  const continueMeta = getTypeMeta(continueItem?.type);
  const ContinueIcon = continueMeta.icon;
  const progress = Math.max(0, Math.min(100, Number(dashboard?.overall_progress || 0)));
  const readiness = dashboard?.placement_readiness || { score: 0, label: "Needs Foundation", components: {} };
  const engagement = dashboard?.engagement || { xp: 0, rank: "Starter", badges: [] };
  const firstName = (user?.name || "Learner").split(" ")[0];

  async function issueCertificate(milestone) {
    setCertificateBusy(milestone);
    setAnalyticsError("");
    try {
      const data = await apiFetch(`/api/student/certificates/${milestone}/issue`, { method: "POST" });
      setDashboard((current) => ({
        ...current,
        certificates: {
          ...(current?.certificates || {}),
          issued: [
            data.certificate,
            ...((current?.certificates?.issued || []).filter((item) => item.milestone !== milestone)),
          ],
        },
      }));
    } catch (error) {
      setAnalyticsError(error.message || "Unable to generate certificate.");
    } finally {
      setCertificateBusy("");
    }
  }

  const focusMetrics = useMemo(() => {
    const latestMetrics = interviewAnalytics?.latest_metrics || {};
    return ["confidence", "fluency", "knowledge", "skill_relevance"]
      .map((key) => ({
        key,
        label: METRIC_LABELS[key] || key,
        value: metricToPercent(latestMetrics[key]),
      }))
      .filter((metric) => metric.value !== null);
  }, [interviewAnalytics?.latest_metrics]);

  const statCards = useMemo(() => {
    const cards = [
      {
        label: "Overall Progress",
        value: formatPercent(dashboard?.overall_progress),
        caption: `${enabledModuleLabels.length || 0} enabled module${enabledModuleLabels.length === 1 ? "" : "s"}`,
        icon: BarChart3,
        tone: "brand",
      },
    ];

    if (hasAptitude) {
      cards.push({
        label: "Aptitude Attempts",
        value: dashboard?.submitted_attempts || 0,
        caption: `${dashboard?.available_assessments || 0} assessment${dashboard?.available_assessments === 1 ? "" : "s"} available`,
        icon: BrainCircuit,
        tone: "green",
      });
    }

    if (hasInterview) {
      cards.push({
        label: "Mock Interviews",
        value: interviewAnalytics?.reports || 0,
        caption: `${formatPercent(interviewAnalytics?.average_percentage)} average`,
        icon: Mic2,
        tone: "blue",
      });
    }

    if (hasProgramming) {
      cards.push({
        label: "Coding Solved",
        value: programmingAnalytics?.solved_unique || 0,
        caption: `${programmingAnalytics?.total_submissions || 0} submission${programmingAnalytics?.total_submissions === 1 ? "" : "s"}`,
        icon: Code2,
        tone: "amber",
      });
    }

    cards.push({
      label: "Study Streak",
      value: `${studyStreak.current || 0} Days`,
      caption: `Best ${studyStreak.best || 0} days`,
      icon: Flame,
      tone: "amber",
    });

    return cards.slice(0, 4);
  }, [
    dashboard?.available_assessments,
    dashboard?.overall_progress,
    dashboard?.submitted_attempts,
    enabledModuleLabels.length,
    hasAptitude,
    hasInterview,
    hasProgramming,
    interviewAnalytics?.average_percentage,
    interviewAnalytics?.reports,
    programmingAnalytics?.solved_unique,
    programmingAnalytics?.total_submissions,
    studyStreak.best,
    studyStreak.current,
  ]);

  if (adminHome) return <Navigate to={adminHome} replace />;

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
      <section className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-normal text-emerald-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-2 text-base text-slate-700">
            Your dashboard is synced to your current role, module access, and latest progress.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm shadow-card">
          <p className="font-black text-emerald-950">Live data</p>
          <p className="mt-1 text-xs text-slate-500">
            Updated {dashboard?.generated_at ? formatRelativeTime(dashboard.generated_at) : loading ? "now" : "when available"}
          </p>
        </div>
      </section>

      {analyticsError ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {analyticsError}
        </div>
      ) : null}

      <section className="mb-7 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <article className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Placement Readiness Score</p>
              <h2 className="mt-3 text-5xl font-black leading-none text-emerald-950">{readiness.score}</h2>
              <p className="mt-2 text-sm font-bold text-emerald-700">{readiness.label}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <Award className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {Object.entries({
              Aptitude: readiness.components?.aptitude,
              Coding: readiness.components?.coding,
              Interview: readiness.components?.interview,
              Consistency: readiness.components?.consistency,
              Resume: readiness.components?.resume,
            }).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatPercent(value)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Streaks, Badges, XP</p>
              <h2 className="mt-2 text-2xl font-black text-emerald-950">{engagement.rank} Rank</h2>
            </div>
            <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">{engagement.xp || 0} XP</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {(engagement.badges || []).map((badge) => (
              <span key={badge.title} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
                {badge.title}
              </span>
            ))}
            {!engagement.badges?.length ? (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                Complete milestones to earn badges
              </span>
            ) : null}
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-50">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${readiness.score || 0}%` }} />
          </div>
        </article>
      </section>

      <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, caption, icon: Icon, tone }) => (
          <article key={label} className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-5">
              <div className={clsx("grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br shadow-card", toneClass[tone])}>
                <Icon size={26} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="mt-1 text-3xl font-black leading-none text-emerald-950">{loading && !dashboard ? "--" : value}</p>
                <p className="mt-4 text-xs font-semibold text-emerald-700">{caption}</p>
                {label === "Overall Progress" ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-50">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-7 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-7">
          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-black text-emerald-950">Continue Learning</h2>
            {continueItem ? (
              <div className="mt-7 grid gap-5 md:grid-cols-[104px_1fr_auto] md:items-center">
                <div className={clsx("grid h-24 w-24 place-items-center rounded-lg text-white shadow-card", continueMeta.tone)}>
                  <ContinueIcon size={44} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-950">{continueItem.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">{continueItem.meta || continueMeta.label}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-emerald-50">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(100, Number(continueItem.progress || progress)))}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatPercent(continueItem.progress ?? progress)}
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-slate-600">
                    Latest update: {formatDateTime(continueItem.updated_at || dashboard?.generated_at)}
                  </p>
                </div>
                <Link href={continueItem.href || "/aptitude"} className="btn-primary whitespace-nowrap px-5 py-3">
                  {continueItem.action || "Continue"}
                </Link>
              </div>
            ) : (
              <div className="mt-7 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 p-6">
                <p className="font-black text-emerald-950">No progress yet</p>
                <p className="mt-2 text-sm text-slate-600">Start a practice session and this area will track your next step.</p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-emerald-950">Student Learning Path</h2>
              <span className="text-xs font-black uppercase text-slate-400">Personalized</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(dashboard?.learning_path || []).slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-700">{item.category}</p>
                      <h3 className="mt-1 font-black text-slate-950">{item.title}</h3>
                    </div>
                    <span
                      className={clsx(
                        "rounded-md px-2 py-1 text-[11px] font-black uppercase",
                        item.priority === "high"
                          ? "bg-red-50 text-red-600"
                          : item.priority === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.task}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(100, Number(item.progress || 0)))}%` }} />
                  </div>
                </Link>
              ))}
              {!dashboard?.learning_path?.length ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 md:col-span-2">
                  Your learning path will appear after your first activity.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-950">Recommended for you</h2>
              <span className="text-xs font-black uppercase text-slate-400">
                {enabledModuleLabels.join(" / ") || "Student"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(dashboard?.recommendations || []).map((item) => {
                const meta = getTypeMeta(item.type);
                const Icon = meta.icon;
                const amber = item.type === "programming";
                return (
                  <article
                    key={`${item.type}-${item.title}`}
                    className={clsx(
                      "rounded-lg border p-5",
                      amber ? "border-amber-200 bg-amber-50/40" : "border-emerald-100 bg-emerald-50/35",
                    )}
                  >
                    <div className="mb-5 flex items-center gap-4">
                      <div className={clsx("grid h-14 w-14 place-items-center rounded-full text-white", meta.tone)}>
                        <Icon size={23} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-emerald-950">{item.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">{item.meta}</p>
                      </div>
                    </div>
                    <p className="mb-5 flex items-center gap-2 text-sm text-slate-700">
                      <ListChecks size={15} className={amber ? "text-amber-600" : "text-emerald-700"} />
                      {meta.label}
                    </p>
                    <Link
                      href={item.href}
                      className={clsx(
                        "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-black transition",
                        amber
                          ? "border-amber-400 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-400 text-emerald-800 hover:bg-emerald-100",
                      )}
                    >
                      {item.action}
                    </Link>
                  </article>
                );
              })}

              {!dashboard?.recommendations?.length ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 md:col-span-3">
                  Recommendations will appear after your admin enables modules or publishes practice material.
                </div>
              ) : null}
            </div>
          </section>

          {hasInterview ? (
            <section className="overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50 p-6 shadow-card">
              <div className="grid gap-6 md:grid-cols-[1fr_310px] md:items-center">
                <div>
                  <h2 className="text-xl font-black text-emerald-900">AI interview feedback</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
                    Latest average: {formatPercent(interviewAnalytics?.average_percentage)} across {interviewAnalytics?.reports || 0} saved report{interviewAnalytics?.reports === 1 ? "" : "s"}.
                  </p>
                  <Link href="/interview" className="btn-primary mt-5 px-5 py-3">
                    Try AI Mock Interview
                  </Link>
                </div>
                <div className="relative hidden h-36 md:block">
                  <div className="absolute right-6 top-1 grid h-28 w-28 place-items-center rounded-full bg-white shadow-card">
                    <Bot size={58} className="text-emerald-700" />
                  </div>
                  <div className="absolute bottom-5 left-4 h-12 w-24 rounded-lg bg-white/70 shadow-sm" />
                  <div className="absolute right-0 top-16 h-14 w-24 rounded-lg bg-emerald-100/80 shadow-sm" />
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-black text-emerald-950">Study Streak</h2>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-2xl font-black text-emerald-700">
                  <Flame size={25} className="text-amber-500" />
                  {studyStreak.current || 0} Days
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Best streak: <span className="font-semibold text-orange-600">{studyStreak.best || 0} Days</span>
                </p>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {getRecentWeek(studyStreak.active_days).map((day) => (
                  <div key={day.key}>
                    <span
                      className={clsx(
                        "grid h-7 w-7 place-items-center rounded-full text-xs font-black",
                        day.active
                          ? "bg-emerald-600 text-white"
                          : day.today
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {day.active ? <Check className="h-3 w-3" /> : ""}
                    </span>
                    <span className="mt-2 block text-xs text-slate-600">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-slate-600" />
              <h2 className="text-lg font-black text-emerald-950">Role Focus</h2>
            </div>
            <h3 className="text-lg font-black text-emerald-700">
              {dashboard?.user?.interested_role || user?.interested_role || "Skill preparation"}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {enabledModuleLabels.length ? enabledModuleLabels.join(", ") : "Student workspace"}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                Weekly goal: {weeklyGoal.raw_completed || weeklyGoal.completed || 0}/{weeklyGoal.target || 5} sessions
              </p>
              <Link href={hasInterview ? "/interview" : hasProgramming ? "/programming/practice" : "/aptitude"} className="btn-primary whitespace-nowrap px-5 py-3">
                Practice
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-black text-emerald-950">Resume Builder</h2>
            </div>
            <p className="text-sm text-slate-600">
              Latest ATS score: <span className="font-black text-emerald-800">{dashboard?.resume_builder?.latest_version?.ats_score || 0}</span>
            </p>
            {dashboard?.resume_builder?.latest_version?.improvements?.length ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">{dashboard.resume_builder.latest_version.improvements[0]}</p>
            ) : null}
            <Link href="/resume-builder" className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-emerald-300 px-4 py-2.5 text-sm font-black text-emerald-800 hover:bg-emerald-50">
              Improve Resume
            </Link>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-black text-emerald-950">Certificates</h2>
            </div>
            <div className="space-y-3">
              {(dashboard?.certificates?.issued || []).map((certificate) => (
                <div key={certificate.id || certificate._id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-black text-emerald-950">{certificate.title}</p>
                  <button
                    type="button"
                    onClick={() => downloadCertificatePdf(certificate.id || certificate._id)}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-black text-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                </div>
              ))}
              {(dashboard?.certificates?.milestones || [])
                .filter((milestone) => milestone.eligible && !(dashboard?.certificates?.issued || []).some((item) => item.milestone === milestone.milestone))
                .map((milestone) => (
                  <button
                    key={milestone.milestone}
                    type="button"
                    onClick={() => issueCertificate(milestone.milestone)}
                    disabled={certificateBusy === milestone.milestone}
                    className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-sm font-black text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {certificateBusy === milestone.milestone ? "Generating..." : `Generate: ${milestone.title}`}
                  </button>
                ))}
              {!dashboard?.certificates?.issued?.length && !(dashboard?.certificates?.milestones || []).some((milestone) => milestone.eligible) ? (
                <p className="text-sm text-slate-500">Eligible certificates will appear after milestone completion.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-950">Recent Activity</h2>
              <Link href="/reports" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
                View all
              </Link>
            </div>
            <div className="space-y-5">
              {(dashboard?.recent_activity || []).map((activity) => {
                const meta = getTypeMeta(activity.type);
                const Icon = activity.score >= 80 || activity.result === "Accepted" ? CheckCircle2 : activity.type === "aptitude" ? Star : meta.icon;
                return (
                  <Link key={`${activity.type}-${activity.id}`} href={activity.href || "/dashboard"} className="flex items-center gap-4 rounded-lg transition hover:bg-emerald-50/60">
                    <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full text-white", meta.tone)}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-emerald-950">{activity.title}</p>
                      <p className="text-sm text-slate-600">{activity.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{formatRelativeTime(activity.occurred_at)}</p>
                      <p className="mt-1 text-sm font-black capitalize text-emerald-700">
                        {Number.isFinite(Number(activity.score)) ? formatPercent(activity.score) : activity.result}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {!dashboard?.recent_activity?.length ? (
                <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No activity yet.
                </p>
              ) : null}
            </div>
          </section>

          {focusMetrics.length ? (
            <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-black text-emerald-950">Focus Metrics</h2>
              <div className="mt-5 space-y-4">
                {focusMetrics.map((metric) => (
                  <div key={metric.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{metric.label}</span>
                      <span className="font-black text-emerald-800">{metric.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-50">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
                <Trophy size={22} />
              </div>
              <div>
                <p className="font-black text-emerald-950">Weekly Goal</p>
                <p className="text-sm text-slate-600">
                  {weeklyGoal.completed || 0} of {weeklyGoal.target || 5} sessions complete
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
