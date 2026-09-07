"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Kanban,
  ListFilter,
  Users,
  Plus,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  FolderKanban,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "border-t-slate-500", badgeColor: "bg-slate-500/20 text-slate-300" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-t-indigo-500", badgeColor: "bg-indigo-500/20 text-indigo-400" },
  { id: "IN_REVIEW", title: "In Review", color: "border-t-amber-500", badgeColor: "bg-amber-500/20 text-amber-400" },
  { id: "DONE", title: "Done", color: "border-t-emerald-500", badgeColor: "bg-emerald-500/20 text-emerald-400" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"KANBAN" | "LIST" | "MEMBERS">("KANBAN");
  const [createTaskStatus, setCreateTaskStatus] = useState<string>("TODO");
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        router.push("/projects");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const handleRefresh = () => fetchProject();
    window.addEventListener("nova:refresh", handleRefresh);
    return () => window.removeEventListener("nova:refresh", handleRefresh);
  }, [projectId]);

  const handleMoveTask = async (taskId: string, targetStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400">Urgent</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-400">High</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400">Low</span>;
    }
  };

  const getNextStatus = (current: string) => {
    if (current === "TODO") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "IN_REVIEW";
    if (current === "IN_REVIEW") return "DONE";
    return null;
  };

  const getPrevStatus = (current: string) => {
    if (current === "DONE") return "IN_REVIEW";
    if (current === "IN_REVIEW") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "TODO";
    return null;
  };

  if (loading || !project) {
    return (
      <AppLayout>
        <div className="p-16 text-center text-slate-400">Loading project workspace...</div>
      </AppLayout>
    );
  }

  const tasks = project.tasks || [];

  return (
    <AppLayout onRefresh={fetchProject}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => router.push("/projects")}>
              Projects
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 font-semibold">{project.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-sm font-bold">
                  {project.key}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{project.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">{project.description}</p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => {
                  setCreateTaskStatus("TODO");
                  setCreateTaskModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Project Health Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Progress</span>
              <span className="font-bold text-white text-sm">
                {project.progress}% ({project.doneTasks}/{project.totalTasks} tasks)
              </span>
            </div>

            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Due Date</span>
              <span className="text-slate-300 font-medium">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "No deadline"}
              </span>
            </div>

            {project.budget && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Budget</span>
                <span className="text-slate-300 font-medium">
                  ${project.budget.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Members list */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Team:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {project.members?.map((m: any) => (
                <img
                  key={m.id}
                  src={m.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name}`}
                  alt={m.user?.name}
                  className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover"
                  title={`${m.user?.name} (${m.role})`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("KANBAN")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "KANBAN"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setActiveTab("LIST")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "LIST"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>

            <button
              onClick={() => setActiveTab("MEMBERS")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "MEMBERS"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({project.members?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === "KANBAN" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t: any) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className={`bg-slate-900/70 border border-slate-800 rounded-2xl p-3 border-t-4 ${col.color} shadow-lg space-y-3 min-h-[450px] flex flex-col`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        {col.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeColor}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCreateTaskStatus(col.id);
                        setCreateTaskModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      title="Add task to this column"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {colTasks.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-center p-3">
                        <p className="text-xs text-slate-500 font-medium">No tasks in this stage</p>
                        <button
                          onClick={() => {
                            setCreateTaskStatus(col.id);
                            setCreateTaskModalOpen(true);
                          }}
                          className="mt-2 text-[11px] text-indigo-400 hover:underline"
                        >
                          + Create task
                        </button>
                      </div>
                    ) : (
                      colTasks.map((task: any) => {
                        const next = getNextStatus(task.status);
                        const prev = getPrevStatus(task.status);

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTaskId(task.id)}
                            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 shadow-md transition-all cursor-pointer group relative"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-indigo-400 transition">
                                {task.taskCode}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>

                            <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-3">
                              {task.title}
                            </h4>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                              <div className="flex items-center gap-2">
                                {task.assignee ? (
                                  <img
                                    src={task.assignee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee.name}`}
                                    alt={task.assignee.name}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-600"
                                    title={`Assignee: ${task.assignee.name}`}
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">Unassigned</span>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    <span>
                                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Column Transition Controls */}
                              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                                {prev && (
                                  <button
                                    onClick={(e) => handleMoveTask(task.id, prev, e)}
                                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                    title={`Move back to ${prev}`}
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {next && (
                                  <button
                                    onClick={(e) => handleMoveTask(task.id, next, e)}
                                    className="p-1 rounded hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition"
                                    title={`Advance to ${next}`}
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LIST VIEW */}
        {activeTab === "LIST" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No tasks found in this project.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task: any) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {task.taskCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {task.title}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleMoveTask(task.id, e.target.value, e as any)}
                          className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-3 px-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={task.assignee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee.name}`}
                              alt={task.assignee.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-slate-300">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MEMBERS */}
        {activeTab === "MEMBERS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.members?.map((m: any) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <img
                  src={m.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name}`}
                  alt={m.user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{m.user?.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{m.user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold">
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onCreated={fetchProject}
        defaultProjectId={project.id}
        defaultStatus={createTaskStatus}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={fetchProject}
      />
    </AppLayout>
  );
}
