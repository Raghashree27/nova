"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
  Layers,
  Plus,
  Calendar,
} from "lucide-react";
import TaskDetailModal from "@/components/modals/TaskDetailModal";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const handleRefresh = () => fetchAnalytics();
    window.addEventListener("nova:refresh", handleRefresh);
    return () => window.removeEventListener("nova:refresh", handleRefresh);
  }, []);

  const metrics = data?.metrics || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    inReviewTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    overallCompletionRate: 0,
  };

  return (
    <AppLayout onRefresh={fetchAnalytics}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title & Quick Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time overview of workspace velocity, project health, and team workloads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center gap-2 transition"
            >
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span>View All Projects</span>
            </Link>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Projects */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Projects
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalProjects}</div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Active workspaces</span>
            </div>
          </div>

          {/* Card 2: Total Tasks */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Tasks
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalTasks}</div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
              <span className="text-blue-400 font-medium">{metrics.inProgressTasks} In Progress</span>
              <span>?</span>
              <span className="text-amber-400 font-medium">{metrics.inReviewTasks} Review</span>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Completion Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {metrics.overallCompletionRate}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${metrics.overallCompletionRate}%` }}
              />
            </div>
          </div>

          {/* Card 4: Overdue Attention */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overdue Tasks
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-400">{metrics.overdueTasks}</div>
            <div className="text-[11px] text-slate-500 mt-2">
              {metrics.overdueTasks > 0 ? "Requires team attention" : "All deliverables on schedule"}
            </div>
          </div>
        </div>

        {/* Visual Charts & Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown (2 cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Task Workflow Distribution</h3>
                <p className="text-xs text-slate-400">Pipeline health across all project boards</p>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                {data?.statusDistribution?.map((s: any) => {
                  const pct = metrics.totalTasks > 0 ? (s.count / metrics.totalTasks) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={s.status}
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                      className="h-full rounded-sm transition-all duration-500"
                      title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {data?.statusDistribution?.map((s: any) => {
                  const pct = metrics.totalTasks > 0 ? Math.round((s.count / metrics.totalTasks) * 100) : 0;
                  return (
                    <div key={s.status} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-semibold text-slate-300">{s.label}</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {s.count}{" "}
                        <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Priority Allocation
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {data?.priorityDistribution?.map((p: any) => (
                  <div key={p.priority} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <span className="text-xs text-slate-300 font-medium">{p.label}</span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                      {p.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Workload (1 col) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Team Workload</h3>
                <p className="text-xs text-slate-400">Active assigned responsibilities</p>
              </div>
              <Link href="/team" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {data?.memberWorkload?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                      alt={m.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.department || m.role}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-md">
                      {m.assignedCount} tasks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Team Audit & Activity Stream</h3>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data?.recentActivities?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent activity logged yet.</p>
            ) : (
              data?.recentActivities?.map((act: any) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={act.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${act.user?.name}`}
                      alt={act.user?.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="text-xs truncate">
                      <span className="font-semibold text-slate-200">{act.user?.name}</span>{" "}
                      <span className="text-slate-400">{act.details}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={fetchAnalytics}
      />
    </AppLayout>
  );
}
