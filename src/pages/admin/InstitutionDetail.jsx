import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, BookOpenCheck, BrainCircuit, Building2, Check, FileSpreadsheet, KeyRound, Loader2,
  Mail, Phone, Plus, ShieldCheck, TrendingUp, Upload, UserCog, Users, X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const MODULE_LABELS = {
  aptitude: "Aptitude",
  coding: "Coding",
  interviews: "AI Interviews",
  resumeBuilder: "Resume Builder",
  certificates: "Certificates",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg}`}>
          <Icon size={20} className={color.text} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ModuleBadge({ enabled, label }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
      enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
    }`}>
      {label}
    </span>
  );
}

function CreateAdminForm({ institutionId, onCreated }) {
  const [mode, setMode] = useState("single");
  const [form, setForm] = useState({ name: "", email: "", phone: "", modules_access: "both" });
  const [importForm, setImportForm] = useState({ file: null, modules_access: "both" });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const data = await apiFetch("/api/master/admins", {
        method: "POST",
        body: JSON.stringify({ ...form, institutionId }),
      });
      setResult({ type: "success", message: `Admin created`, tempPassword: data.temp_password, email: form.email });
      setForm({ name: "", email: "", phone: "", modules_access: "both" });
      onCreated();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleImport(e) {
    e.preventDefault();
    if (!importForm.file) return;
    setSaving(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", importForm.file);
      body.append("modules_access", importForm.modules_access);
      body.append("institutionId", institutionId);
      const data = await apiFetch("/api/master/admins/import", { method: "POST", body });
      const errCount = data.errors?.length || 0;
      setResult({
        type: "success",
        message: `${data.created} admin(s) created from ${data.total_rows} row(s)${errCount ? `, ${errCount} error(s)` : ""}`,
      });
      setImportForm({ file: null, modules_access: "both" });
      e.target.reset();
      onCreated();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <Plus size={15} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-800">New Admin</h4>
          <p className="text-xs text-slate-500">Create admin accounts under this institution.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button type="button" onClick={() => { setMode("single"); setResult(null); }}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${mode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Single</button>
          <button type="button" onClick={() => { setMode("bulk"); setResult(null); }}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${mode === "bulk" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bulk</button>
        </div>
      </div>
      {result ? (
        <div className={`rounded-xl p-3 text-sm ${
          result.type === "success"
            ? "border border-emerald-100 bg-emerald-50"
            : "border border-red-100 bg-red-50"
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-semibold ${result.type === "success" ? "text-emerald-800" : "text-red-700"}`}>
                {result.message}
              </p>
              {result.type === "success" && result.tempPassword ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-emerald-700">Email: {result.email}</p>
                  <p className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-semibold text-emerald-900">
                    <KeyRound size={12} /> {result.tempPassword}
                  </p>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
      {mode === "single" ? (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Full name *" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="field pl-8" type="email" placeholder="Email *" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="field pl-8" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <select className="field" value={form.modules_access}
              onChange={(e) => setForm((p) => ({ ...p, modules_access: e.target.value }))}>
              <option value="both">All modules</option>
              <option value="aptitude">Aptitude only</option>
              <option value="ai_interview">AI Interview only</option>
              <option value="programming">Programming only</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-70">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleImport}>
          <div className="grid gap-3">
            <input className="field" type="file" accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} required />
            <select className="field" value={importForm.modules_access}
              onChange={(e) => setImportForm((p) => ({ ...p, modules_access: e.target.value }))}>
              <option value="both">All modules (default)</option>
              <option value="aptitude">Aptitude only</option>
              <option value="ai_interview">AI Interview only</option>
              <option value="programming">Programming only</option>
            </select>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              Columns: <span className="font-semibold text-slate-700">name</span>, <span className="font-semibold text-slate-700">email</span>,{" "}
              <span className="font-semibold text-slate-700">phone</span>, <span className="font-semibold text-slate-700">organization</span>
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {saving ? "Importing..." : "Upload & create"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function CreateStudentForm({ institutionId, admins, onCreated }) {
  const [mode, setMode] = useState("single");
  const [form, setForm] = useState({ name: "", email: "", phone: "", assigned_admin: "" });
  const [importForm, setImportForm] = useState({ file: null, assigned_admin: "" });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const data = await apiFetch("/api/master/users/create-with-details", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          institutionId,
          assigned_admin: form.assigned_admin || null,
        }),
      });
      setResult({ type: "success", message: `Student created`, tempPassword: data.temp_password, email: form.email, adminName: data.user?.assigned_admin_name });
      setForm({ name: "", email: "", phone: "", assigned_admin: "" });
      onCreated();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleImport(e) {
    e.preventDefault();
    if (!importForm.file) return;
    setSaving(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", importForm.file);
      body.append("institutionId", institutionId);
      if (importForm.assigned_admin) body.append("assigned_admin", importForm.assigned_admin);
      const data = await apiFetch("/api/master/users/import-with-details", { method: "POST", body });
      const errCount = data.errors?.length || 0;
      setResult({
        type: "success",
        message: `${data.created} student(s) created from ${data.total_rows} row(s)${errCount ? `, ${errCount} error(s)` : ""}`,
      });
      setImportForm({ file: null, assigned_admin: "" });
      e.target.reset();
      onCreated();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <Plus size={15} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-800">New Student</h4>
          <p className="text-xs text-slate-500">Create student accounts under this institution.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button type="button" onClick={() => { setMode("single"); setResult(null); }}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${mode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Single</button>
          <button type="button" onClick={() => { setMode("bulk"); setResult(null); }}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${mode === "bulk" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bulk</button>
        </div>
      </div>
      {result ? (
        <div className={`rounded-xl p-3 text-sm ${
          result.type === "success"
            ? "border border-emerald-100 bg-emerald-50"
            : "border border-red-100 bg-red-50"
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-semibold ${result.type === "success" ? "text-emerald-800" : "text-red-700"}`}>
                {result.message}
              </p>
              {result.type === "success" && result.tempPassword ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-emerald-700">Email: {result.email}</p>
                  {result.adminName ? <p className="text-xs text-emerald-700">Admin: {result.adminName}</p> : null}
                  <p className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-semibold text-emerald-900">
                    <KeyRound size={12} /> {result.tempPassword}
                  </p>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
      {mode === "single" ? (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Full name *" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="field pl-8" type="email" placeholder="Email *" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="field pl-8" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="relative">
              <UserCog size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="field pl-8" value={form.assigned_admin}
                onChange={(e) => setForm((p) => ({ ...p, assigned_admin: e.target.value }))}>
                <option value="">No admin assigned</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-70">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {saving ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleImport}>
          <div className="grid gap-3">
            <input className="field" type="file" accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} required />
            <div className="relative">
              <UserCog size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="field pl-8" value={importForm.assigned_admin}
                onChange={(e) => setImportForm((p) => ({ ...p, assigned_admin: e.target.value }))}>
                <option value="">No admin assigned</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              Columns: <span className="font-semibold text-slate-700">name</span>, <span className="font-semibold text-slate-700">email</span>,{" "}
              <span className="font-semibold text-slate-700">phone</span>, <span className="font-semibold text-slate-700">organization</span>
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {saving ? "Importing..." : "Upload & create"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function InstitutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [institution, setInstitution] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);

  function loadInstitution() {
    setLoading(true);
    setError("");
    Promise.all([
      apiFetch(`/api/institutions/${id}`),
      apiFetch(`/api/institutions/${id}/analytics`),
      apiFetch(`/api/institutions/${id}/admins`),
    ])
      .then(([instData, analyticsData, adminsData]) => {
        setInstitution(instData.institution);
        setAnalytics(analyticsData.analytics);
        setAdmins(adminsData.admins || []);
      })
      .catch((err) => setError(err.message || "Unable to load institution details."))
      .finally(() => setLoading(false));
  }

  function loadStudents() {
    setStudentsLoading(true);
    apiFetch(`/api/master/users?institution_id=${id}&role=student&limit=200`)
      .then((data) => setStudents(data.users || []))
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }

  useEffect(() => { loadInstitution(); }, [id]);
  useEffect(() => { if (institution) loadStudents(); }, [institution?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          Loading institution
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
        <button onClick={() => navigate("/master-admin/institutions")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          <ArrowLeft size={16} /> Back to Institutions
        </button>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      </div>
    );
  }

  if (!institution) return null;

  const a = analytics || {};

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <button onClick={() => navigate("/master-admin/institutions")}
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
        <ArrowLeft size={14} /> Back to Institutions
      </button>

      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {institution.name}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {institution.code} &middot; {institution.email}
                {institution.phone ? ` &middot; ${institution.phone}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              institution.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${institution.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
              {institution.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        {institution.address ? (
          <p className="mt-2 text-sm text-slate-500">{institution.address}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(MODULE_LABELS).map(([key, label]) => (
            <ModuleBadge key={key} enabled={institution.modules?.[key]} label={label} />
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={ShieldCheck} label="Admins" value={a.total_admins ?? 0}
          color={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <StatCard icon={Users} label="Students" value={a.total_students ?? 0}
          color={{ bg: "bg-violet-50", text: "text-violet-600" }} />
        <StatCard icon={BrainCircuit} label="Assessments" value={a.total_assessments ?? 0}
          color={{ bg: "bg-amber-50", text: "text-amber-600" }} />
        <StatCard icon={BookOpenCheck} label="Attempts" value={a.total_attempts ?? 0}
          color={{ bg: "bg-cyan-50", text: "text-cyan-600" }} />
        <StatCard icon={TrendingUp} label="Avg Score" value={a.average_score ? `${a.average_score}%` : "—"}
          color={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Admins</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{admins.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/master-admin/admins?institution_id=${id}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
              <button onClick={() => setShowCreateAdmin((p) => !p)}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600">
                {showCreateAdmin ? <X size={13} /> : <Plus size={13} />}
                {showCreateAdmin ? "Cancel" : "Add"}
              </button>
            </div>
          </div>
          {showCreateAdmin ? (
            <div className="border-b border-slate-100 px-5 py-4">
              <CreateAdminForm institutionId={id} onCreated={loadInstitution} />
            </div>
          ) : null}
          <div className="divide-y divide-slate-100">
            {admins.length ? admins.slice(0, 10).map((admin) => (
              <div key={admin.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                  <p className="text-xs text-slate-500">{admin.email}{admin.phone ? ` · ${admin.phone}` : ""}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  admin.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {admin.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>
            )) : (
              <p className="px-5 py-6 text-center text-sm text-slate-500">No admins found for this institution.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Students</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{students.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/master-admin/students?institution_id=${id}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
              <button onClick={() => setShowCreateStudent((p) => !p)}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600">
                {showCreateStudent ? <X size={13} /> : <Plus size={13} />}
                {showCreateStudent ? "Cancel" : "Add"}
              </button>
            </div>
          </div>
          {showCreateStudent ? (
            <div className="border-b border-slate-100 px-5 py-4">
              <CreateStudentForm institutionId={id} admins={admins} onCreated={loadStudents} />
            </div>
          ) : null}
          {studentsLoading ? (
            <div className="flex items-center justify-center px-5 py-8 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading students
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.length ? students.slice(0, 10).map((student) => (
                <div key={student.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.email}{student.phone ? ` · ${student.phone}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.assigned_admin_name ? (
                      <span className="text-xs text-slate-400">via {student.assigned_admin_name}</span>
                    ) : null}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      student.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {student.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="px-5 py-6 text-center text-sm text-slate-500">No students found for this institution.</p>
              )}
            </div>
          )}
        </section>
      </div>

      {a.recent_admins?.length ? (
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-800">Recent Admins Created</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {a.recent_admins.map((admin) => (
              <div key={admin.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                <p className="text-xs text-slate-500">{admin.email}</p>
                <p className="mt-1 text-[10px] text-slate-400">{formatDateTime(admin.created_at)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
