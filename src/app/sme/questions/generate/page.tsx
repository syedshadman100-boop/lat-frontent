'use client';

import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle, AlertCircle, ChevronDown, BookOpen, GraduationCap, Target } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function GenerateQuestionsPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');

  const [formData, setFormData] = useState({
    subject_id: '1',
    grade_level: '5',
    learning_outcome_id: '1',
    learning_indicator_id: '',
    bloom_level: 'understanding',
    difficulty: 'medium',
    term: '2',
    count: 5,
    llm_provider: 'gemini',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const pollJobStatus = async (id: string) => {
    try {
      const res = await apiClient.get(`/ai/questions/job/${id}`);
      const data = res.data;
      
      setProgress(data.progress || 0);
      setJobStatus(data.state);

      if (data.state === 'completed') {
        setLoading(false);
        setSuccessMsg('Questions generated successfully!');
      } else if (data.state === 'failed') {
        setLoading(false);
        setErrorMsg(`Generation failed: ${data.failedReason || 'Unknown error'}`);
      } else {
        // Continue polling
        setTimeout(() => pollJobStatus(id), 2000);
      }
    } catch (err) {
      console.error('Failed to poll status', err);
      // Fallback: stop polling on error
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setProgress(0);
    setJobStatus('queued');

    try {
      const res = await apiClient.post('/ai/questions/generate', {
        ...formData,
        subject_id: parseInt(formData.subject_id),
        grade_level: parseInt(formData.grade_level),
        learning_outcome_id: parseInt(formData.learning_outcome_id),
        learning_indicator_id: formData.learning_indicator_id ? parseInt(formData.learning_indicator_id) : undefined,
        count: parseInt(formData.count.toString()),
        term: formData.term,
      });
      
      const newJobId = res.data.job_id;
      if (newJobId) {
        setJobId(newJobId);
        pollJobStatus(newJobId);
      } else {
        setSuccessMsg(res.data.message || 'AI Question generation task queued successfully!');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to queue generation. Please try again.');
      setLoading(false);
    }
  };

  const curriculumGrade = formData.term === '1' ? parseInt(formData.grade_level) - 1 : parseInt(formData.grade_level);

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1200px] mx-auto bg-[#f4f7fb]">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Wand2 size={24} strokeWidth={2.5} />
          </div>
          Generate Questions
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Use AI to automatically generate high-quality questions based on curriculum outcomes.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
          <CheckCircle className="text-emerald-500 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">Generation Queued!</h4>
            <p className="text-xs font-medium text-emerald-600 mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-red-800">Error</h4>
            <p className="text-xs font-medium text-red-600 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {loading && jobId && (
        <div className="mb-6 p-6 bg-white border border-indigo-100 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={16} />
              Generating Questions via AI ({jobStatus})...
            </h4>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        
        {/* Step 1: Curriculum Context */}
        <div className="p-8 border-b border-gray-100 bg-[#fafcff]">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[11px]">1</span>
            Curriculum Context
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><BookOpen size={14} className="text-blue-500"/> Subject</label>
              <div className="relative">
                <select name="subject_id" value={formData.subject_id} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm">
                  <option value="1">Mathematics</option>
                  <option value="2">Science</option>
                  <option value="3">English</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><GraduationCap size={14} className="text-emerald-500"/> Grade Level</label>
              <div className="relative">
                <select name="grade_level" value={formData.grade_level} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm">
                  <option value="3">Grade 3</option>
                  <option value="5">Grade 5</option>
                  <option value="8">Grade 8</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><GraduationCap size={14} className="text-emerald-500"/> Curriculum Grade (Auto)</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed">
                Grade {curriculumGrade}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Target size={14} className="text-purple-500"/> Learning Outcome (ID)</label>
              <input 
                type="number" 
                name="learning_outcome_id" 
                value={formData.learning_outcome_id} 
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Target size={14} className="text-purple-500"/> Learning Indicator (ID)</label>
              <input 
                type="number" 
                name="learning_indicator_id" 
                value={formData.learning_indicator_id} 
                onChange={handleChange}
                placeholder="Optional"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 2: AI Constraints */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[11px]">2</span>
            Generation Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bloom's Level</label>
              <div className="relative">
                <select name="bloom_level" value={formData.bloom_level} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="remembering">Remembering</option>
                  <option value="understanding">Understanding</option>
                  <option value="applying">Applying</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="evaluating">Evaluating</option>
                  <option value="creating">Creating</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
              <div className="relative">
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Term</label>
              <div className="relative">
                <select name="term" value={formData.term} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="1">Term 1 (Diagnostic)</option>
                  <option value="2">Term 2 (Achievement)</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">LLM Provider</label>
              <div className="relative">
                <select name="llm_provider" value={formData.llm_provider} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="gemini">Gemini 2.5 Flash (Google) — default</option>
                  <option value="openai">GPT-4o (OpenAI)</option>
                  <option value="groq">Groq (Llama 3 70B) — free tier</option>
                  <option value="deepseek">DeepSeek Chat — cheap</option>
                  <option value="kimi">Kimi (Moonshot) — free tier</option>
                  <option value="mock">Mock (Test, no API key)</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Count</label>
              <input 
                type="number" 
                name="count" 
                min="1" 
                max="10" 
                value={formData.count} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white flex items-center justify-end gap-4">
          <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Reset Defaults
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

      </form>
    </div>
  );
}
