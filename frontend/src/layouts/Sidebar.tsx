import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  BrainCircuit,
  Activity,
  Database,
  User,
  Users,
  Shield,
  ShieldCheck,
  X,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false, restricted: false },
    { path: '/crime-map', label: 'Crime Map', icon: Map, adminOnly: false, restricted: false },
    { path: '/analytics', label: 'Deep Analytics', icon: BarChart3, adminOnly: false, restricted: true },
    { path: '/predictions', label: 'ML Predictions', icon: BrainCircuit, adminOnly: false, restricted: true },
    { path: '/model-performance', label: 'Model Benchmarks', icon: Activity, adminOnly: false, restricted: true },
    { path: '/datasets', label: 'Dataset Repository', icon: Database, adminOnly: false, restricted: true },
    { path: '/data-requests', label: 'Official Data Request', icon: ShieldCheck, adminOnly: false, restricted: false },
  ].filter(item => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    if (item.restricted && user?.role === 'USER') return false;
    return true;
  });

  const adminNavItems = [
    { path: '/admin/requests', label: 'Police Requisitions', icon: ShieldCheck },
    { path: '/admin/users', label: 'User Roles & Access', icon: Users },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
                AP Smart Crime Analysis
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Andhra Pradesh • ML & Spatial Insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Analytics &amp; Intelligence
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-glow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Administration Menu for ADMIN */}
          {isAdmin && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>Admin Governance</span>
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-glow-sm font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Institution Badge Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-200 mb-0.5">GIST Autonomous</div>
            <div>Dept. of CSE (Data Science)</div>
            <div className="mt-1 text-[10px] text-indigo-400 font-semibold">Andhra Pradesh, India</div>
          </div>
        </div>
      </aside>
    </>
  );
};
