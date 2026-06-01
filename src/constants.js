import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  ClipboardList,
  Crown,
  Cpu,
  FileText,
  FilePlus2,
  LayoutDashboard,
  Mic2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
} from "lucide-react";

export const APP_NAME = "PrepUp";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Assessment Dashboard", icon: LayoutDashboard, roles: ["student"] },
  { href: "/interview", label: "Interview", icon: Mic2, roles: ["student"] },
  { href: "/aptitude", label: "Aptitude", icon: BrainCircuit, roles: ["student"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["student"] },
  { href: "/admin-dashboard", label: "Admin Dashboard", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/analytics/aptitude", label: "Aptitude Analytics", icon: BrainCircuit, roles: ["admin"] },
  { href: "/admin/analytics/interviews", label: "Interview Analytics", icon: Mic2, roles: ["admin"] },
  { href: "/master-admin-dashboard", label: "Master Admin", icon: Crown, roles: ["master_admin"] },
  { href: "/admin/assessments/create", label: "Create Assessment", icon: FilePlus2, roles: ["admin"] },
  { href: "/admin/assessments", label: "Assessments", icon: ClipboardList, roles: ["admin"] },
  { href: "/master-admin/students", label: "Students", icon: BookOpenCheck, roles: ["master_admin"] },
  { href: "/master-admin/admins", label: "Admins", icon: ShieldCheck, roles: ["master_admin"] },
  { href: "/master-admin/master-admins", label: "Master Admins", icon: Crown, roles: ["master_admin"] },
  { href: "/master-admin/create-admin", label: "Create Admin", icon: ShieldCheck, roles: ["master_admin"] },
  { href: "/master-admin/create-user", label: "Create User", icon: UserCog, roles: ["master_admin"] },
  { href: "/master-admin/ai-usage", label: "AI Usage", icon: Cpu, roles: ["master_admin"] },
];

export const DASHBOARD_STATS = [
  { label: "Interviews", value: "0", icon: Mic2, tone: "brand" },
  { label: "Average score", value: "--", icon: TrendingUp, tone: "green" },
  { label: "Aptitude attempts", value: "0", icon: BrainCircuit, tone: "amber" },
  { label: "Reports", value: "0", icon: BarChart3, tone: "purple" },
];

export const INTERVIEW_DOMAINS = [
  "Engineering",
  "Computer Science",
  "Business",
  "Finance",
  "Marketing",
  "Healthcare",
];

export const INTERVIEW_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "Business Analyst",
  "DevOps Engineer",
];

export const APTITUDE_DOMAINS = {
  engineering: {
    label: "Engineering",
    description: "Maths, physics, circuits, mechanics",
  },
  bca: {
    label: "BCA / Computer Science",
    description: "Algorithms, OS, DBMS, networks",
  },
};

export const METRIC_LABELS = {
  confidence: "Confidence",
  body_language: "Body Language",
  knowledge: "Knowledge",
  fluency: "Fluency",
  skill_relevance: "Relevance",
};

export const METRIC_COLORS = {
  confidence: "#5f6bf3",
  body_language: "#06b6d4",
  knowledge: "#10b981",
  fluency: "#f59e0b",
  skill_relevance: "#8b5cf6",
};

export const WORKFLOW_STEPS = [
  {
    title: "Upload resume",
    description: "Start with a PDF resume and role context.",
    icon: FileText,
  },
  {
    title: "Practice live",
    description: "Answer timed AI questions with voice and camera.",
    icon: Mic2,
  },
  {
    title: "Review metrics",
    description: "See confidence, fluency, knowledge, and relevance.",
    icon: Sparkles,
  },
  {
    title: "Improve faster",
    description: "Use report tips before your real interview.",
    icon: TrendingUp,
  },
];
