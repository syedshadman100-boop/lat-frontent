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
  Lock,
  Volume2,
  ListTodo,
  Circle,
  CircleHelp,
  BookOpen,
  Check
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
  const [user, setUser] = useState<any>(null);
  
  // Answer & flag matrices
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionKey
  const [flags, setFlags] = useState<Record<string, boolean>>({}); // questionId -> boolean
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({}); // questionId -> seconds

  // Online / Offline State
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  // Time & Proctoring
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Final Results
  const [submitted, setSubmitted] = useState(false);
  const [gradedScore, setGradedScore] = useState<any>(null);

  // Exam Starting
  const [hasStarted, setHasStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const activeQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

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



    // 4. Before Unload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress is autosaved.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (activeQuestionTimerRef.current) clearInterval(activeQuestionTimerRef.current);
    };
  }, [studentExamId]);

  // Handle active question time spent tracking
  useEffect(() => {
    if (!hasStarted || questions.length === 0) return;
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
  }, [currentIdx, questions, hasStarted]);

  // Countdown timer
  useEffect(() => {
    if (!hasStarted) return;
    
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  const loadExam = async () => {
    try {
      const res = await apiClient.post('/exams/attempt/start', { exam_id: studentExamId });
      setExamData(res.data);

      let realQuestions = res.data.questions || [];
      
      // Fallback to dummy questions if the backend has none for this exam
      if (realQuestions.length === 0) {
        realQuestions = [
          {
            id: 'mock-1',
            question_text: "What is the primary function of photosynthesis in plants?",
            context_text: "Plants are living organisms that require energy to survive.",
            options: [
              { option_key: 'A', option_text: 'To produce oxygen' },
              { option_key: 'B', option_text: 'To convert solar energy into chemical energy' },
              { option_key: 'C', option_text: 'To absorb water from the soil' },
              { option_key: 'D', option_text: 'To release carbon dioxide' }
            ]
          },
          {
            id: 'mock-2',
            question_text: "Solve for x: 2x + 5 = 15",
            options: [
              { option_key: 'A', option_text: '5' },
              { option_key: 'B', option_text: '10' },
              { option_key: 'C', option_text: '20' },
              { option_key: 'D', option_text: '2.5' }
            ]
          },
          {
            id: 'mock-3',
            question_text: "Which of the following is a noble gas?",
            options: [
              { option_key: 'A', option_text: 'Oxygen' },
              { option_key: 'B', option_text: 'Nitrogen' },
              { option_key: 'C', option_text: 'Argon' },
              { option_key: 'D', option_text: 'Carbon' }
            ]
          }
        ];
      }

      setQuestions(realQuestions);
      
      // Calculate remaining duration
      const end = new Date(res.data.end_time).getTime();
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemainingTime(diff);

      // Load existing answers if restarted
      const loadedAnswers: Record<string, string> = {};
      const loadedTime: Record<string, number> = {};
      realQuestions.forEach((q: any) => {
        if (q.selected_option_key) loadedAnswers[q.id] = q.selected_option_key;
        loadedTime[q.id] = q.time_spent_seconds || 0;
      });
      setAnswers(loadedAnswers);
      setTimeSpent(loadedTime);
      setLoading(false);
      
      // Scan for unsynced answers in localStorage on start
      checkOfflineStore();
    } catch (err) {
      console.warn('Failed to load exam from backend.', err);
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
      await syncOfflineAnswers();
    }
    setShowSubmitModal(true);
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-650 mx-auto" />
          <span className="text-sm text-slate-500 block font-medium">Loading assessment workspace...</span>
        </div>
      </div>
    );
  }

  // Graded Success Screen
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-slate-800 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-plus-jakarta tracking-wide">Assessment Submitted</h2>
            <p className="text-xs text-slate-500 mt-1">Your exam answers have been auto-graded successfully.</p>
          </div>

          {gradedScore && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Your Graded Score</span>
              <span className="text-4xl font-bold text-indigo-600 font-mono block">
                {gradedScore.score} <span className="text-lg text-slate-400">Marks</span>
              </span>
            </div>
          )}

          <button
            onClick={() => router.push('/student')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];

  const studentName = user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() : 'Aarav Raj';
  const studentGrade = user?.studentProfile?.grade || 'Grade 5A';

  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = questions.length - answeredCount;

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeQuestion.question_text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const examTitle = examData?.exam?.title || examData?.exam?.name || examData?.title || examData?.name || 'MATHEMATICS LAT';

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-[#f4f7fb] font-sans z-0">
        {/* Instruction Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">Learning Assessment Platform</span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{examTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-sm font-bold text-slate-800 leading-tight">{studentName}</span>
              <span className="text-[10px] text-slate-400 font-bold">{studentGrade}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.first_name || 'Aarav'}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Instruction Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-full shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar flex flex-col items-center w-full">
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 text-center text-balance shrink-0">
                {examTitle}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 text-center shrink-0">Before You Begin</h2>
              <p className="text-[13px] text-slate-500 mb-6 text-center">Read the instructions carefully before starting the assessment.</p>

              <div className="flex w-full gap-4 mb-6">
                <div className="flex-1 bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    <CircleHelp className="w-3 h-3" /> QUESTIONS
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {examData?.exam?.total_questions || examData?.total_questions || questions?.length || 30} Questions
                  </span>
                </div>
                <div className="flex-1 bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    <Clock className="w-3 h-3" /> TIME LIMIT
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {examData?.exam?.duration || examData?.duration || examData?.time_limit || (remainingTime ? Math.round(remainingTime/60) : 60)} Minutes
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3.5 mb-6 pl-2">
                {[
                  'Ensure you have a stable internet connection.',
                  'Use a quiet room free from distractions.',
                  'Only one tab should be open in your browser.',
                  'Have a scrap paper and pencil ready for calculations.'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="bg-blue-50 text-blue-600 rounded-full p-0.5 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] text-slate-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="w-full flex items-center gap-2 mb-6 px-2">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={e => setAgreed(e.target.checked)} 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <label htmlFor="agree" className="text-[13px] font-bold text-slate-700 cursor-pointer select-none">
                  I have read all instructions and I'm ready to begin.
                </label>
              </div>

              <button 
                disabled={!agreed} 
                onClick={() => setHasStarted(true)} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600 text-white text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0"
              >
                 Start Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-650 mx-auto" />
          <span className="text-sm text-slate-500 block font-medium">Preparing questions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-[#f4f7fb] text-slate-800 font-sans z-0">
      {/* Submit Confirmation Modal overlay */}
      {showSubmitModal && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Submit Assessment?</h3>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                You are about to submit your assessment. Once submitted, you cannot return to modify your answers.
              </p>
            </div>
            <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-100 flex justify-center gap-10">
              <div className="text-center">
                <span className="block text-2xl font-black text-emerald-600">{answeredCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Answered</span>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div className="text-center">
                <span className="block text-2xl font-black text-slate-700">{notAnsweredCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Unanswered</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  autoSubmitExam();
                }}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-16 z-10 shrink-0">
        {/* Left Side: Time Remaining */}
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-none">Time Remaining</span>
            <span className="text-2xl font-black text-blue-600 font-mono tracking-tight mt-1 leading-none">
              {remainingTime !== null ? formatTime(remainingTime) : 'Calculating...'}
            </span>
          </div>
        </div>

        {/* Right Side: Student Profile */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.first_name || 'Aarav'}`} 
              alt="avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-left">
            <span className="block text-sm font-bold text-slate-800 leading-tight">{studentName}</span>
            <span className="text-[10px] text-slate-400 font-bold">{studentGrade}</span>
          </div>
        </div>
      </header>

      {/* Content pane */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 sm:p-6 lg:p-12 bg-[#f4f7fb] flex flex-col">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6 lg:gap-8 flex-1 lg:h-full w-full min-h-0">
          {/* Left Column: Question Card */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden h-auto lg:h-full min-h-[500px] lg:min-h-0">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 bg-white shrink-0">
              <span className="text-sm font-bold text-slate-850">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white">
              {activeQuestion.context_text && (
                <div className="p-4 bg-slate-50 border border-slate-200 border-l-4 border-l-indigo-600 rounded-r-xl text-xs text-slate-600 italic leading-relaxed shadow-sm">
                  <span className="font-bold block text-slate-500 not-italic mb-1">Scenario description:</span>
                  "{activeQuestion.context_text}"
                </div>
              )}

              <h3 className="text-[19px] font-bold font-plus-jakarta leading-relaxed text-slate-900">
                {activeQuestion.question_text}
              </h3>

              {/* Speech Synthesis Speaker Icon */}
              <button 
                onClick={handleListen}
                className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all select-none mt-2 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" /> Listen
              </button>

              {/* Question Images Grid */}
              {activeQuestion.images && activeQuestion.images.length > 0 && (
                <div className={`grid gap-4 mt-4 ${
                  activeQuestion.images.length === 1 ? 'grid-cols-1 max-w-lg' : 
                  activeQuestion.images.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-2'
                }`}>
                  {activeQuestion.images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative pt-[60%]">
                      <img 
                        src={imgUrl} 
                        alt={`Question Reference ${idx + 1}`} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Answer Options */}
              <div className={`pt-4 ${activeQuestion.options.some((o: any) => o.image) ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}`}>
                {activeQuestion.options.map((opt: any) => {
                  const isSelected = answers[activeQuestion.id] === opt.option_key;

                  return (
                    <div
                      key={opt.option_key}
                      onClick={() => handleSelectOption(opt.option_key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                        isSelected
                          ? 'bg-white border-blue-600 border-2 text-slate-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <span className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                            isSelected ? 'border-blue-600 bg-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && (
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            )}
                          </span>
                          <span className="text-sm font-semibold select-none flex-1">
                            {opt.option_key}. {opt.option_text}
                          </span>
                        </div>
                        {opt.image && (
                          <div className="ml-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                            <img src={opt.image} alt={`Option ${opt.option_key}`} className="w-full object-cover h-32" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>

              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/10 disabled:opacity-30 disabled:hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Question Navigator */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col justify-between h-auto lg:h-full overflow-hidden">
            <div className="space-y-4 flex flex-col overflow-hidden min-h-0 flex-1">
              {/* Navigator Title & Legend */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-slate-800">Question Navigator</span>
                
                <div className="flex gap-4 items-center text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-slate-200" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </div>

              {/* Navigator Grid */}
              <div className="grid grid-cols-6 gap-2 overflow-y-auto custom-scrollbar p-1 pr-2 flex-1">
                {questions.map((q, idx) => {
                  const isVisited = currentIdx === idx;
                  const isAnswered = !!answers[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 w-8 rounded-md font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer ${
                        isVisited
                          ? 'bg-blue-600 text-white shadow-sm font-black scale-105 border border-blue-600'
                          : isAnswered
                          ? 'bg-emerald-500 text-white shadow-sm border border-emerald-500'
                          : 'bg-[#f8fafc] border border-slate-200/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions & Stats */}
            <div className="space-y-4 mt-6 pt-4 border-t border-slate-100 shrink-0">
              {/* Sync Status & Metrics */}
              <div className="space-y-3">
                {/* Sync status */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="text-slate-400 font-semibold">Sync Status:</span>
                  {isOnline ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Wifi className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1 animate-pulse">
                      <WifiOff className="h-3.5 w-3.5" /> Offline
                    </span>
                  )}
                </div>

                {pendingSync > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl text-[10px] leading-tight">
                    {pendingSync} answers saved locally. Auto-syncing...
                  </div>
                )}

                {/* Answered Metrics */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Answered</span>
                  </div>
                  <span className="text-slate-800 font-black">{answeredCount}</span>
                </div>

                {/* Not Answered Metrics */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-slate-350" />
                    <span>Not Answered</span>
                  </div>
                  <span className="text-slate-800 font-black">{notAnsweredCount}</span>
                </div>
              </div>

              {/* Submit assessment button */}
              <button
                onClick={handleSubmitClick}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ListTodo className="h-4 w-4" /> Review & Submit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
