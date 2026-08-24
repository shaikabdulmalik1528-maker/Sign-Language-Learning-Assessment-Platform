import React, { useState, useEffect } from 'react';
import { Home, Video, LayoutDashboard, FileText, Award, Users, ShieldCheck, Activity, LogOut } from 'lucide-react';
import { checkSystemHealth } from '../services/api';

export default function NavigationLayout({ activeTab, setActiveTab, children }) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const verify = async () => setIsOnline(await checkSystemHealth());
    verify();
    const interval = setInterval(verify, 10000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { id: 'practice', label: 'Practice Studio', icon: Video },
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'certification', label: 'Certification', icon: Award },
    { id: 'instructor', label: 'Instructor View', icon: Users },
    { id: 'admin', label: 'Administrator', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 overflow-hidden">
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Video size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">SignLanguage</h1>
              <p className="text-[10px] text-gray-400">Learning Platform</p>
            </div>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-400 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Activity size={13} className={isOnline ? 'text-emerald-400' : 'text-rose-400'} /> FastAPI
            </span>
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">AM</div>
              <div>
                <p className="text-xs font-bold text-gray-200">Shaik Abdul Malik</p>
                <p className="text-[10px] text-gray-400">CS(AIML) Student</p>
              </div>
            </div>
            <LogOut size={15} className="text-gray-500" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
