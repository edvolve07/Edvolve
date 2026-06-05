// In Vite dev, relative /api requests are forwarded by vite.config.js.
// In production/mobile preview, replace localhost API URLs with the current
// device-visible host so phones do not try to call their own localhost.
function getBaseUrl() {
  if (import.meta.env.DEV) return "";

  const configured = import.meta.env.VITE_API_URL || "";
  if (!configured || typeof window === "undefined") return configured;

  try {
    const url = new URL(configured);
    const isLocalApiHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname);
    const isBrowserOnRemoteHost = !["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocalApiHost && isBrowserOnRemoteHost) {
      url.hostname = window.location.hostname;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return configured;
  }

  return configured.replace(/\/$/, "");
}

const BASE_URL = getBaseUrl();

const API_KEY = import.meta.env.VITE_API_KEY || "";

function headers(extra) {
  const h = { ...(extra || {}) };
  if (API_KEY) h["X-API-Key"] = API_KEY;
  return h;
}

function authHeaders(extra) {
  const h = headers(extra);
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
}

function htmlToText(value) {
  if (!value || !value.trim().startsWith("<!DOCTYPE html")) return value;
  const pre = value.match(/<pre>([\s\S]*?)<\/pre>/i)?.[1] || value;
  return pre
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .split("\n")[0]
    .replace(/^Error:\s*/i, "")
    .trim();
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return htmlToText(data) || fallback;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join(", ");
  }
  if (typeof data.error === "string") return data.error;
  return fallback;
}

export function isUnauthorizedError(error) {
  return error?.status === 401;
}

export async function apiFetch(path, options = {}) {
  const requestHeaders = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: authHeaders(requestHeaders),
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401) clearStoredAuth();
    const error = new Error(
      getErrorMessage(
        data,
        res.status === 401 ? "Your session expired. Please sign in again." : `HTTP ${res.status}`
      )
    );
    error.status = res.status;
    error.data = data;
    if (res.status === 423) error.locked = true;
    throw error;
  }

  return data;
}

export async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name, email, password) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      confirmPassword: password,
    }),
  });
}

/* ─── Start interview ─── */
export async function startInterview(domain, role, resumeFile) {
  const form = new FormData();
  form.append("domain", domain);
  form.append("role",   role);
  form.append("file",   resumeFile);
  return apiFetch("/api/start", { method: "POST", body: form });
}

/* ─── Submit text answer ─── */
export async function submitTextAnswer(sessionId, answer) {
  return apiFetch("/api/answer_text", {
    method:  "POST",
    body:    JSON.stringify({ session_id: sessionId, answer }),
  });
}

/* ─── Submit answer: audio + optional video ─── */
export async function submitAnswer(
  sessionId,
  audioBlob,
  videoBlob
) {
  const audioExt  = (audioBlob.type || "audio/webm").includes("mp4") ? "mp4" : "webm";
  const videoExt  = (videoBlob?.type || "video/webm").includes("mp4") ? "mp4" : "webm";
  const ts = Date.now();

  // Try Vercel Blob direct upload first (avoids 413 from serverless body limit)
  if (typeof window !== "undefined" && !import.meta.env.DEV) {
    try {
      const { upload } = await import("@vercel/blob/client");
      const commonOpts = {
        access: "public",
        handleUploadUrl: `${BASE_URL}/api/handle-upload`,
        headers: authHeaders(),
      };
      const [audioResult, videoResult] = await Promise.all([
        upload(`uploads/${sessionId}/audio-${ts}.${audioExt}`, audioBlob, commonOpts),
        videoBlob ? upload(`uploads/${sessionId}/video-${ts}.${videoExt}`, videoBlob, commonOpts) : Promise.resolve(null),
      ]);

      const body = { session_id: sessionId, audioUrl: audioResult.url };
      if (videoResult) body.videoUrl = videoResult.url;

      const res = await fetch(`${BASE_URL}/api/answer_video_with_audio`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }
      return res.json();
    } catch {
      // Fall through to direct upload
    }
  }

  // Fallback: direct multipart upload (for local dev)
  const form = new FormData();
  form.append("session_id", sessionId);

  if (videoBlob) {
    form.append("video", videoBlob, `video.${videoExt}`);
    form.append("audio", audioBlob, `audio.${audioExt}`);

    const res = await fetch(`${BASE_URL}/api/answer_video_with_audio`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Server error ${res.status}`);
    }
    return res.json();
  } else {
    form.append("video", audioBlob, `audio.${audioExt}`);
    const res = await fetch(`${BASE_URL}/api/answer_video`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Server error ${res.status}`);
    }
    return res.json();
  }
}

/* ─── End interview & generate report ─── */
export async function endInterview(sessionId) {
  return apiFetch("/api/end", {
    method:  "POST",
    body:    JSON.stringify({ session_id: sessionId }),
  });
}

/* ─── Get report ─── */
export async function getReport(sessionId) {
  return apiFetch(`/api/report/${sessionId}`);
}

export async function getInterviewReports() {
  return apiFetch("/api/reports");
}

async function downloadPdf(path, filename) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadReportPdf(sessionId) {
  return downloadPdf(`/api/report/${sessionId}/pdf`, `report_${sessionId}.pdf`);
}

export function downloadReportAtsPdf(sessionId) {
  return downloadPdf(`/api/report/${sessionId}/ats`, `ats_report_${sessionId}.pdf`);
}

/* ─── Aptitude ─── */
export async function getAptitudeQuestions(domain, count = 20) {
  const res = await fetch(`${BASE_URL}/api/aptitude/questions?domain=${domain}&count=${count}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitAptitude(domain, answers) {
  const res = await fetch(`${BASE_URL}/api/aptitude/submit`, {
    method:  "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body:    JSON.stringify({ domain, answers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStudentAssessments() {
  return apiFetch("/api/student/assessments");
}

export async function startStudentAssessment(assessmentId) {
  return apiFetch(`/api/student/assessments/${assessmentId}/start`, { method: "POST" });
}

export async function saveStudentAnswer(attemptId, questionId, selectedOption) {
  return apiFetch(`/api/student/attempts/${attemptId}/answers`, {
    method: "PUT",
    body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
  });
}

export async function submitStudentAttempt(attemptId) {
  return apiFetch(`/api/student/attempts/${attemptId}/submit`, { method: "POST" });
}

export async function getStudentAttemptTime(attemptId) {
  return apiFetch(`/api/student/attempts/${attemptId}/time`);
}

export async function getStudentResults() {
  return apiFetch("/api/student/results");
}

export async function getStudentResult(attemptId) {
  return apiFetch(`/api/student/results/${attemptId}`);
}

/* ─── Health ─── */
export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error("API offline");
  return res.json();
}
