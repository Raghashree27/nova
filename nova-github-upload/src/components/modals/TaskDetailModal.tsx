"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (taskId && isOpen) {
      setLoading(true);
      fetch(`/api/tasks/${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.task) {
            setTask(data.task);
            setComments(data.task.comments || []);
          }
        })
        .finally(() => setLoading(false));

      fetch("/api/team")
        .then((res) => res.json())
        .then((data) => {
          if (data.members) setTeamMembers(data.members);
        });
    }
  }, [taskId, isOpen]);

  if (!isOpen || !taskId) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: assigneeId || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment("");
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold tracking-wider">
              {task?.taskCode || "TASK"}
            </span>
            <span className="text-xs text-slate-400">
              in <span className="text-slate-200 font-medium">{task?.project?.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading || !task ? (
          <div className="p-12 text-center text-slate-400">Loading task details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left Content (2 cols) */}
            <div className="p-6 md:col-span-2 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white mb-2 leading-snug">
                  {task.title}
                </h1>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {task.description || "No description provided for this task."}
                </p>
              </div>

              {/* Comments Section */}
              <div className="pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-white">
                    Comments ({comments.length})
                  </h3>
                </div>

                <div className="space-y-4 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex gap-3 text-sm">
                        <img
                          src={c.author?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${c.author?.name}`}
                          alt={c.author?.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-xs text-slate-200">{c.author?.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-normal">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment or update..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Attributes Sidebar (1 col) */}
            <div className="p-6 bg-slate-900/50 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Assignee
                </label>
                <select
                  value={task.assigneeId || ""}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Due Date
                </label>
                <div className="flex items-center gap-2 text-xs text-slate-300 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No deadline"}
                  </span>
                </div>
              </div>

              {/* Created Details */}
              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1.5">
                <p>Created by <span className="text-slate-300 font-medium">{task.creator?.name || "System"}</span></p>
                <p>Created on {new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
