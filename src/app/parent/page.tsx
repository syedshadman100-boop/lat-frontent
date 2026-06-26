'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  Sparkles,
  User,
  LogOut,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen,
  Loader2,
  FileText
} from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();
  const [parentUser, setParentUser] = useState<any>(null);
  const [childId, setChildId] = useState<string>('3'); // Seeded student 'Aarav Patel' has ID 3
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setParentUser(parsed);
        loadChildOverview();
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  const loadChildOverview = async () => {
    setLoading(true);
    try {
      // Fetch overview data for child ID 3 (Aarav Patel)
      const res = await apiClient.get(`/reports/parent/overview/3`);
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load child metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Render SVG line chart for test progress
  const renderTrendChart = () => {
    if (!overview || !overview.trends || overview.trends.length === 0) {
      return (
        <span className="text-xs text-slate-500 italic block py-10 text-center">
          No sufficient assessment trends compiled yet.
        </span>
      );
    }

    const data = overview.trends;
    const width = 500;
    const height = 150;
    const padding = 20;

    const points = data.map((d: any, idx: number) => {
      const x = padding + (idx * (width - padding * 2)) / (data.length > 1 ? data.length - 1 : 1);
      const y = height - padding - (d.percentage * (height - padding * 2)) / 100;
      return { x, y };
    });

    const pathD = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(' ')
      : '';

    return (
      <div className="flex flex-col items-center">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Y Axis Grid */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3,3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Trend Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#818cf8"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p: any, idx: number) => (
            <g key={idx} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="#a855f7"
                stroke="#ffffff"
                strokeWidth={1.5}
                className="cursor-pointer hover:r-7 transition-all"
              />
              <text x={p.x} y={p.y - 10} fill="#cbd5e1" fontSize="9" textAnchor="middle" fontWeight="bold">
                {data[idx].percentage}%
              </text>
              <text x={p.x} y={height - 5} fill="#64748b" fontSize="8" textAnchor="middle">
                {data[idx].date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 items-center justify-center flex rounded-xl glow-button">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg font-plus-jakarta tracking-wide block">LAT Parent</span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Parental Hub</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20">
              <BookOpen className="h-4 w-4" /> Child Progress
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          {parentUser && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold items-center justify-center flex text-xs">
                {parentUser.first_name[0]}{parentUser.last_name[0]}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold leading-tight">{parentUser.first_name} {parentUser.last_name}</span>
                <span className="text-[10px] text-slate-500">{parentUser.roles[0]}</span>
              </div>
            </div>
          )}

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#090d16] relative overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/20">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-plus-jakarta">Parent Dashboard</h1>
            <p className="text-xs text-slate-400">Monitoring progress for student: <span className="text-indigo-400 font-semibold">Aarav Patel (Grade 5)</span></p>
          </div>
        </header>

        {/* Content feed */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
              <span className="text-sm text-slate-400 mt-2 block font-medium">Loading child metrics...</span>
            </div>
          ) : !overview ? (
            <div className="text-center py-20 space-y-4">
              <AlertCircle className="h-14 w-14 text-rose-500/20 mx-auto animate-pulse" />
              <div>
                <span className="block text-sm font-semibold text-slate-300">No child data found</span>
                <span className="text-xs text-slate-500 mt-1 block">Make sure child has submitted assessments to activate analytics.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Progress Trends and Score Lists */}
              <div className="lg:col-span-2 space-y-8">
                {/* Line Chart */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-md font-bold font-plus-jakarta text-indigo-400">Child Score Progress Trend</h3>
                  <div className="pt-4">
                    {renderTrendChart()}
                  </div>
                </div>

                {/* Completed Exam Lists */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-md font-bold font-plus-jakarta text-indigo-400">Completed Assessments</h3>
                  <div className="space-y-4">
                    {overview.graded_assessments.map((ce: any) => (
                      <div key={ce.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between gap-4 hover:border-indigo-500/20 transition-all">
                        <div className="truncate space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">{ce.subject} • Completed on {ce.date}</span>
                          <h4 className="text-sm font-bold text-white leading-tight truncate">{ce.title}</h4>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-bold text-indigo-400 font-mono text-sm">{ce.score} Marks</span>
                          {/* Fetch report detail for PDF URL */}
                          <button
                            onClick={async () => {
                              try {
                                const repRes = await apiClient.get(`/reports/student/${ce.id}`);
                                if (repRes.data.pdf_url) {
                                  window.open(`${apiClient.defaults.baseURL?.replace('/api/v1', '') || ''}${repRes.data.pdf_url}`, '_blank');
                                }
                              } catch (err) {
                                alert('Report PDF is not available yet.');
                              }
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 flex items-center gap-1"
                          >
                            <Download className="h-3.5 w-3.5" /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Gaps and Remediation Plan */}
              <div className="lg:col-span-1 space-y-8">
                {/* AI Parent Guide Box */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
                  <div className="flex items-center gap-2 text-purple-400 border-b border-white/5 pb-4">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-md font-bold font-plus-jakarta">AI Parent Helper</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Concepts to Focus On:</span>
                      <div className="space-y-2 mt-2">
                        {overview.parent_advice.identified_misconceptions?.map((m: string, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-950/60 border border-white/5 rounded-lg text-xs text-slate-300 leading-relaxed">
                            {m}
                          </div>
                        )) || <span className="text-xs text-slate-500 italic block mt-1">None identified.</span>}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Practice at Home:</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-emerald-950/10 border border-emerald-950/20 p-3 rounded-lg">
                        {overview.parent_advice.home_remedial_activity}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Suggested Reading Guidelines:</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-amber-950/10 border border-amber-950/20 p-3 rounded-lg">
                        {overview.parent_advice.target_study_material}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competency levels lists */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mastery Levels</h3>
                  <div className="space-y-3">
                    {overview.competencies.map((comp: any) => (
                      <div key={comp.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">{comp.code}</span>
                        <span className={`font-bold ${
                          comp.level === 'advanced' || comp.level === 'proficient' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {comp.percentage.toFixed(0)}% ({comp.level.toUpperCase()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
