'use client';

import React, { useState } from 'react';
import { Settings, Play, Server, Clock, CheckCircle2, ChevronRight, Activity, Percent } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function AssessmentBlueprintPage() {
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    subject_id: '1', // Default Math
    grade_level: 5,
    term: '2', // Term 2 Achievement
    chapter_id: '1',
    learning_outcome_id: '1',
    learning_indicator_id: '',
    bloom_level: 'apply',
    difficulty: 'medium',
    count: 10, // Default batch size
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setJobStatus(null);
    try {
      const payload = {
        ...formData,
        subject_id: parseInt(formData.subject_id),
        grade_level: parseInt(formData.grade_level.toString()),
        chapter_id: formData.chapter_id ? parseInt(formData.chapter_id) : undefined,
        learning_outcome_id: parseInt(formData.learning_outcome_id),
        learning_indicator_id: formData.learning_indicator_id ? parseInt(formData.learning_indicator_id) : undefined,
        count: parseInt(formData.count.toString()),
      };
      
      const res = await apiClient.post('/ai/questions/generate', payload);
      
      setJobStatus({
        status: res.data.status,
        message: res.data.message,
        missing_count: res.data.missing_count,
        reused_count: res.data.reused_count,
        estimated_time_ms: res.data.estimated_time_ms,
        jobs: res.data.jobs,
      });
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to trigger generation.');
    } finally {
      setLoading(false);
    }
  };

  const curriculumGrade = formData.term === '1' ? parseInt(formData.grade_level.toString()) - 1 : parseInt(formData.grade_level.toString());

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1200px] mx-auto bg-[#f4f7fb]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <Settings className="text-indigo-600" size={32} />
          Assessment Blueprint Generator
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-3xl leading-relaxed">
          Configure the exact educational quotas (Difficulty, Bloom's Taxonomy, Competencies) for the upcoming assessment. The AI Engine will automatically fulfill the blueprint by searching the Question Bank and generating only the missing delta via BullMQ.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left: Configuration Form */}
        <div className="w-2/3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Activity size={18} className="text-indigo-500" /> Blueprint Distribution Configuration
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
              <select name="subject_id" value={formData.subject_id} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                <option value="1">Mathematics</option>
                <option value="2">Science</option>
                <option value="3">English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assessment Grade</label>
              <select name="grade_level" value={formData.grade_level} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                <option value="3">Grade 3</option>
                <option value="5">Grade 5</option>
                <option value="8">Grade 8</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assessment Term</label>
              <select name="term" value={formData.term} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                <option value="1">Term 1 (Diagnostic - Uses Previous Grade Curriculum)</option>
                <option value="2">Term 2 (Achievement - Uses Current Grade Curriculum)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Curriculum Grade (Auto)</label>
              <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed">
                Grade {curriculumGrade}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Chapter (ID) - Optional</label>
              <input type="number" name="chapter_id" value={formData.chapter_id} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Learning Outcome (ID)</label>
                <input type="number" name="learning_outcome_id" value={formData.learning_outcome_id} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Learning Indicator (ID) - Optional</label>
                <input type="number" name="learning_indicator_id" value={formData.learning_indicator_id} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bloom's Taxonomy Level</label>
              <select name="bloom_level" value={formData.bloom_level} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                <option value="understand">Understand (Conceptual)</option>
                <option value="apply">Apply (Scenario/Application)</option>
                <option value="analyze">Analyze (Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Difficulty Quota</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                <option value="easy">Easy (30%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="hard">Hard (20%)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Percent size={14} /> Total Questions to Generate (Batch Size)
              </label>
              <input type="number" name="count" min="1" max="50" value={formData.count} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              <p className="text-[10px] text-gray-400 mt-2">* Default batch max is 10 per LLM call. Requesting 50 will automatically spawn 5 isolated BullMQ jobs.</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] hover:shadow-[0_12px_24px_-10px_rgba(79,70,229,0.6)] transition-all disabled:opacity-50"
          >
            {loading ? <Server className="animate-pulse" size={20} /> : <Play size={20} className="fill-white" />}
            {loading ? 'Fulfilling Blueprint...' : 'Execute Blueprint Generation'}
          </button>
        </div>

        {/* Right: Live Status Dashboard */}
        <div className="w-1/3">
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-6 rounded-3xl shadow-xl border border-indigo-900/50 text-white sticky top-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
              <Server size={16} /> Live Generation Status
            </h3>

            {!jobStatus ? (
              <div className="py-12 text-center text-indigo-300/50">
                <Clock size={40} className="mx-auto mb-4 opacity-50" strokeWidth={1} />
                <p className="text-sm font-medium">No active blueprint generation jobs.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Status Message</p>
                  <p className="text-sm font-medium leading-relaxed">{jobStatus.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Reused (Bank)</p>
                    <p className="text-3xl font-extrabold text-emerald-400">{jobStatus.reused_count}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Missing Delta</p>
                    <p className="text-3xl font-extrabold text-orange-400">{jobStatus.missing_count}</p>
                  </div>
                </div>

                {jobStatus.missing_count > 0 && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">BullMQ Batches</span>
                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-white">{jobStatus.jobs?.length || 0} Jobs</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Estimated Time</span>
                        <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">~{(jobStatus.estimated_time_ms / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors"
                  onClick={() => window.location.href = '/super-admin/questions/review'}
                >
                  Go to SME Review Queue <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
