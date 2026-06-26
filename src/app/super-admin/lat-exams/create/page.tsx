'use client';

import React, { useState } from 'react';
import { ArrowLeft, Info, HelpCircle, CheckCircle2, Check, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function CreateLatExam() {
  const router = useRouter();
  const [latType, setLatType] = useState('LAT-I');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [replacingQuestionId, setReplacingQuestionId] = useState<number | null>(null);
  
  const [examName, setExamName] = useState('Grade 5 LAT-I (2026)');
  const [examGrade, setExamGrade] = useState(5);
  const [examDate, setExamDate] = useState('2026-07-10');
  const [examTime, setExamTime] = useState('09:00');
  const [examDuration, setExamDuration] = useState(90);
  const [examIdDisplay, setExamIdDisplay] = useState('LAT-I-G5-2026-0001');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mockQuestions, setMockQuestions] = useState([
    { id: 1, text: "Which of the following is the national bird of India?", options: ["Peacock", "Parrot", "Pigeon", "Crow"], correct: 0, difficulty: "Easy", topic: "General Knowledge" },
    { id: 2, text: "What is 15 * 6?", options: ["90", "80", "75", "100"], correct: 0, difficulty: "Easy", topic: "Arithmetic" },
    { id: 3, text: "Identify the noun in the sentence: 'The quick brown fox jumps over the lazy dog.'", options: ["Fox", "Quick", "Brown", "The"], correct: 0, difficulty: "Medium", topic: "Grammar" },
    { id: 4, text: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correct: 0, difficulty: "Easy", topic: "Geography" },
    { id: 5, text: "Which element has the chemical symbol 'O'?", options: ["Oxygen", "Gold", "Silver", "Iron"], correct: 0, difficulty: "Easy", topic: "Science" },
  ]);

  const mockAlternatives = [
    { id: 101, text: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], correct: 0, difficulty: "Easy", topic: "Science" },
    { id: 102, text: "Who wrote 'Romeo and Juliet'?", options: ["William Shakespeare", "Charles Dickens", "Mark Twain", "Jane Austen"], correct: 0, difficulty: "Medium", topic: "Literature" },
    { id: 103, text: "What is the largest ocean on Earth?", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], correct: 0, difficulty: "Easy", topic: "Geography" },
  ];

  const handleSwap = (alt: any) => {
    setMockQuestions(prev => prev.map(q => q.id === replacingQuestionId ? { ...alt, id: q.id } : q));
    setReplacingQuestionId(null);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        title: examName,
        subject_id: 2, 
        grade_level: examGrade,
        term: latType === 'LAT-I' ? 'term1' : 'term2',
        duration_minutes: examDuration,
        total_marks: 60,
        blueprint: {
          difficulty_distribution: { easy: 30, medium: 50, hard: 20 },
          target_competency_ids: []
        }
      };

      const response = await apiClient.post('/papers', payload);
      
      if (response.data) {
        setExamIdDisplay(`LAT-${response.data.id?.toString().padStart(4, '0')}`);
        setStep(3);
      }
    } catch (error: any) {
      console.error('Failed to create exam:', error);
      setErrorMsg(error?.response?.data?.message || error?.message || 'Failed to create exam.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-gray-900 pb-24 font-sans">
      
      {/* Header Area */}
      <div className="pb-2">
        <div className="max-w-[1200px] mx-auto">
          <button 
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="flex items-center gap-2 text-[13px] font-bold text-gray-900 hover:text-[#2563eb] transition-colors mb-4"
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> Back
          </button>
          
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create LAT Exam</h1>
          <p className="text-[#64748b] text-[13px] font-medium mt-1">Generate a new LAT exam based on academic year and grade.</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-[1200px] mx-auto pt-4">
        
        {/* Stepper Card */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] px-8 py-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              {step === 1 ? (
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-[13px] font-bold shadow-sm shadow-blue-200">
                  1
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
              )}
              <div>
                <p className={`text-[13px] font-bold ${step === 1 ? 'text-[#2563eb]' : 'text-gray-900'}`}>Basic Details</p>
                <p className="text-[11px] font-medium text-[#64748b]">Set exam details</p>
              </div>
            </div>
            
            <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${step === 1 ? 'opacity-50' : ''}`}>
              {step === 2 ? (
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-[13px] font-bold shadow-sm shadow-blue-200">
                  2
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border border-[#cbd5e1] text-[#64748b] flex items-center justify-center text-[13px] font-bold bg-white">
                  2
                </div>
              )}
              <div>
                <p className={`text-[13px] font-bold ${step === 2 ? 'text-[#2563eb]' : 'text-gray-900'}`}>Question Distribution</p>
                <p className="text-[11px] font-medium text-[#64748b]">View subject & question split</p>
              </div>
            </div>

            <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 ${step === 3 ? '' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm ${step === 3 ? 'bg-[#2563eb] text-white shadow-blue-200' : 'border border-[#cbd5e1] text-[#64748b] bg-white'}`}>
                3
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Exam Created</p>
                <p className="text-[11px] font-medium text-[#64748b]">LAT exam will be created</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form and Sidebar Grid */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          
          {/* Left Column (Forms) */}
          <div className="space-y-5">
          
          {/* Exam Details Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h2 className="text-[17px] font-black text-gray-900">Exam Details</h2>
            <p className="text-[#64748b] text-[13px] font-medium mb-6">Provide basic information for the LAT exam.</p>

            {/* LAT Type & Grade */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px] gap-4 mb-6">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-900 mb-2">LAT Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LAT-I Card */}
                  <div 
                    onClick={() => setLatType('LAT-I')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                      latType === 'LAT-I' 
                        ? 'border-[#2563eb] bg-[#eff4ff] shadow-sm' 
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        latType === 'LAT-I' ? 'border-[#2563eb]' : 'border-[#cbd5e1]'
                      }`}>
                        {latType === 'LAT-I' && <div className="w-2 h-2 rounded-full bg-[#2563eb]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">LAT-I</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#64748b] ml-6 leading-relaxed">
                      Assesses learning of the previous academic year.
                    </p>
                  </div>

                  {/* LAT-II Card */}
                  <div 
                    onClick={() => setLatType('LAT-II')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                      latType === 'LAT-II' 
                        ? 'border-[#2563eb] bg-[#eff4ff] shadow-sm' 
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        latType === 'LAT-II' ? 'border-[#2563eb]' : 'border-[#cbd5e1]'
                      }`}>
                        {latType === 'LAT-II' && <div className="w-2 h-2 rounded-full bg-[#2563eb]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">LAT-II</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#64748b] ml-6 leading-relaxed">
                      Assesses learning of the current academic year
                    </p>
                  </div>
                </div>
              </div>

              {/* Grade Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-2">Current Grade <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={examGrade}
                    onChange={(e) => setExamGrade(parseInt(e.target.value))}
                    className="w-full appearance-none bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow">
                    <option value={3}>Grade 3</option>
                    <option value={4}>Grade 4</option>
                    <option value={5}>Grade 5</option>
                    <option value={6}>Grade 6</option>
                    <option value={7}>Grade 7</option>
                    <option value={8}>Grade 8</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Exam Name */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-gray-900 mb-2">Exam Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
              />
              <p className="text-[10px] font-medium text-[#94a3b8] mt-2">Give a clear and unique name to the exam.</p>
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-2">Exam Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] z-20 pointer-events-none" />
                  <input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-2">Start Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] z-20 pointer-events-none" />
                  <input 
                    type="time" 
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-2">Duration <span className="text-red-500">*</span></label>
                <div className="flex">
                  <input 
                    type="number" 
                    value={examDuration}
                    onChange={(e) => setExamDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#e2e8f0] border-r-0 rounded-l-xl px-4 py-3 text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
                  />
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-r-xl px-4 flex items-center justify-center text-[12px] font-bold text-[#64748b]">
                    Minutes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Configuration Box */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-[13px] font-bold text-[#10b981] mb-1">
              Auto Configuration <span className="text-[#64748b] font-medium">(Based on your selection)</span>
            </h3>
            <p className="text-[12px] font-medium text-[#64748b] mb-6">The following settings are configured automatically as per LAT guidelines.</p>
            
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
              {/* Assessment Group */}
              <div className="flex gap-4 items-start w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0 shadow-sm">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Assessment Group</p>
                  <p className="text-[14px] font-black text-gray-900">Preparatory</p>
                  <p className="text-[10px] font-medium text-[#94a3b8] mt-1 leading-snug max-w-[150px]">Auto-selected based on Grade 5</p>
                </div>
              </div>

              {/* Assessment Basis */}
              <div className="flex gap-4 items-start md:pl-8 md:border-l border-[#e2e8f0] w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#2563eb] shrink-0 shadow-sm">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Assessment Basis</p>
                  <p className="text-[14px] font-black text-gray-900">Previous Academic Year</p>
                  <p className="text-[10px] font-medium text-[#94a3b8] mt-1 leading-snug max-w-[180px]">Questions will be generated from Grade 4 competencies (LAT-I)</p>
                </div>
              </div>

              {/* Subjects Included */}
              <div className="flex gap-4 items-start md:pl-8 md:border-l border-[#e2e8f0] w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#f5f3ff] flex items-center justify-center text-[#8b5cf6] shrink-0 shadow-sm">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Subjects Included</p>
                  <p className="text-[14px] font-black text-gray-900">4 Subjects</p>
                  <p className="text-[10px] font-medium text-[#94a3b8] mt-1 leading-snug max-w-[160px]">English, Hindi, Mathematics, EVS (As applicable for Grade 5)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-[#eff4ff] border border-[#bfdbfe] rounded-xl p-4 flex items-center gap-3">
            <Info size={18} className="text-[#2563eb] shrink-0" />
            <p className="text-[12px] font-medium text-[#334155]">Question paper will be generated automatically based on the above details in the next steps.</p>
          </div>

        </div>

        {/* Right Column (Info Cards) */}
        <div className="space-y-5">
          
          {/* About LAT */}
          <div className="bg-[#f5f3ff] border border-[#ddd6fe] rounded-2xl p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-gray-900 mb-4">
              <Info size={16} className="text-[#8b5cf6]" /> About LAT
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                LAT (Learners' Achievement Test) is a competency-based assessment for Grades 3, 5 and 8.
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                LAT-I: Previous academic year competencies
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                LAT-II: Current academic year (Apr - Sep)
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                Questions are MCQs and not chapter based
              </li>
            </ul>
          </div>

          {/* How it works */}
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-gray-900 mb-4">
              <HelpCircle size={16} className="text-[#d97706]" /> How it works?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                You provide basic exam details.
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                We distribute questions across subjects.
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                You review and confirm the exam.
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#475569] leading-relaxed">
                <span className="text-gray-400 mt-1.5 w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                LAT exam is created and ready to use.
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="bg-[#eff4ff] border border-[#bfdbfe] rounded-2xl p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#1e3a8a] mb-3">
              <Info size={16} className="text-[#2563eb]" /> Note
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#1e3a8a] leading-relaxed">
                <span className="text-[#60a5fa] mt-1.5 w-1 h-1 bg-[#60a5fa] rounded-full shrink-0"></span>
                All settings in Auto Configuration are based on NEP 2020 stages and LAT guidelines.
              </li>
              <li className="flex items-start gap-2 text-[12px] font-medium text-[#1e3a8a] leading-relaxed">
                <span className="text-[#60a5fa] mt-1.5 w-1 h-1 bg-[#60a5fa] rounded-full shrink-0"></span>
                Question paper will be generated automatically based on the above details in the next steps.
              </li>
            </ul>
          </div>

          </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e2e8f0]">
                <h2 className="text-[17px] font-black text-gray-900">Question Distribution</h2>
                <p className="text-[#64748b] text-[13px] font-medium mt-1">Questions are distributed across subjects as per LAT guidelines for the selected grade and LAT type.</p>
              </div>

              <div className="p-6">
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-8 flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">LAT Type</p>
                    <span className="bg-[#f5f3ff] text-[#8b5cf6] px-2.5 py-1 rounded-md text-[11px] font-bold">LAT-I</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">Current Grade</p>
                    <span className="text-[#10b981] text-[13px] font-bold">Grade 5</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">Assessment Group</p>
                    <span className="bg-[#eff4ff] text-[#2563eb] px-2.5 py-1 rounded-md text-[11px] font-bold">Preparatory (Grades 3-5)</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">Assessment Basis</p>
                    <span className="bg-[#fffbeb] text-[#d97706] px-2.5 py-1 rounded-md text-[11px] font-bold">Previous Academic Year (Grade 4)</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">Total Questions</p>
                    <p className="text-[13px] font-black text-gray-900">60</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-wider">Total Duration</p>
                    <div className="flex items-center gap-1.5 text-[13px] font-black text-gray-900">
                      <Clock size={14} className="text-gray-900" /> 90 Minutes
                    </div>
                  </div>
                </div>

                <h3 className="text-[14px] font-bold text-gray-900 mb-4">Subject-wise Question Distribution</h3>
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white">Subject</th>
                        <th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-center w-[200px]">Total Questions (MCQ)</th>
                        <th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-right w-[150px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center text-[12px] font-bold">A/z</div>
                            <span className="text-[13px] font-semibold text-gray-900">English</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">15</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('English')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            View & Edit
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#fdf2f8] text-[#db2777] flex items-center justify-center text-[14px] font-bold">अ</div>
                            <span className="text-[13px] font-semibold text-gray-900">Hindi</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">15</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('Hindi')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            View & Edit
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] text-[#475569] flex items-center justify-center text-[14px] font-bold font-serif">π</div>
                            <span className="text-[13px] font-semibold text-gray-900">Mathematics</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">20</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('Mathematics')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            View & Edit
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                              <Layers size={14} />
                            </div>
                            <span className="text-[13px] font-semibold text-gray-900">EVS</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">10</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('EVS')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            View & Edit
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-[#eff4ff]">
                        <td className="py-4 px-5 text-[14px] font-black text-[#2563eb]">Total</td>
                        <td className="py-4 px-5 text-center text-[14px] font-black text-[#2563eb]">60</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-[#eff4ff] border border-[#bfdbfe] rounded-xl p-4 flex items-center gap-3">
              <Info size={18} className="text-[#2563eb] shrink-0" />
              <p className="text-[12px] font-medium text-[#334155]">Total duration for the exam is 90 minutes for all subjects combined.</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-white border-t border-[#e2e8f0] px-5 py-4 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg w-fit">
                <Info size={14} className="shrink-0" />
                <p className="text-[12px] font-bold line-clamp-1" title={errorMsg}>
                  {errorMsg}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-4 shrink-0">
            <button className="px-4 md:px-6 py-2.5 bg-white border border-[#e2e8f0] text-gray-900 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <span className="hidden sm:inline">Next: Question Distribution</span>
                <span className="sm:hidden">Next</span>
                <span className="text-lg leading-none">→</span>
              </button>
            ) : (
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                <span className="hidden sm:inline">{isSubmitting ? 'Creating Exam...' : 'Next: Confirm Exam'}</span>
                <span className="sm:hidden">Next</span>
                <span className="text-lg leading-none">→</span>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Success Modal */}
      {step === 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[550px] flex flex-col relative animate-in fade-in zoom-in duration-300">


            <div className="p-6 px-8 flex-1 flex flex-col items-center text-center rounded-t-[24px] overflow-hidden">
              {/* Success Icon positioned overlapping top border */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center shadow-lg z-20">
                <Check size={32} className="text-white" strokeWidth={3} />
              </div>

              <h2 className="text-[20px] font-black text-gray-900 mb-1 mt-4">LAT Exam Created Successfully!</h2>
              <p className="text-[#64748b] text-[13px] font-medium max-w-md mx-auto mb-5">
                Your LAT exam has been created and is ready. You can now preview or download the question paper.
              </p>

              {/* Exam ID Box */}
              <div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-lg px-4 py-2 flex items-center justify-center gap-3 mb-6 w-fit mx-auto">
                <span className="text-[11px] font-bold text-[#94a3b8]">LAT Exam ID</span>
                <span className="text-[14px] font-black text-gray-900">{examIdDisplay}</span>
                <button className="text-[#2563eb] hover:text-blue-700 ml-2">
                  <Copy size={16} />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-left mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
                    <FileText size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Exam Name</p>
                    <p className="text-[12px] font-bold text-gray-900">Grade 5 LAT-I (2026)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Calendar size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Exam Date</p>
                    <p className="text-[12px] font-bold text-gray-900">10 Jul 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Users size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Current Grade</p>
                    <p className="text-[12px] font-bold text-gray-900">Grade 5</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#fffbeb] text-[#d97706] flex items-center justify-center shrink-0">
                    <Clock size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Duration</p>
                    <p className="text-[12px] font-bold text-gray-900">90 Minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center shrink-0">
                    <Shield size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Assessment Group</p>
                    <p className="text-[12px] font-bold text-gray-900">Preparatory (Grades 3-5)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
                    <GridIcon size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Total Questions</p>
                    <p className="text-[12px] font-bold text-gray-900">60</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <BookOpen size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Assessment Basis</p>
                    <p className="text-[12px] font-bold text-gray-900">Previous Academic Year (Grade 4)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
                    <Layers size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0">Subjects</p>
                    <p className="text-[12px] font-bold text-gray-900">4 (English, Hindi, Math, EVS)</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Action Buttons (Fixed Footer) */}
            <div className="p-4 px-8 border-t border-[#e2e8f0] bg-white shrink-0 rounded-b-[24px]">
              <div className="grid grid-cols-2 gap-4 w-full mb-4">
                <button className="flex items-center justify-center gap-2 py-3 border border-[#e2e8f0] rounded-xl text-[13px] font-bold text-[#2563eb] hover:bg-[#eff4ff] transition-colors">
                  <Eye size={16} /> Preview Question Paper
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-[#e2e8f0] rounded-xl text-[13px] font-bold text-[#2563eb] hover:bg-[#eff4ff] transition-colors">
                  <DownloadIcon size={16} /> Download (PDF)
                </button>
              </div>
              <button 
                onClick={() => router.push('/super-admin/lat-exams')}
                className="w-full py-3.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl shadow-sm transition-colors"
              >
                Go to LAT Exams
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Question Preview & Replace Drawer */}
      {previewSubject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="w-full h-full bg-[#f8fafc] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-6 px-8 bg-white border-b border-[#e2e8f0] flex items-center justify-between shrink-0 sticky top-0 z-10">
              <div>
                <h2 className="text-[20px] font-black text-gray-900 flex items-center gap-3">
                  {replacingQuestionId ? (
                    <>
                      <button onClick={() => setReplacingQuestionId(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                      Select Alternative Question
                    </>
                  ) : (
                    <>{previewSubject} - Selected Questions</>
                  )}
                </h2>
                <p className="text-[13px] font-medium text-[#64748b] mt-1 ml={replacingQuestionId ? 10 : 0}">
                  {replacingQuestionId ? 'Choose a question from the approved question bank to replace the current one.' : 'Review the automatically selected questions and replace any if needed.'}
                </p>
              </div>
              <button 
                onClick={() => { setPreviewSubject(null); setReplacingQuestionId(null); }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
              <div className="max-w-5xl mx-auto w-full space-y-6">
                {!replacingQuestionId ? (
                // View Mode
                mockQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <span className="w-8 h-8 shrink-0 bg-[#eff4ff] text-[#2563eb] rounded-full flex items-center justify-center text-[13px] font-bold">
                          Q{idx + 1}
                        </span>
                        <div>
                          <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{q.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold uppercase tracking-wider">{q.difficulty}</span>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-[11px] font-bold uppercase tracking-wider">{q.topic}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setReplacingQuestionId(q.id)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] rounded-xl text-[13px] font-bold text-[#475569] hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <RefreshCw size={14} /> Replace
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pl-11">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-3 rounded-xl border ${oIdx === q.correct ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'border-[#f1f5f9] bg-[#f8fafc]'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${oIdx === q.correct ? 'bg-[#16a34a] text-white' : 'bg-white border border-[#cbd5e1] text-[#64748b]'}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className={`text-[13px] font-medium ${oIdx === q.correct ? 'text-[#166534]' : 'text-[#475569]'}`}>{opt}</span>
                            {oIdx === q.correct && <CheckCircle size={14} className="text-[#16a34a] ml-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Replace Mode
                mockAlternatives.map((alt) => (
                  <div key={alt.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:border-[#2563eb] transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div>
                          <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{alt.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold uppercase tracking-wider">{alt.difficulty}</span>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-[11px] font-bold uppercase tracking-wider">{alt.topic}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSwap(alt)}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 rounded-xl text-[13px] font-bold text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Select Question
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {alt.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-3 rounded-xl border ${oIdx === alt.correct ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'border-[#f1f5f9] bg-[#f8fafc]'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${oIdx === alt.correct ? 'bg-[#16a34a] text-white' : 'bg-white border border-[#cbd5e1] text-[#64748b]'}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className={`text-[13px] font-medium ${oIdx === alt.correct ? 'text-[#166534]' : 'text-[#475569]'}`}>{opt}</span>
                            {oIdx === alt.correct && <CheckCircle size={14} className="text-[#16a34a] ml-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
