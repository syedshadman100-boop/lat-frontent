'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Loader2, ChevronRight, Filter, BookOpen, Brain, Layers, BarChart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ApprovedQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    subject_id: '',
    grade_level: '',
    difficulty: '',
    bloom_level: '',
    search: '',
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'approved');
      params.append('limit', '50');
      
      if (filters.subject_id) params.append('subject_id', filters.subject_id);
      if (filters.grade_level) params.append('grade_level', filters.grade_level);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.bloom_level) params.append('bloom_level', filters.bloom_level);
      if (filters.search) params.append('search', filters.search);

      const res = await apiClient.get(`/questions?${params.toString()}`);
      setQuestions(res.data.data);
      if (res.data.meta && res.data.meta.total !== undefined) {
        setTotalCount(res.data.meta.total);
      } else {
        setTotalCount(res.data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': 
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getBloomColor = (bloom: string) => {
    switch (bloom?.toLowerCase()) {
      case 'understand': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'apply': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'analyze': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 text-slate-800 font-sans max-w-[1600px] mx-auto bg-slate-50/50">

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="text-white" size={24} strokeWidth={2.5} />
            </div>
            Approved Questions Bank
            {!loading && (
              <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-sm font-extrabold bg-slate-900 text-white rounded-full shadow-sm">
                {totalCount} Total
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">
            A premium repository of all curated and validated assessment questions ready for production use. Use the dynamic filters to explore the bank.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: Premium Filters Sidebar */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 sticky top-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Filter size={16} className="text-indigo-500" strokeWidth={3} /> Refine Search
            </h2>
            
            <div className="space-y-6">
              {/* Search */}
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-indigo-500">Keyword Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search query..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-indigo-500">Subject Mapping</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm cursor-pointer appearance-none">
                    <option value="">All Subjects</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Science</option>
                    <option value="3">English</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Grade Level */}
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-indigo-500">Grade Level</label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <select name="grade_level" value={filters.grade_level} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm cursor-pointer appearance-none">
                    <option value="">All Grades</option>
                    <option value="3">Grade 3</option>
                    <option value="6">Grade 6</option>
                    <option value="9">Grade 9</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Difficulty */}
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-indigo-500">Difficulty Curve</label>
                <div className="relative">
                  <BarChart size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm cursor-pointer appearance-none">
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Bloom's Level */}
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-indigo-500">Bloom's Taxonomy</label>
                <div className="relative">
                  <Brain size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <select name="bloom_level" value={filters.bloom_level} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm cursor-pointer appearance-none">
                    <option value="">All Levels</option>
                    <option value="understand">Understand</option>
                    <option value="apply">Apply</option>
                    <option value="analyze">Analyze</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
              </div>
            </div>
            
            {/* Clear Filters Hint */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] font-semibold text-slate-400">Results update dynamically as you type.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Question List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-sm min-h-[500px]">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 size={40} className="animate-spin text-indigo-600 relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mt-6">Syncing Database...</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Retrieving the latest approved questions</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 border-dashed shadow-sm min-h-[500px]">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-800">No Match Found</h3>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-md text-center">
                We couldn't find any approved questions matching your current filter criteria. Try broadening your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col"
                  style={{ animation: `fadeIn 0.4s ease-out ${i * 0.05}s both` }}
                >
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                  
                  {/* Card Header & Text */}
                  <div className="p-8 pb-6 flex-1">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug group-hover:text-indigo-950 transition-colors">
                        {q.questionText}
                      </h3>
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm tooltip-trigger relative">
                        <CheckCircle2 size={16} strokeWidth={3} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                          Approved
                        </span>
                      </div>
                    </div>

                    {/* Options Grid */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        {q.options.map((opt: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                              opt.isCorrect 
                                ? 'bg-emerald-50/50 border-emerald-400 text-emerald-900 shadow-[0_4px_12px_rgba(16,185,129,0.15)]' 
                                : 'bg-white border-slate-100 text-slate-600 group-hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-xl text-[11px] font-black shadow-sm ${
                                opt.isCorrect 
                                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {opt.optionKey}
                              </div>
                              <span className="text-sm font-bold leading-relaxed pt-1">{opt.optionText}</span>
                            </div>
                            {opt.isCorrect && (
                              <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                                <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                                  <CheckCircle2 size={12} strokeWidth={4} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer (Tags) */}
                  <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                      <BookOpen size={14} className="text-slate-400"/> {q.subject?.name || 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                      <Layers size={14} className="text-slate-400"/> Grade {q.assessmentGrade || q.gradeLevel}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold capitalize shadow-sm ${getDifficultyColor(q.difficulty)}`}>
                      <BarChart size={14} className="opacity-70"/> {q.difficulty || 'Medium'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold capitalize shadow-sm ${getBloomColor(q.bloomTaxonomy)}`}>
                      <Brain size={14} className="opacity-70"/> {q.bloomTaxonomy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
