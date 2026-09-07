"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Plus,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";
import CreateProjectModal from "../modals/CreateProjectModal";
import CreateTaskModal from "../modals/CreateTaskModal";

interface AppLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function AppLayout({ children, onRefresh }: AppLayoutProps) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // If not authenticated and not loading, redirect to login
  React.useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading NOVA Workspace...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "All Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Team Directory", href: "/team", icon: Users },
  ];

  const handleCreated = () => {
    if (onRefresh) onRefresh();
    // Dispatch custom event so any active page can refresh its state
    window.dispatchEvent(new Event("nova:refresh"));
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              NOVA
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Plan ? Collaborate ? Deliver
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
          <button
            onClick={() => setProjectModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-xs border border-slate-700/60 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        {user && (
          <div className="pt-4 border-t border-slate-800/80 relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition text-left"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 ring-2 ring-indigo-500/20"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-medium">
                    {user.role}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">{user.department}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-16 left-2 right-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-3 py-2 border-b border-slate-700/60 text-xs text-slate-400">
                  Signed in as <span className="font-semibold text-slate-200">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">NOVA</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTaskModalOpen(true)}
              className="p-2 rounded-lg bg-indigo-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user.email})</span>
              </button>
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onCreated={handleCreated}
      />
      <CreateTaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
