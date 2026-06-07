import { useEffect, useState } from "react";
import { BarChart3, Cpu, KeyRound, Loader2, Save, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

function StatCard({ label, value, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-emerald-50 text-emerald-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
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

export default function AiUsagePage() {
  const [usage, setUsage] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [keyForms, setKeyForms] = useState({});
  const [keySaving, setKeySaving] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function refresh() {
    return Promise.all([apiFetch("/api/master/dashboard"), apiFetch("/api/master/api-keys")]).then(
      ([dashboardPayload, keyPayload]) => {
        setUsage(dashboardPayload.ai_usage || {});
        setApiKeys(keyPayload.providers || []);
      },
    );
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh()
      .catch((err) => {
        if (active) setError(err.message || "Unable to load AI usage.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function updateApiKey(providerId) {
    const apiKey = String(keyForms[providerId] || "").trim();
    if (!apiKey) {
      setError("Enter an API key before saving.");
      return;
    }

    setKeySaving(providerId);
    setError("");
    try {
      const result = await apiFetch(`/api/master/api-keys/${providerId}`, {
        method: "PATCH",
        body: JSON.stringify({ api_key: apiKey }),
      });
      setApiKeys((current) =>
        current.map((provider) => (provider.id === providerId ? result.provider : provider)),
      );
      setKeyForms((current) => ({ ...current, [providerId]: "" }));
    } catch (err) {
      setError(err.message || "Unable to update API key.");
    } finally {
      setKeySaving("");
    }
  }

  const totals = usage?.totals || {};

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6">
        <p className="text-sm font-medium text-emerald-600">Master admin tools</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          AI API Usage
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Track AI usage across interviews, transcription, and assessment generation. Update provider keys from the same page.
        </p>
      </section>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[45vh] items-center justify-center text-sm font-medium text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-500" />
          Loading AI usage
        </div>
      ) : (
        <>
          <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatCard label="AI requests, 30d" value={totals.requests} icon={Cpu} />
            <StatCard label="Successful AI calls" value={totals.successful_requests} icon={BarChart3} tone="green" />
            <StatCard label="Failed AI calls" value={totals.failed_requests} icon={ShieldCheck} tone="amber" />
            <StatCard label="Tracked tokens" value={totals.total_tokens} icon={Cpu} tone="purple" />
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Usage by Feature</h2>
              <p className="mt-1 text-sm text-slate-500">
                Usage tracked from interviews, transcription, and AI question generation.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {usage?.by_feature?.length ? (
                usage.by_feature.map((item) => (
                  <div key={item.feature} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{item.feature.replaceAll("_", " ")}</p>
                      <p className="text-xs text-slate-500">{item.total_tokens || 0} tracked tokens</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {item.requests} calls
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No AI API usage recorded yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-500" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Provider API Keys</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update keys used by interviews, transcription, and AI question generation.
                </p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {apiKeys.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{provider.name}</p>
                      <p className="mt-1 text-xs font-mono text-slate-500">{provider.env_key}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        provider.configured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {provider.configured ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{provider.description}</p>
                  <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
                    Current key:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {provider.masked_value || "Not set"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      className="field"
                      type="password"
                      placeholder={`New ${provider.name} API key`}
                      value={keyForms[provider.id] || ""}
                      onChange={(event) =>
                        setKeyForms((current) => ({ ...current, [provider.id]: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      disabled={keySaving === provider.id}
                      onClick={() => updateApiKey(provider.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      <Save size={16} />
                      {keySaving === provider.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
