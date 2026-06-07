import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Code2,
  Flame,
  ListChecks,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import { DASHBOARD_STATS, METRIC_LABELS } from "@/src/constants";
import { Link } from "@/src/navigation";
import { useAuth } from "@/src/portal/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getTimeBasedGreeting } from "@/src/utils/timeGreeting";

const toneClass = {
  brand: "from-emerald-500 to-emerald-800 text-white",
  green: "from-emerald-500 to-emerald-800 text-white",
  amber: "from-amber-400 to-amber-600 text-white",
  purple: "from-emerald-500 to-emerald-800 text-white",
};

const statCaptions = {
  "Overall Progress": "+8% this week",
  "Mock Interviews": "+4 this week",
  "Questions Solved": "+132 this week",
  "Study Streak": "Keep it up",
};

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "--";
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : `${value}%`;
}

function averageNumbers(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function metricToPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number * 10)));
}

function formatDateTime(value) {
  if (!value) return "Open";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [assessmentStats, setAssessmentStats] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting());

  useEffect(() => {
    let isMounted = true;

    if (user?.role !== "student") {
      setAssessmentStats(null);
      setAnalyticsError("");
      return undefined;
    }

    setAnalyticsError("");
    apiFetch("/api/student/dashboard")
      .then((data) => {
        if (isMounted) setAssessmentStats(data);
      })
      .catch((error) => {
        if (isMounted) setAnalyticsError(error.message || "Unable to load assessment analytics.");
      });

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeBasedGreeting());
    const intervalId = window.setInterval(updateGreeting, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const interviewAnalytics = assessmentStats?.interview_analytics || {};
  const combinedAverage = useMemo(
    () => averageNumbers([assessmentStats?.average_percentage, interviewAnalytics.average_percentage]),
    [assessmentStats?.average_percentage, interviewAnalytics.average_percentage],
  );

  const focusMetrics = useMemo(() => {
    const latestMetrics = interviewAnalytics.latest_metrics || {};
    return ["confidence", "fluency", "knowledge", "skill_relevance"]
      .map((key) => ({
        key,
        label: METRIC_LABELS[key] || key,
        value: metricToPercent(latestMetrics[key]),
      }))
      .filter((metric) => metric.value !== null);
  }, [interviewAnalytics.latest_metrics]);

  const dashboardStats = useMemo(
    () =>
      DASHBOARD_STATS.map((item) => {
        if (item.label === "Interviews") {
          return { ...item, value: interviewAnalytics.reports ?? item.value, label: "Mock Interviews" };
        }
        if (item.label === "Average score") {
          return { ...item, value: formatPercent(combinedAverage), label: "Overall Progress" };
        }
        if (item.label === "Aptitude attempts") {
          return { ...item, value: assessmentStats?.submitted_attempts ?? item.value, label: "Questions Solved" };
        }
        if (item.label === "Reports") {
          return { ...item, value: `${Math.max(1, interviewAnalytics.reports ?? 0) + 11} Days`, label: "Study Streak" };
        }
        return item;
      }),
    [assessmentStats?.submitted_attempts, combinedAverage, interviewAnalytics.reports],
  );

  const firstName = (user?.name || "Learner").split(" ")[0];
  const progress = Math.min(Number(combinedAverage) || 72, 100);
  const recentReports = interviewAnalytics.recent_reports || [];

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
      <section className="mb-8">
        <h1 className="text-2xl font-black tracking-normal text-emerald-900 sm:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-2 text-base text-slate-700">Let&apos;s continue your preparation journey today.</p>
      </section>

      <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ label, value, icon: Icon, tone }, index) => (
          <article key={label} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-5">
              <div className={clsx("grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br shadow-card", toneClass[tone])}>
                <Icon size={26} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="mt-1 text-3xl font-black leading-none text-emerald-950">{value}</p>
                <p className={clsx("mt-4 text-xs font-semibold", index === 3 ? "text-orange-600" : "text-emerald-700")}>
                  {statCaptions[label] || "+8% this week"}
                </p>
                {index === 0 ? (
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
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-black text-emerald-950">Continue Learning</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-[104px_1fr_auto] md:items-center">
              <div className="grid h-24 w-24 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 text-white shadow-card">
                <Code2 size={44} />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-950">Arrays and Hashing</h3>
                <p className="mt-1 text-sm font-medium text-slate-700">Coding Practice • Easy</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-emerald-50">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: "65%" }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">65% Completed</span>
                </div>
                <p className="mt-5 text-sm text-slate-600">Last practiced: Today, 9:30 AM</p>
              </div>
              <Link href="/programming/practice" className="btn-primary whitespace-nowrap px-5 py-3">
                Continue Practice
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-950">Recommended for you</h2>
              <Link href="/aptitude" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
                View all
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Aptitude: Time & Work", meta: "Quiz • Medium", icon: Target, href: "/aptitude", tone: "emerald" },
                { title: "Binary Search", meta: "Coding • Easy", icon: Code2, href: "/programming/practice", tone: "amber" },
                { title: "AI Mock Interview", meta: "System Design • Medium", icon: Bot, href: "/interview", tone: "mint" },
              ].map((item) => {
                const Icon = item.icon;
                const amber = item.tone === "amber";
                return (
                  <article
                    key={item.title}
                    className={clsx(
                      "rounded-xl border p-5",
                      amber ? "border-amber-200 bg-amber-50/40" : "border-emerald-100 bg-emerald-50/35",
                    )}
                  >
                    <div className="mb-5 flex items-center gap-4">
                      <div
                        className={clsx(
                          "grid h-14 w-14 place-items-center rounded-full text-white",
                          amber ? "bg-amber-500" : "bg-emerald-600",
                        )}
                      >
                        <Icon size={23} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-emerald-950">{item.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">{item.meta}</p>
                      </div>
                    </div>
                    <p className="mb-5 flex items-center gap-2 text-sm text-slate-700">
                      <ListChecks size={15} className={amber ? "text-amber-600" : "text-emerald-700"} />
                      {amber ? "15 Questions" : item.tone === "mint" ? "45 mins" : "20 Questions"}
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
                      {amber ? "Start Practice" : item.tone === "mint" ? "Start Interview" : "Start Quiz"}
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-card">
            <div className="grid gap-6 md:grid-cols-[1fr_310px] md:items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-900">Get AI-powered feedback</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
                  Our AI analyzes your performance and helps you improve faster with personalized insights.
                </p>
                <Link href="/interview" className="btn-primary mt-5 px-5 py-3">
                  Try AI Mock Interview
                </Link>
              </div>
              <div className="relative hidden h-36 md:block">
                <div className="absolute right-6 top-1 grid h-28 w-28 place-items-center rounded-full bg-white shadow-card">
                  <Bot size={58} className="text-emerald-700" />
                </div>
                <div className="absolute bottom-5 left-4 h-12 w-24 rounded-xl bg-white/70 shadow-sm" />
                <div className="absolute right-0 top-16 h-14 w-24 rounded-xl bg-emerald-100/80 shadow-sm" />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-black text-emerald-950">Study Streak</h2>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-2xl font-black text-emerald-700">
                  <Flame size={25} className="text-amber-500" />
                  12 Days
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Best Streak: <span className="font-semibold text-orange-600">21 Days</span>
                </p>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`}>
                    <span
                      className={clsx(
                        "grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white",
                        index === 6 ? "bg-amber-400" : "bg-emerald-600",
                      )}
                    >
                      {index === 6 ? "" : "✓"}
                    </span>
                    <span className="mt-2 block text-xs text-slate-600">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-slate-600" />
              <h2 className="text-lg font-black text-emerald-950">Upcoming Interview</h2>
            </div>
            <h3 className="text-lg font-black text-emerald-700">Frontend Developer</h3>
            <p className="mt-1 text-sm font-medium text-slate-800">TechNova Solutions</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-700">24 May 2025, 10:00 AM</p>
              <Link href="/interview" className="btn-primary whitespace-nowrap px-5 py-3">
                View Details
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-950">Recent Activity</h2>
              <Link href="/reports" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
                View all
              </Link>
            </div>
            <div className="space-y-5">
              {[
                { title: "Solved 2 Sum", meta: "Arrays • Easy", xp: "+10 XP", icon: CheckCircle2, tone: "emerald" },
                { title: "Completed Aptitude Test", meta: "Time & Work • Medium", xp: "+25 XP", icon: Star, tone: "amber" },
                ...(recentReports.length
                  ? recentReports.slice(0, 2).map((report) => ({
                      title: report.role || "Mock Interview Completed",
                      meta: report.domain || "Interview Prep",
                      xp: "+50 XP",
                      icon: CheckCircle2,
                      tone: "emerald",
                    }))
                  : [
                      { title: "Mock Interview Completed", meta: "Frontend Developer", xp: "+50 XP", icon: CheckCircle2, tone: "emerald" },
                      { title: "Attempted Binary Search", meta: "Binary Search • Easy", xp: "+10 XP", icon: Code2, tone: "orange" },
                    ]),
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={`${activity.title}-${index}`} className="flex items-center gap-4">
                    <div
                      className={clsx(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full text-white",
                        activity.tone === "amber"
                          ? "bg-amber-400"
                          : activity.tone === "orange"
                            ? "bg-orange-500"
                            : "bg-emerald-600",
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-emerald-950">{activity.title}</p>
                      <p className="text-sm text-slate-600">{activity.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{index === 0 ? "2h ago" : index === 1 ? "Yesterday" : "2 days ago"}</p>
                      <p className="mt-1 text-sm font-black text-emerald-700">{activity.xp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {analyticsError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              {analyticsError}
            </div>
          ) : null}

          {focusMetrics.length ? (
            <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
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

          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
                <Trophy size={22} />
              </div>
              <div>
                <p className="font-black text-emerald-950">Weekly Goal</p>
                <p className="text-sm text-slate-600">3 of 5 sessions complete</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
