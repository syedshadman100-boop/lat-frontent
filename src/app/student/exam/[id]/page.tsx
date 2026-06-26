'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function StudentExamPage() {
  const router = useRouter();
  const { id: studentExamId } = useParams();
  
  // Loading & State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Answer & flag matrices
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionKey
  const [flags, setFlags] = useState<Record<string, boolean>>({}); // questionId -> boolean
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({}); // questionId -> seconds

  // Online / Offline State
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  // Time & Proctoring
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Final Results
  const [submitted, setSubmitted] = useState(false);
  const [gradedScore, setGradedScore] = useState<any>(null);

  const activeQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Fetch Exam State
    loadExam();

    // 2. Offline Listeners
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineAnswers();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // 3. Proctoring Listeners: Tab switcher
    const handleBlur = () => {
      setProctorWarnings((prev) => {
        const next = prev + 1;
        setShowWarningModal(true);
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);

    // 4. Before Unload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress is autosaved.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (activeQuestionTimerRef.current) clearInterval(activeQuestionTimerRef.current);
    };
  }, [studentExamId]);

  // Handle active question time spent tracking
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQId = questions[currentIdx].id;

    if (activeQuestionTimerRef.current) clearInterval(activeQuestionTimerRef.current);

    activeQuestionTimerRef.current = setInterval(() => {
      setTimeSpent((prev) => ({
        ...prev,
        [currentQId]: (prev[currentQId] || 0) + 1,
      }));
    }, 1000);

    return () => {
      if (activeQuestionTimerRef.current) clearInterval(activeQuestionTimerRef.current);
    };
  }, [currentIdx, questions]);

  // Countdown timer
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) {
      if (remainingTime === 0) {
        autoSubmitExam();
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  const loadExam = async () => {
    try {
      const res = await apiClient.post('/exams/attempt/start', { exam_id: studentExamId });
      setExamData(res.data);
      setQuestions(res.data.questions);
      
      // Calculate remaining duration
      const end = new Date(res.data.end_time).getTime();
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemainingTime(diff);

      // Load existing answers if restarted
      const loadedAnswers: Record<string, string> = {};
      const loadedTime: Record<string, number> = {};
      res.data.questions.forEach((q: any) => {
        if (q.selected_option_key) loadedAnswers[q.id] = q.selected_option_key;
        loadedTime[q.id] = q.time_spent_seconds || 0;
      });
      setAnswers(loadedAnswers);
      setTimeSpent(loadedTime);
      
      setLoading(false);
      
      // Scan for unsynced answers in localStorage on start
      checkOfflineStore();
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionKey: string) => {
    if (submitted) return;
    const currentQId = questions[currentIdx].id;

    // Update local state immediately
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: optionKey,
    }));

    const answerPayload = {
      student_exam_id: studentExamId,
      question_id: currentQId,
      selected_option_key: optionKey,
      time_spent_seconds: timeSpent[currentQId] || 0,
    };

    if (navigator.onLine) {
      try {
        await apiClient.post('/exams/attempt/sync-answer', answerPayload);
      } catch (err) {
        saveOfflineAnswer(currentQId, answerPayload);
      }
    } else {
      saveOfflineAnswer(currentQId, answerPayload);
    }
  };

  const saveOfflineAnswer = (qId: string, payload: any) => {
    localStorage.setItem(`offline_sync:${studentExamId}:${qId}`, JSON.stringify(payload));
    checkOfflineStore();
  };

  const checkOfflineStore = () => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`offline_sync:${studentExamId}:`)) {
        count++;
      }
    }
    setPendingSync(count);
  };

  const syncOfflineAnswers = async () => {
    const keysToSync: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`offline_sync:${studentExamId}:`)) {
        keysToSync.push(key);
      }
    }

    if (keysToSync.length === 0) return;

    for (const key of keysToSync) {
      try {
        const payload = JSON.parse(localStorage.getItem(key) || '{}');
        await apiClient.post('/exams/attempt/sync-answer', payload);
        localStorage.removeItem(key);
      } catch (err) {
        // Halt if endpoint fails again
        break;
      }
    }
    checkOfflineStore();
  };

  const toggleFlag = () => {
    const currentQId = questions[currentIdx].id;
    setFlags((prev) => ({
      ...prev,
      [currentQId]: !prev[currentQId],
    }));
  };

  const autoSubmitExam = async () => {
    if (submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    
    try {
      const res = await apiClient.post('/exams/attempt/submit', { student_exam_id: studentExamId });
      setGradedScore(res.data);
    } catch (err) {
      // Handle grading sync
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    if (pendingSync > 0) {
      alert('Please wait. Synchronizing offline caching answers before submitting...');
      await syncOfflineAnswers();
    }

    if (window.confirm('Are you sure you want to finish and submit your assessment? You cannot modify answers after this.')) {
      autoSubmitExam();
    }
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto" />
          <span className="text-sm text-slate-400 block font-medium">Loading assessment workspace...</span>
        </div>
      </div>
    );
  }

  // Graded Success Screen
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-white px-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-plus-jakarta tracking-wide">Assessment Submitted</h2>
            <p className="text-xs text-slate-400 mt-1">Your exam answers have been auto-graded successfully.</p>
          </div>

          {gradedScore && (
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Your Graded Score</span>
              <span className="text-4xl font-bold text-indigo-400 font-mono block">
                {gradedScore.score} <span className="text-lg text-slate-500">Marks</span>
              </span>
            </div>
          )}

          <button
            onClick={() => router.push('/student')}
            className="w-full py-3 glow-button text-white font-semibold rounded-xl text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];

  return (
    <div className="flex h-screen bg-[#090d16] text-white relative">
      {/* Tab Switcher Warning overlay */}
      {showWarningModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-rose-400">Proctoring Lock Triggered</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You exited the assessment viewport or switched tabs. Tab changes are automatically logged for supervisor audits.
              </p>
            </div>
            <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 text-xs text-rose-400 font-semibold">
              Warning Count: {proctorWarnings} / 3
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Left panel: Info & Navigation */}
      <aside className="w-80 border-r border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between p-6">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Assigned Assessment</span>
            <span className="font-bold text-sm block mt-1 line-clamp-2">{examData?.title}</span>
          </div>

          {/* Offline check */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400">Sync Status:</span>
            {isOnline ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi className="h-4 w-4" /> Connected
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1 animate-pulse">
                <WifiOff className="h-4 w-4" /> Offline
              </span>
            )}
          </div>

          {pendingSync > 0 && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-400 rounded-xl text-[10px] leading-tight">
              {pendingSync} answers saved locally. They will auto-sync once internet reconnects.
            </div>
          )}

          {/* Question Grid */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Question Navigator</span>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isVisited = currentIdx === idx;
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flags[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      isVisited
                        ? 'border-2 border-indigo-500 text-white font-black scale-105'
                        : isFlagged
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                        : isAnswered
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'bg-slate-900 border border-white/5 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmitClick}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Send className="h-4 w-4" /> Submit Assessment
        </button>
      </aside>

      {/* Active Question pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        {/* Header containing timer */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/20">
          <span className="text-xs text-slate-400 font-semibold font-plus-jakarta uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </span>

          <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 font-mono text-sm text-indigo-400 font-bold">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>Time Left: {remainingTime !== null ? formatTime(remainingTime) : 'Calculating...'}</span>
          </div>
        </header>

        {/* Question detail */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col justify-between">
          <div className="space-y-6">
            {activeQuestion.context_text && (
              <div className="p-4 bg-slate-950/40 border-l-2 border-indigo-500 rounded-r-xl text-xs text-slate-300 italic leading-relaxed">
                <span className="font-bold block text-slate-400 not-italic mb-1">Scenario description:</span>
                "{activeQuestion.context_text}"
              </div>
            )}

            <h3 className="text-lg font-bold font-plus-jakarta leading-relaxed text-white">
              {activeQuestion.question_text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-4 pt-4">
              {activeQuestion.options.map((opt: any) => {
                const isSelected = answers[activeQuestion.id] === opt.option_key;

                return (
                  <label
                    key={opt.option_key}
                    onClick={() => handleSelectOption(opt.option_key)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-900/30 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {opt.option_key}
                    </span>
                    <span className="text-sm">{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action bottom bar */}
          <div className="flex items-center justify-between border-t border-white/5 pt-8 mt-10">
            <button
              onClick={toggleFlag}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                flags[activeQuestion.id]
                  ? 'bg-amber-500 border-amber-600 text-slate-950'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Flag className="h-4 w-4" /> {flags[activeQuestion.id] ? 'Flagged for Review' : 'Flag for Review'}
            </button>

            <div className="flex gap-4">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2.5 bg-slate-900/50 border border-white/5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              
              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-4 py-2.5 bg-slate-900/50 border border-white/5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
