'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  Sparkles,
  BookOpen,
  LogOut,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  Play,
  CheckCircle2,
  Loader2,
  TrendingUp,
  FileText,
  Download,
  X,
  Award,
  ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'exams' | 'progress'>('exams');
  
  // Progress/Reports states
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  
  // Selected Report Modal state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        loadUpcomingExams();
        loadStudentOverview(parsed.id);
      } else {
        router.push('/login');
      }
    }

    // Update timer every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const loadUpcomingExams = async () => {
    try {
      const res = await apiClient.get('/exams/student/upcoming');
      setExams(res.data);
    } catch (err) {
      console.error('Failed to load upcoming exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentOverview = async (studentId: string) => {
    setLoadingOverview(true);
    try {
      const res = await apiClient.get(`/reports/student-overview/${studentId}`);
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load student progress overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadReportDetails = async (studentExamId: string) => {
    setLoadingReport(true);
    setShowReportModal(true);
    try {
      const res = await apiClient.get(`/reports/student/${studentExamId}`);
      setReportDetails(res.data);
    } catch (err) {
      console.error('Failed to load report details:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleStartExam = async (studentExamId: string) => {
    router.push(`/student/exam/${studentExamId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Check attempt status window
  const getExamWindowStatus = (exam: any) => {
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (currentTime < start) {
      return {
        label: 'Upcoming',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        allowed: false,
        btnLabel: 'Locked',
      };
    } else if (currentTime > end) {
      return {
        label: 'Expired',
        color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
        allowed: false,
        btnLabel: 'Expired',
      };
    } else {
      return {
        label: 'Active Now',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        allowed: true,
        btnLabel: 'Start Assessment',
      };
    }
  };

  // Render SVG Flower Petals based on competency scores
  const renderFlowerGraph = () => {
    if (!overview || !overview.competencies || overview.competencies.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-white/5 rounded-2xl h-64 text-center">
          <Award className="h-10 w-10 text-slate-600 animate-pulse mb-2" />
          <span className="text-xs text-slate-400">Complete an exam to grow your Competency Flower!</span>
        </div>
      );
    }

    const comps = overview.competencies;
    const size = 300;
    const center = size / 2;
    const petalMaxRadius = 100;
    const numPetals = comps.length;
    const angleStep = 360 / numPetals;

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="overflow-visible filter drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]">
          {/* Stem and Leaves */}
          <line x1={center} y1={center} x2={center} y2={size + 30} stroke="#10b981" strokeWidth={5} strokeLinecap="round" />
          <path d={`M ${center} ${center + 60} Q ${center - 40} ${center + 40} ${center - 30} ${center + 20} Q ${center - 10} ${center + 40} ${center} ${center + 60}`} fill="#10b981" />
          <path d={`M ${center} ${center + 80} Q ${center + 40} ${center + 60} ${center + 30} ${center + 40} Q ${center + 10} ${center + 60} ${center} ${center + 80}`} fill="#10b981" />

          {/* Draw Petals */}
          {comps.map((comp: any, idx: number) => {
            const angleDeg = idx * angleStep - 90; // Start facing up
            const angleRad = (angleDeg * Math.PI) / 180;
            const percentage = comp.percentage || 0;
            const radius = 30 + (petalMaxRadius * percentage) / 100;

            // Determine Petal Color
            let fill = '#f43f5e'; // Red (below 40%)
            let stroke = '#ef4444';
            if (percentage >= 60) {
              fill = '#10b981'; // Green
              stroke = '#059669';
            } else if (percentage >= 40) {
              fill = '#f59e0b'; // Amber
              stroke = '#d97706';
            }

            // End points of the petal loop
            const xTip = center + radius * Math.cos(angleRad);
            const yTip = center + radius * Math.sin(angleRad);

            // Control points for bezier loop curve
            const leftAngleRad = ((angleDeg - 35) * Math.PI) / 180;
            const rightAngleRad = ((angleDeg + 35) * Math.PI) / 180;

            const xLeft = center + (radius * 0.7) * Math.cos(leftAngleRad);
            const yLeft = center + (radius * 0.7) * Math.sin(leftAngleRad);

            const xRight = center + (radius * 0.7) * Math.cos(rightAngleRad);
            const yRight = center + (radius * 0.7) * Math.sin(rightAngleRad);

            const pathData = `M ${center} ${center} Q ${xLeft} ${yLeft} ${xTip} ${yTip} Q ${xRight} ${yRight} ${center} ${center} Z`;

            return (
              <g key={comp.id} className="cursor-pointer group">
                <path
                  d={pathData}
                  fill={fill}
                  fillOpacity={0.65}
                  stroke={stroke}
                  strokeWidth={2}
                  className="transition-all duration-300 hover:fill-opacity-90"
                />
                {/* Labels at the tip */}
                <text
                  x={center + (radius + 20) * Math.cos(angleRad)}
                  y={center + (radius + 20) * Math.sin(angleRad)}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="bg-slate-950 px-1 py-0.5 rounded font-mono"
                >
                  {comp.code} ({percentage.toFixed(0)}%)
                </text>
              </g>
            );
          })}

          {/* Center core */}
          <circle cx={center} cy={center} r={24} fill="#a855f7" stroke="#ffffff" strokeWidth={2} className="animate-pulse" />
          <circle cx={center} cy={center} r={12} fill="#6366f1" />
        </svg>
        <span className="text-[10px] text-slate-500 mt-8 font-medium">Petal length represents mastery percentage. Green represents Proficient/Advanced.</span>
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
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg font-plus-jakarta tracking-wide block">LAT Student</span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Assessments Portal</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('exams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" /> My Assessments
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'progress' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> My Progress & Gaps
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold items-center justify-center flex text-xs">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold leading-tight">{user.first_name} {user.last_name}</span>
                <span className="text-[10px] text-slate-500">{user.roles[0]}</span>
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
            <h1 className="text-2xl font-bold tracking-tight font-plus-jakarta">
              {activeTab === 'exams' ? 'My Active Assessments' : 'Curricular Analytics & AI Remediation'}
            </h1>
            <p className="text-xs text-slate-400">
              {activeTab === 'exams' ? 'Complete assigned curricular tests and diagnostics' : 'Identify competency gaps and physical home learning guides'}
            </p>
          </div>
        </header>

        {/* Content feed */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'exams' ? (
            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
                  <span className="text-sm text-slate-400 mt-2 block font-medium">Fetching assessments...</span>
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500/20 mx-auto animate-pulse" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-300">All caught up!</span>
                    <span className="text-xs text-slate-500 mt-1 block">No active or scheduled assessments assigned to you.</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((studentExam) => {
                    const status = getExamWindowStatus(studentExam.exam);
                    const isStarted = studentExam.status === 'started';

                    return (
                      <div key={studentExam.id} className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col justify-between h-56 relative group hover:border-indigo-500/30 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                              {isStarted ? 'In Progress' : status.label}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {studentExam.exam.questionPaper.subject.name}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white font-plus-jakarta leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {studentExam.exam.questionPaper.title}
                          </h4>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                              <span>{studentExam.exam.questionPaper.durationMinutes} mins duration</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span className="truncate">End window: {new Date(studentExam.exam.endTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartExam(studentExam.id)}
                          disabled={!status.allowed && !isStarted}
                          className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 mt-4 transition-all ${
                            isStarted 
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                              : status.allowed
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-white/5'
                          }`}
                        >
                          {isStarted ? (
                            <>
                              <Play className="h-3.5 w-3.5" /> Continue Assessment
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" /> {status.btnLabel}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed / Graded Assessments Section */}
              <div className="border-t border-white/5 pt-8 space-y-4">
                <h3 className="text-lg font-bold font-plus-jakarta text-indigo-400">My Completed Assessments</h3>
                {loadingOverview ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                ) : !overview || !overview.graded_assessments || overview.graded_assessments.length === 0 ? (
                  <span className="text-xs text-slate-500 italic block">No completed assessments recorded yet.</span>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {overview.graded_assessments.map((ce: any) => (
                      <div key={ce.id} className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1 truncate">
                          <span className="text-[10px] font-bold text-slate-400 block">{ce.subject} • {ce.date}</span>
                          <h4 className="text-sm font-bold text-white truncate leading-tight">{ce.title}</h4>
                        </div>
                        <button
                          onClick={() => loadReportDetails(ce.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-xs font-semibold text-indigo-400 flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Report
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // PROGRESS TAB
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left SVG Flower Visualisation */}
              <div className="lg:col-span-1 glass-panel p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <h3 className="text-md font-bold text-indigo-400 font-plus-jakarta mb-6 self-start">Competency Flower Chart</h3>
                {loadingOverview ? (
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                ) : (
                  renderFlowerGraph()
                )}
              </div>

              {/* Right aggregations and AI Gaps Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Suggestions Box */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-md font-bold font-plus-jakarta">AI Practice Suggestion Box</h3>
                  </div>

                  {loadingOverview ? (
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  ) : !overview || !overview.learning_gaps || overview.learning_gaps.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      All competency outcomes are met! Keep up the excellent work.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overview.learning_gaps.map((gap: any) => (
                        <div key={gap.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-start gap-4 hover:border-purple-500/20 transition-all">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            gap.severity === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {gap.loCode}
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Target Outcome: {gap.loDescription}
                            </span>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {gap.gapDescription}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* List of competency percentage tables */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-md font-bold font-plus-jakarta text-indigo-400">Detailed Curricular Nodes Status</h3>
                  {loadingOverview ? (
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  ) : !overview || !overview.competencies || overview.competencies.length === 0 ? (
                    <span className="text-xs text-slate-500 italic block">No detailed mappings recorded.</span>
                  ) : (
                    <div className="space-y-4">
                      {overview.competencies.map((comp: any) => (
                        <div key={comp.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <div className="truncate">
                            <span className="font-bold font-mono text-purple-400 block">{comp.code}</span>
                            <span className="text-slate-400 truncate block max-w-[300px]">{comp.description}</span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <span className="font-bold text-white block">{comp.percentage.toFixed(0)}%</span>
                              <span className={`text-[10px] font-bold uppercase ${
                                comp.level === 'advanced' || comp.level === 'proficient' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>{comp.level}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DETAILED SCORECARD MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950 max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-plus-jakarta text-indigo-400">
                  {reportDetails ? reportDetails.examTitle : 'Grades & Insights'}
                </h3>
                <span className="text-xs text-slate-400">Subject: {reportDetails?.subjectName || 'Math'}</span>
              </div>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDetails(null);
                }}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {loadingReport ? (
                <div className="text-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                  <span className="text-xs text-slate-400 mt-2 block">Compiling report data...</span>
                </div>
              ) : reportDetails ? (
                <div className="space-y-6">
                  {/* Score block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-xl text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Score Obtained</span>
                      <h4 className="text-2xl font-bold font-mono text-white">{reportDetails.summary.total_score} / {reportDetails.summary.max_score}</h4>
                    </div>
                    <div className="p-4 bg-purple-600/10 border border-purple-600/20 rounded-xl text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Percentage</span>
                      <h4 className="text-2xl font-bold font-mono text-white">{reportDetails.summary.percentage}%</h4>
                    </div>
                    <div className="p-4 bg-slate-900 border border-white/5 rounded-xl text-center flex items-center justify-center">
                      {reportDetails.pdf_url ? (
                        <a
                          href={`${apiClient.defaults.baseURL?.replace('/api/v1', '') || ''}${reportDetails.pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 text-white"
                        >
                          <Download className="h-4 w-4" /> Download PDF Report
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 italic">PDF report rendering...</span>
                      )}
                    </div>
                  </div>

                  {/* Competency Mastery Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300">Competency Scores</h4>
                    <div className="space-y-2">
                      {reportDetails.competency_scores.map((comp: any) => (
                        <div key={comp.competency_id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40 border border-white/5 text-xs gap-3">
                          <span className="font-medium text-slate-200">{comp.code}: {comp.description}</span>
                          <span className={`font-bold shrink-0 ${
                            comp.level === 'advanced' || comp.level === 'proficient' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {comp.score}/{comp.max_score} ({comp.level.toUpperCase()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Remedial Actions Details */}
                  <div className="p-6 bg-slate-900/30 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Sparkles className="h-4.5 w-4.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI Remediation Plan</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Identified Misconceptions</span>
                        <div className="space-y-1.5 mt-1">
                          {reportDetails.ai_analysis.identified_misconceptions?.map((m: string, idx: number) => (
                            <p key={idx} className="text-xs text-slate-300 leading-relaxed">• {m}</p>
                          )) || <p className="text-xs text-slate-500 italic">None identified.</p>}
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Suggested Hands-on Practice Guide</span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">
                          {reportDetails.ai_analysis.home_remedial_activity}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Recommended Study Reference</span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">
                          {reportDetails.ai_analysis.target_study_material}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-xs text-slate-500 italic">Failed to load report payload.</div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDetails(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
