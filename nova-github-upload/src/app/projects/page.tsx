"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowUpRight,
  MoreVertical,
} from "lucide-react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const handleRefresh = () => fetchProjects();
    window.addEventListener("nova:refresh", handleRefresh);
    return () => window.removeEventListener("nova:refresh", handleRefresh);
  }, [statusFilter, priorityFilter, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 text-xs font-semibold">In Progress</span>;
      case "PLANNING":
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-xs font-semibold">Planning</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 text-xs font-semibold">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="text-[11px] font-bold text-red-400">Urgent</span>;
      case "HIGH":
        return <span className="text-[11px] font-bold text-orange-400">High</span>;
      case "MEDIUM":
        return <span className="text-[11px] font-medium text-amber-400">Medium</span>;
      default:
        return <span className="text-[11px] font-medium text-emerald-400">Low</span>;
    }
  };

  return (
    <AppLayout onRefresh={fetchProjects}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Projects Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Organize, track progress, and manage deliverables across all team initiatives.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by name, code, or description..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 transition w-full md:w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 transition w-full md:w-auto"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No projects match your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search criteria or create a new project to get started.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Create New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold">
                      {project.key}
                    </span>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(project.priority)}
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition mb-2">
                    {project.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  {/* Progress Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold text-white">
                        {project.doneTasks} / {project.totalTasks} tasks ({project.progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {project.dueDate
                          ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "No date"}
                      </span>
                    </div>

                    {/* Member Avatars */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {project.members?.slice(0, 3).map((m: any) => (
                        <img
                          key={m.id}
                          src={m.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name}`}
                          alt={m.user?.name}
                          className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 object-cover"
                          title={m.user?.name}
                        />
                      ))}
                      {project.members?.length > 3 && (
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-300 ring-2 ring-slate-900">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchProjects}
      />
    </AppLayout>
  );
}
