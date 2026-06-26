'use client';

import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle, AlertCircle, ChevronDown, BookOpen, GraduationCap, Target } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function GenerateQuestionsPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    subject_id: '1',
    grade_level: '5',
    learning_outcome_id: '48',
    bloom_level: 'understanding',
    difficulty: 'medium',
    question_type: 'mcq',
    count: 5,
    llm_provider: 'gemini',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await apiClient.post('/ai/questions/generate', {
        ...formData,
        subject_id: parseInt(formData.subject_id),
        grade_level: parseInt(formData.grade_level),
        learning_outcome_id: parseInt(formData.learning_outcome_id),
        count: parseInt(formData.count.toString()),
      });
      setSuccessMsg(res.data.message || 'AI Question generation task queued successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to queue generation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Question Type</label>
              <div className="relative">
                <select name="question_type" value={formData.question_type} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="mcq">Multiple Choice</option>
                  <option value="scenario_based">Scenario Based</option>
                  <option value="assertion_reason">Assertion & Reason</option>
                  <option value="competency_task">Competency Task</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">LLM Provider</label>
              <div className="relative">
                <select name="llm_provider" value={formData.llm_provider} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="gemini">1. Gemini 1.5 Flash (Google)</option>
                  <option value="openai">2. GPT-4o (OpenAI)</option>
                  <option value="claude">3. Claude 3.5 Sonnet (Anthropic)</option>
                  <option value="llama">4. Llama 3 70B (Meta)</option>
                  <option value="kimi">5. Kimi (Moonshot)</option>
                  <option value="mistral">6. Mistral Large (Mistral AI)</option>
                  <option value="cohere">7. Command R+ (Cohere)</option>
                  <option value="deepseek">8. DeepSeek Coder (DeepSeek)</option>
                  <option value="qwen">9. Qwen Max (Alibaba)</option>
                  <option value="yi">10. Yi Large (01.AI)</option>
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
