'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wand2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, BookOpen, GraduationCap, Target, FileText, Users, Settings, Eye, Save, Check, ThumbsUp, ThumbsDown, Sparkles, Minus, Plus, Info, Pencil, X, Send, Image, BarChart3, Upload, Trash2, GripVertical, ZoomIn, ArrowUpDown, Filter, Star, Shield, AlertTriangle, CheckSquare, Clock, List, MessageSquare, Bot, Cog } from 'lucide-react';
import apiClient from '@/lib/api-client';

const GRADES = [
  { value: '3', label: 'Grade 3' },
  { value: '6', label: 'Grade 6' },
  { value: '9', label: 'Grade 9' },
];

const BLOOM_LEVELS = [
  { value: 'remembering', label: 'Remembering' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'applying', label: 'Applying' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'creating', label: 'Creating' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

function QualityRadar({ scores }: { scores: { quality: number | null; competency: number | null; bloom: number | null; difficulty: number | null; language: number | null } }) {
  const labels = ['Quality', 'Competency', 'Bloom', 'Difficulty', 'Language'];
  const values = [scores.quality ?? 0, scores.competency ?? 0, scores.bloom ?? 0, scores.difficulty ?? 0, scores.language ?? 0];
  const cx = 60, cy = 60, r = 48;
  const angle = (i: number) => (Math.PI * 2 * i) / 5 - Math.PI / 2;
  const point = (i: number, v: number) => ({ x: cx + r * (v / 100) * Math.cos(angle(i)), y: cy + r * (v / 100) * Math.sin(angle(i)) });
  const gridLevels = [20, 40, 60, 80, 100];
  const dataPoints = values.map((v, i) => point(i, v));
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {gridLevels.map(level => (
        <polygon key={level} points={[0, 1, 2, 3, 4].map(i => `${cx + r * (level / 100) * Math.cos(angle(i))},${cy + r * (level / 100) * Math.sin(angle(i))}`).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle(i))} y2={cy + r * Math.sin(angle(i))} stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" stroke="white" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4].map(i => {
        const lx = cx + (r + 12) * Math.cos(angle(i));
        const ly = cy + (r + 12) * Math.sin(angle(i));
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="text-[6px] font-bold fill-gray-500">{labels[i]}</text>;
      })}
    </svg>
  );
}

export default function GenerateQuestionsPage() {
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');
  const [activeGenStep, setActiveGenStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOperating, setBulkOperating] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{ url: string; alt: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [qualityFilter, setQualityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [loadingLOs, setLoadingLOs] = useState(false);

  const [formData, setFormData] = useState({
    grade_level: '3',
    subject_id: '',
    competency_id: '',
    learning_outcome_id: '',
    bloom_level: 'understanding',
    difficulty: 'medium',
    term: '2',
    count: 5,
    visual_question_count: 2,
    llm_provider: 'nvidia',
    additional_instructions: '',
  });

  useEffect(() => { setMounted(true); }, []);

  const curriculumGrade = formData.term === '1' ? parseInt(formData.grade_level) - 1 : parseInt(formData.grade_level);

  useEffect(() => {
    if (!mounted) return;
    
    // First try filtering subjects by the strict curriculum grade
    apiClient.get(`/curriculum/subjects?gradeLevel=${curriculumGrade}`).then(res => {
      let fetchedSubjects = Array.isArray(res.data) ? res.data : [];
      
      // Fallback 1: If no subjects found for curriculum grade (e.g. Grade 2 missing), try the assessment grade
      if (fetchedSubjects.length === 0 && formData.grade_level) {
        return apiClient.get(`/curriculum/subjects?gradeLevel=${formData.grade_level}`).then(res2 => {
          fetchedSubjects = Array.isArray(res2.data) ? res2.data : [];
          // Fallback 2: If STILL no subjects found, fetch all subjects
          if (fetchedSubjects.length === 0) {
            return apiClient.get('/curriculum/subjects').then(res3 => {
              setSubjects(Array.isArray(res3.data) ? res3.data : []);
            });
          }
          setSubjects(fetchedSubjects);
        });
      }
      
      setSubjects(fetchedSubjects);
    }).catch(() => setSubjects([]));
  }, [mounted, curriculumGrade, formData.grade_level]);

  useEffect(() => {
    if (!mounted || !formData.subject_id) {
      setCompetencies([]);
      setLearningOutcomes([]);
      setFormData(prev => ({ ...prev, competency_id: '', learning_outcome_id: '' }));
      return;
    }
    setLoadingCompetencies(true);
    setCompetencies([]);
    setLearningOutcomes([]);
    setFormData(prev => ({ ...prev, competency_id: '', learning_outcome_id: '' }));

    apiClient.get(`/curriculum/subjects/${formData.subject_id}/goals`).then(res => {
      const goals = Array.isArray(res.data) ? res.data : [];
      let matchingGoals = goals.filter((g: any) => g.gradeLevel === curriculumGrade);
      
      // Fallback if specific curriculum grade is missing in DB
      if (matchingGoals.length === 0) {
        matchingGoals = goals.filter((g: any) => g.gradeLevel === parseInt(formData.grade_level));
      }
      if (matchingGoals.length === 0) {
        matchingGoals = goals;
      }
      const compPromises = matchingGoals.map((g: any) =>
        apiClient.get(`/curriculum/goals/${g.id}/competencies`).then(r => Array.isArray(r.data) ? r.data : []).catch(() => [])
      );
      return Promise.all(compPromises);
    }).then(compArrays => {
      const allComps = compArrays.flat();
      const uniqueComps = allComps.filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === c.id) === i);
      setCompetencies(uniqueComps);
    }).catch(() => setCompetencies([])).finally(() => setLoadingCompetencies(false));
  }, [mounted, formData.subject_id, curriculumGrade]);

  useEffect(() => {
    if (!mounted || !formData.competency_id) {
      setLearningOutcomes([]);
      setFormData(prev => ({ ...prev, learning_outcome_id: '' }));
      return;
    }
    setLoadingLOs(true);
    setLearningOutcomes([]);
    setFormData(prev => ({ ...prev, learning_outcome_id: '' }));

    apiClient.get(`/curriculum/competencies/${formData.competency_id}/learning-outcomes`).then(res => {
      setLearningOutcomes(Array.isArray(res.data) ? res.data : []);
    }).catch(() => setLearningOutcomes([])).finally(() => setLoadingLOs(false));
  }, [mounted, formData.competency_id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'grade_level') {
        next.subject_id = '';
        next.competency_id = '';
        next.learning_outcome_id = '';
      }
      if (name === 'subject_id') {
        next.competency_id = '';
        next.learning_outcome_id = '';
      }
      if (name === 'competency_id') {
        next.learning_outcome_id = '';
      }
      return next;
    });
  };

  const pollJobStatus = async (id: string) => {
    try {
      const res = await apiClient.get(`/ai/questions/job/${id}`);
      const data = res.data;
      const pct = data.progress || 0;
      setProgress(pct);
      setJobStatus(data.state);
      if (pct < 15) setActiveGenStep(0);
      else if (pct < 30) setActiveGenStep(1);
      else if (pct < 50) setActiveGenStep(2);
      else if (pct < 80) setActiveGenStep(3);
      else if (pct < 95) setActiveGenStep(4);
      else setActiveGenStep(5);
      if (data.state === 'completed') {
        setLoading(false);
        setCurrentStep(3);
        setGeneratedCount(data.question_ids?.length || 0);
        setSuccessMsg('Questions generated successfully!');
        if (data.question_ids?.length > 0) {
          try {
            const qRes = await apiClient.get(`/questions?ids=${data.question_ids.join(',')}`);
            setGeneratedQuestions(qRes.data.data || []);
          } catch (e) { console.error('Failed to fetch generated questions', e); }
        }
      } else if (data.state === 'failed') {
        setLoading(false);
        setErrorMsg(`Generation failed: ${data.failedReason || 'Unknown error'}`);
      } else {
        if (pct > 0) setCurrentStep(2);
        setTimeout(() => pollJobStatus(id), 2000);
      }
    } catch (err) {
      console.error('Failed to poll status', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.learning_outcome_id) { setErrorMsg('Please select a Learning Outcome.'); return; }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setProgress(0);
    setJobStatus('queued');
    setCurrentStep(2);
    try {
      const res = await apiClient.post('/ai/questions/generate', {
        subject_id: parseInt(formData.subject_id),
        grade_level: parseInt(formData.grade_level),
        competency_id: formData.competency_id ? parseInt(formData.competency_id) : undefined,
        learning_outcome_id: parseInt(formData.learning_outcome_id),
        bloom_level: formData.bloom_level,
        difficulty: formData.difficulty,
        term: formData.term,
        count: formData.count,
        llm_provider: formData.llm_provider,
        visual_question_count: formData.visual_question_count,
        additional_instructions: formData.additional_instructions || undefined,
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

  const handleInlineReview = async (id: string, status: 'approved' | 'rejected') => {
    setReviewingId(id);
    try {
      await apiClient.patch(`/questions/${id}/status`, { status });
      if (status === 'approved') {
        await apiClient.post(`/questions/${id}/submit`);
      }
      setGeneratedQuestions(prev => prev.filter(q => q.id !== id));
      setGeneratedCount(c => c - 1);
    } catch (err: any) { console.error('Inline review failed', err); }
    finally { setReviewingId(null); }
  };

  const startEditing = (q: any) => {
    setEditingId(q.id);
    setEditDraft({
      questionText: q.questionText,
      contextText: q.contextText || '',
      correctExplanation: q.correctExplanation || '',
      qualityScore: q.qualityScore ?? 0,
      competencyMatchScore: q.competencyMatchScore ?? 0,
      bloomMatchScore: q.bloomMatchScore ?? 0,
      difficultyMatchScore: q.difficultyMatchScore ?? 0,
      languageQualityScore: q.languageQualityScore ?? 0,
      mediaUrl: q.mediaUrl || '',
      options: q.options?.map((o: any) => ({
        optionKey: o.optionKey,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
        distractorCategory: o.distractorCategory || '',
      })) || [],
    });
  };

  const cancelEditing = () => { setEditingId(null); setEditDraft(null); };

  const saveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      await apiClient.patch(`/questions/${id}`, editDraft);
      setGeneratedQuestions(prev => prev.map(q => q.id === id ? {
        ...q,
        ...editDraft,
        options: editDraft.options.map((o: any) => ({ ...q.options?.find((x: any) => x.optionKey === o.optionKey), ...o })),
      } : q));
      setEditingId(null);
      setEditDraft(null);
    } catch (err) { console.error('Save edit failed', err); }
    finally { setSavingEdit(false); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === generatedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(generatedQuestions.map(q => q.id)));
    }
  };

  const handleBulkApprove = async () => {
    setBulkOperating(true);
    try {
      const promises = Array.from(selectedIds).map(async (id) => {
        await apiClient.patch(`/questions/${id}/status`, { status: 'approved' });
        await apiClient.post(`/questions/${id}/submit`);
      });
      await Promise.all(promises);
      setGeneratedQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
      setGeneratedCount(c => c - selectedIds.size);
      setSelectedIds(new Set());
    } catch (err) { console.error('Bulk approve failed', err); }
    finally { setBulkOperating(false); }
  };

  const handleBulkReject = async () => {
    setBulkOperating(true);
    try {
      const promises = Array.from(selectedIds).map(id =>
        apiClient.patch(`/questions/${id}/status`, { status: 'rejected' })
      );
      await Promise.all(promises);
      setGeneratedQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
      setGeneratedCount(c => c - selectedIds.size);
      setSelectedIds(new Set());
    } catch (err) { console.error('Bulk reject failed', err); }
    finally { setBulkOperating(false); }
  };

  const updateEditOption = (idx: number, field: string, value: any) => {
    setEditDraft((prev: any) => {
      const opts = [...prev.options];
      opts[idx] = { ...opts[idx], [field]: value };
      return { ...prev, options: opts };
    });
  };

  const setCorrectOption = (idx: number) => {
    setEditDraft((prev: any) => ({
      ...prev,
      options: prev.options.map((o: any, i: number) => ({ ...o, isCorrect: i === idx })),
    }));
  };

  const handleImageUpload = async (qId: string, file: File) => {
    setUploadingImage(qId);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const res = await apiClient.post('/upload', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.url || res.data?.response?.url || URL.createObjectURL(file);
      await apiClient.patch(`/questions/${qId}`, { mediaUrl: url });
      setGeneratedQuestions(prev => prev.map(q => q.id === qId ? { ...q, mediaUrl: url } : q));
    } catch (err) {
      console.error('Image upload failed', err);
      const localUrl = URL.createObjectURL(file);
      setGeneratedQuestions(prev => prev.map(q => q.id === qId ? { ...q, mediaUrl: localUrl } : q));
    } finally { setUploadingImage(null); }
  };

  const getOverallQuality = (q: any): { score: number; label: string; color: string } => {
    const scores = [q.qualityScore, q.competencyMatchScore, q.bloomMatchScore, q.difficultyMatchScore, q.languageQualityScore].filter(s => s != null);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    if (avg >= 80) return { score: avg, label: 'Excellent', color: 'emerald' };
    if (avg >= 60) return { score: avg, label: 'Good', color: 'amber' };
    return { score: avg, label: 'Needs Work', color: 'red' };
  };

  const filteredQuestions = generatedQuestions.filter(q => {
    if (qualityFilter === 'all') return true;
    const quality = getOverallQuality(q);
    if (qualityFilter === 'high') return quality.score >= 80;
    if (qualityFilter === 'medium') return quality.score >= 60 && quality.score < 80;
    if (qualityFilter === 'low') return quality.score < 60;
    return true;
  });

  const scoreColor = (score: number | null | undefined) => {
    if (score == null) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const canSubmit = mounted && formData.grade_level && formData.subject_id && formData.learning_outcome_id && formData.competency_id;

  if (!mounted) {
    return (
      <div className="min-h-screen p-6 max-w-[1280px] mx-auto bg-[#f4f7fb]">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-xl w-48" />
          <div className="h-6 bg-gray-200 rounded-lg w-96" />
          <div className="bg-white rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-gray-900 font-sans max-w-[1280px] mx-auto bg-[#f4f7fb]" suppressHydrationWarning>
      <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 8s linear infinite; }`}</style>

      {/* ═══ IMAGE PREVIEW MODAL ═══ */}
      {imagePreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8" onClick={() => setImagePreview(null)}>
          <div className="relative max-w-4xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <img src={imagePreview.url} alt={imagePreview.alt} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            <button onClick={() => setImagePreview(null)} className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"><X size={20} /></button>
          </div>
        </div>
      )}

      {/* Step Progress — Dynamic */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)] mb-7 px-10 py-6">
        <div className="flex items-center">
          {[
            { num: 1, title: 'Configure', desc: 'Set up generation parameters', icon: Settings },
            { num: 2, title: 'Generate', desc: 'AI will generate questions', icon: Wand2 },
            { num: 3, title: 'Review', desc: 'Review and edit generated questions', icon: Eye },
            { num: 4, title: 'Save', desc: 'Save draft or submit for review', icon: Save },
          ].map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;
            const isPending = currentStep < step.num;
            return (
              <React.Fragment key={step.num}>
                <div
                  className={`flex items-center gap-3 flex-shrink-0 ${isCompleted ? 'cursor-pointer' : ''}`}
                  onClick={() => { if (isCompleted) setCurrentStep(step.num); }}
                >
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.35)]' : isActive ? 'bg-indigo-600 shadow-[0_2px_8px_rgba(79,70,229,0.35)]' : 'bg-gray-100'
                  }`}>
                    {isCompleted ? <Check size={16} className="text-white" strokeWidth={3} /> : <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.num}</span>}
                    {isActive && <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400/30 opacity-75" />}
                  </div>
                  <div className={`transition-all duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                    <p className={`text-sm font-bold transition-colors duration-300 ${isCompleted ? 'text-emerald-700' : isActive ? 'text-indigo-700' : 'text-gray-400'}`}>{step.title}</p>
                    <p className="text-[11px] font-medium text-gray-400 leading-tight whitespace-nowrap">{step.desc}</p>
                  </div>
                </div>
                {idx < 3 && (
                  <div className="flex-1 mx-5">
                    <div className="relative h-[3px] rounded-full bg-gray-100 overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                        isCompleted ? 'bg-emerald-400' : isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-300' : 'bg-transparent'
                      }`} style={{ width: isCompleted ? '100%' : isActive && progress > 0 ? `${Math.max(progress, 10)}%` : '0%' }} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Generation Status */}
      {(loading || successMsg || errorMsg) && currentStep >= 2 && (
        <div className={`mb-7 p-6 rounded-xl border shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)] transition-all duration-500 ${
          successMsg ? 'bg-emerald-50/70 border-emerald-200' : errorMsg ? 'bg-red-50/70 border-red-200' : 'bg-indigo-50/60 border-indigo-200'
        }`}>
          {loading && (
            <div>
              {/* Header with AI Robot */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border-4 border-indigo-200 flex items-center justify-center">
                    <Bot size={36} className="text-indigo-600" />
                  </div>
                  <div className="absolute inset-0 rounded-full animate-spin-slow border-2 border-dashed border-indigo-300" style={{ animationDuration: '8s' }} />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                    <Cog size={14} className="text-white animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">LAT AI is generating your questions...</h3>
                  <p className="text-sm text-gray-500 font-medium">This may take a few moments while we create high-quality, competency-aligned questions for you.</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" style={{ width: `${Math.max(progress, 2)}%` }} />
                    </div>
                    <span className="text-sm font-extrabold text-indigo-600 w-12 text-right">{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-0">
                {[
                  { title: 'Reading your inputs', desc: 'Understanding grade, subject, competency and learning outcome.', doneIcon: <Check size={14} className="text-white" strokeWidth={3} /> },
                  { title: 'Analyzing competency & learning outcome', desc: 'Mapping key concepts, sub-concepts and real-life contexts.', doneIcon: <Check size={14} className="text-white" strokeWidth={3} /> },
                  { title: 'Planning question blueprint', desc: 'Deciding question types, difficulty and Bloom\'s level distribution.', doneIcon: <Check size={14} className="text-white" strokeWidth={3} /> },
                  { title: 'Generating questions', desc: 'Creating questions with options and correct answers.', doneIcon: <Loader2 size={14} className="text-white animate-spin" /> },
                  { title: 'Reviewing for quality', desc: 'Checking clarity, accuracy, distractors and alignment.', doneIcon: <Clock size={14} className="text-gray-400" /> },
                  { title: 'Finalizing questions', desc: 'Formatting and preparing questions for your review.', doneIcon: <FileText size={14} className="text-gray-400" /> },
                ].map((step, i) => {
                  const isCompleted = activeGenStep > i;
                  const isActive = activeGenStep === i;
                  const isPending = activeGenStep < i;
                  return (
                    <div key={i} className="flex items-stretch gap-4">
                      {/* Timeline Connector */}
                      <div className="flex flex-col items-center w-8 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.3)]' : isActive ? 'bg-indigo-600 shadow-[0_2px_8px_rgba(79,70,229,0.3)]' : 'bg-gray-100 border-2 border-gray-200'
                        }`}>
                          {isCompleted ? step.doneIcon : isActive ? <Loader2 size={14} className="text-white animate-spin" /> : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>}
                        </div>
                        {i < 5 && <div className={`w-0.5 flex-1 my-1 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-300' : isActive ? 'bg-indigo-200' : 'bg-gray-100'}`} />}
                      </div>
                      {/* Step Content */}
                      <div className={`flex-1 flex items-center justify-between py-2.5 rounded-xl px-4 mb-2 transition-all duration-300 ${
                        isActive ? 'bg-indigo-50/80 border border-indigo-100' : isCompleted ? 'bg-emerald-50/50 border border-emerald-50' : 'bg-transparent border border-transparent'
                      }`}>
                        <div>
                          <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : isActive ? 'text-indigo-700' : 'text-gray-400'}`}>{step.title}</p>
                          <p className={`text-xs font-medium ${isCompleted ? 'text-emerald-500' : isActive ? 'text-indigo-400' : 'text-gray-300'}`}>{step.desc}</p>
                        </div>
                        <div className="shrink-0 ml-4">
                          {isCompleted && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">Completed <CheckCircle size={13} /></span>}
                          {isActive && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-full"><Loader2 size={13} className="animate-spin" /> In progress</span>}
                          {isPending && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"><Clock size={13} /> Pending</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {successMsg && !loading && generatedQuestions.length === 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={16} className="text-white" strokeWidth={3} /></div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-800">Generation Complete</h4>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">{generatedCount} questions generated successfully. Ready for review.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setCurrentStep(1); setSuccessMsg(''); setErrorMsg(''); setGeneratedCount(0); setActiveGenStep(0); }} className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-white/80 hover:bg-white px-3.5 py-2 rounded-lg border border-gray-200 transition-colors">Configure Again</button>
                <a href={`/sme/questions/review${jobId ? `?jobId=${jobId}` : ''}`} className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"><Eye size={14} />Review Questions</a>
              </div>
            </div>
          )}
          {successMsg && !loading && generatedQuestions.length > 0 && currentStep === 3 && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Check size={16} className="text-white" strokeWidth={3} /></div>
              <p className="text-sm font-bold text-emerald-800">{generatedCount} questions generated. Review them below.</p>
            </div>
          )}
          {errorMsg && !loading && (
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                <div><h4 className="text-sm font-bold text-red-800">Generation Failed</h4><p className="text-xs font-medium text-red-600 mt-1">{errorMsg}</p></div>
              </div>
              <button onClick={() => { setCurrentStep(1); setErrorMsg(''); setSuccessMsg(''); setGeneratedCount(0); setJobId(null); setProgress(0); setJobStatus(''); setActiveGenStep(0); }} className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"><Wand2 size={14} />Retry</button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Inline Review Panel */}
      {currentStep === 3 && generatedQuestions.length > 0 && (
        <div className="mb-7">
          {/* ═══ SUMMARY STATS BAR ═══ */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total', value: generatedQuestions.length, icon: <FileText size={16} />, color: 'indigo' },
              { label: 'Approved', value: generatedQuestions.filter(q => q.overallReviewResult === 'approved').length, icon: <CheckCircle size={16} />, color: 'emerald' },
              { label: 'Pending', value: generatedQuestions.filter(q => !q.overallReviewResult).length, icon: <Clock size={16} />, color: 'amber' },
              { label: 'Avg Quality', value: `${Math.round(generatedQuestions.filter(q => q.qualityScore != null).reduce((a, q) => a + (q.qualityScore || 0), 0) / Math.max(generatedQuestions.filter(q => q.qualityScore != null).length, 1))}%`, icon: <BarChart3 size={16} />, color: 'blue' },
            ].map(s => (
              <div key={s.label} className={`bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${s.color}-50 text-${s.color}-600`}>{s.icon}</div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</p><p className="text-lg font-extrabold text-gray-900">{s.value}</p></div>
              </div>
            ))}
          </div>

          {/* ═══ TOOLBAR ═══ */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-5 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Eye size={20} className="text-indigo-600" /> Review & Edit</h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">{filteredQuestions.length} shown</span>
              {/* Quality Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 ml-2">
                {(['all', 'high', 'medium', 'low'] as const).map(f => (
                  <button key={f} onClick={() => setQualityFilter(f)} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${qualityFilter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {f === 'all' ? 'All' : f === 'high' ? '≥80%' : f === 'medium' ? '60-79%' : '<60%'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 mr-2">
                <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}><BarChart3 size={14} /></button>
                <button onClick={() => setViewMode('compact')} className={`p-1.5 rounded-md transition-all ${viewMode === 'compact' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}><List size={14} /></button>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={selectedIds.size === generatedQuestions.length && generatedQuestions.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                All ({selectedIds.size}/{generatedQuestions.length})
              </label>
              {selectedIds.size > 0 && (
                <>
                  <button onClick={handleBulkApprove} disabled={bulkOperating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50">
                    {bulkOperating ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}Approve ({selectedIds.size})
                  </button>
                  <button onClick={handleBulkReject} disabled={bulkOperating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50">
                    {bulkOperating ? <Loader2 size={12} className="animate-spin" /> : <ThumbsDown size={12} />}Reject ({selectedIds.size})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ═══ QUESTION CARDS ═══ */}
          <div className={viewMode === 'card' ? 'space-y-4' : 'space-y-2'}>
            {filteredQuestions.map((q, qi) => {
              const isEditing = editingId === q.id;
              const isSelected = selectedIds.has(q.id);
              const quality = getOverallQuality(q);
              const isExpanded = expandedId === q.id;
              const reviewStatus = q.overallReviewResult;
              return (
                <div key={q.id} className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${isSelected ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>

                  {/* ─── Card Header ─── */}
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(q.id)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-extrabold">Q{qi + 1}</span>
                      {/* Badges */}
                      <span className="text-[10px] font-bold text-gray-500 uppercase bg-white px-2.5 py-1 rounded-full border border-gray-200">{q.bloomTaxonomy}</span>
                      <span className="text-[10px] font-bold uppercase bg-white px-2.5 py-1 rounded-full border border-gray-200" style={{ color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'medium' ? '#d97706' : '#059669' }}>{q.difficulty}</span>
                      {reviewStatus && (
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {reviewStatus === 'approved' ? '✓ SME Approved' : '✗ Rejected'}
                        </span>
                      )}
                      {!reviewStatus && q.qualityScore != null && (
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${quality.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : quality.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                          {quality.label} · {quality.score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setExpandedId(isExpanded ? null : q.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title={isExpanded ? 'Collapse' : 'Expand'}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {!isEditing && (
                        <button onClick={() => startEditing(q)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors">
                          <Pencil size={11} />Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    {/* ─── Media Preview ─── */}
                    {q.mediaUrl && !isEditing && (
                      <div className="mb-4 relative group cursor-pointer" onClick={() => setImagePreview({ url: q.mediaUrl!, alt: 'Question image' })}>
                        <img src={q.mediaUrl} alt="Question visual" className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center"><ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" /></div>
                      </div>
                    )}

                    {/* ─── Image Upload Zone (edit mode) ─── */}
                    {isEditing && (
                      <div className="mb-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block flex items-center gap-1"><Image size={10} />Question Image</label>
                        {editDraft.mediaUrl ? (
                          <div className="relative group">
                            <img src={editDraft.mediaUrl} alt="Preview" className="w-full max-h-40 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                            <button onClick={() => setEditDraft((p: any) => ({ ...p, mediaUrl: '' }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                            {uploadingImage === q.id ? (
                              <div className="flex flex-col items-center gap-2"><Loader2 size={20} className="animate-spin text-indigo-500" /><span className="text-xs font-bold text-indigo-500">Uploading...</span></div>
                            ) : (
                              <div className="flex flex-col items-center gap-2"><Upload size={20} className="text-gray-400" /><span className="text-xs font-bold text-gray-500">Click or drag image</span><span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span></div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(q.id, f); }} />
                          </label>
                        )}
                        <input value={editDraft.mediaUrl} onChange={e => setEditDraft((p: any) => ({ ...p, mediaUrl: e.target.value }))} placeholder="Or paste image URL..." className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    )}

                    {/* ─── Question Text ─── */}
                    {isEditing ? (
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Question Text</label>
                          <textarea value={editDraft.questionText} onChange={e => setEditDraft((p: any) => ({ ...p, questionText: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Context / Scenario</label>
                          <textarea value={editDraft.contextText} onChange={e => setEditDraft((p: any) => ({ ...p, contextText: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Correct Explanation</label>
                          <textarea value={editDraft.correctExplanation} onChange={e => setEditDraft((p: any) => ({ ...p, correctExplanation: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
                        </div>
                      </div>
                    ) : (
                      <>
                        {q.contextText && <p className="text-xs text-gray-500 italic mb-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{q.contextText}</p>}
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-4">{q.questionText}</p>
                      </>
                    )}

                    {/* ─── Options ─── */}
                    <div className="space-y-2 mb-4">
                      {(isEditing ? editDraft.options : q.options)?.map((opt: any, oi: number) => {
                        const isCorrect = isEditing ? opt.isCorrect : opt.isCorrect;
                        return (
                          <div key={opt.optionKey || oi} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${isCorrect ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}>
                            <span className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-[11px] font-extrabold ${isCorrect ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}>{opt.optionKey}</span>
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input value={opt.optionText} onChange={e => updateEditOption(oi, 'optionText', e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500" />
                                <button onClick={() => setCorrectOption(oi)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{opt.isCorrect ? '✓ Correct' : 'Set Correct'}</button>
                              </div>
                            ) : (
                              <>
                                <span className={`font-medium ${isCorrect ? 'text-emerald-900' : 'text-gray-700'}`}>{opt.optionText}</span>
                                {isCorrect && <Check size={16} className="text-emerald-500 ml-auto shrink-0" />}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ─── Quality Visualization (view mode) ─── */}
                    {!isEditing && q.qualityScore != null && (
                      <div className="flex items-stretch gap-4 mb-4">
                        {/* Radar Chart (SVG Pentagon) */}
                        <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center justify-center">
                          <QualityRadar scores={{ quality: q.qualityScore, competency: q.competencyMatchScore, bloom: q.bloomMatchScore, difficulty: q.difficultyMatchScore, language: q.languageQualityScore }} />
                        </div>
                        {/* Score Bars */}
                        <div className="flex-1 space-y-2">
                          {[
                            { label: 'Quality', value: q.qualityScore, icon: <Star size={12} /> },
                            { label: 'Competency', value: q.competencyMatchScore, icon: <Target size={12} /> },
                            { label: 'Bloom', value: q.bloomMatchScore, icon: <BookOpen size={12} /> },
                            { label: 'Difficulty', value: q.difficultyMatchScore, icon: <BarChart3 size={12} /> },
                            { label: 'Language', value: q.languageQualityScore, icon: <FileText size={12} /> },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-2">
                              <span className="w-20 text-[10px] font-bold text-gray-500 flex items-center gap-1">{s.icon}{s.label}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${(s.value || 0) >= 80 ? 'bg-emerald-500' : (s.value || 0) >= 60 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${s.value || 0}%` }} />
                              </div>
                              <span className={`text-xs font-extrabold w-8 text-right ${scoreColor(s.value)}`}>{s.value ?? '--'}</span>
                            </div>
                          ))}
                          {/* Confidence */}
                          {q.confidenceScore != null && (
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                              <span className="w-20 text-[10px] font-bold text-gray-500 flex items-center gap-1"><Shield size={12} />Confidence</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${q.confidenceScore >= 80 ? 'bg-blue-500' : q.confidenceScore >= 60 ? 'bg-blue-400' : 'bg-blue-300'}`} style={{ width: `${q.confidenceScore}%` }} />
                              </div>
                              <span className={`text-xs font-extrabold w-8 text-right ${scoreColor(q.confidenceScore)}`}>{q.confidenceScore}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─── Score Overrides (edit mode) ─── */}
                    {isEditing && (
                      <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        {[{ label: 'Quality', key: 'qualityScore' }, { label: 'Competency', key: 'competencyMatchScore' }, { label: 'Bloom', key: 'bloomMatchScore' }, { label: 'Difficulty', key: 'difficultyMatchScore' }, { label: 'Language', key: 'languageQualityScore' }].map(({ label, key }) => (
                          <div key={key} className="text-center">
                            <label className="text-[9px] font-bold text-indigo-500 uppercase">{label}</label>
                            <input type="number" min={0} max={100} value={editDraft[key]} onChange={e => setEditDraft((p: any) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} className="w-full text-center text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg px-1 py-1.5 focus:ring-1 focus:ring-indigo-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ─── Agent 2 Feedback (expandable) ─── */}
                    {q.aiReviewerFeedback && !isEditing && isExpanded && (
                      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                        <span className="font-bold text-blue-700 not-italic flex items-center gap-1 mb-1"><MessageSquare size={12} />Agent 2 Review:</span>
                        {q.aiReviewerFeedback}
                      </div>
                    )}

                    {/* ─── Explanation (expandable) ─── */}
                    {q.correctExplanation && !isEditing && isExpanded && (
                      <div className="text-xs text-gray-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                        <span className="font-bold text-emerald-700 not-italic flex items-center gap-1 mb-1"><Info size={12} />Explanation:</span>
                        {q.correctExplanation}
                      </div>
                    )}
                  </div>

                  {/* ─── Action Bar ─── */}
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex items-center justify-between">
                    {isEditing ? (
                      <>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center gap-1"><Pencil size={10} />Editing Mode</span>
                        <div className="flex items-center gap-2">
                          <button onClick={cancelEditing} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors"><X size={12} />Cancel</button>
                          <button onClick={() => saveEdit(q.id)} disabled={savingEdit} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm">
                            {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}Save Changes
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-gray-400">{q.options?.length || 4} options · {q.questionText?.split(' ').length || 0} words</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleInlineReview(q.id, 'rejected')} disabled={reviewingId === q.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                            {reviewingId === q.id ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}Reject
                          </button>
                          <button onClick={() => handleInlineReview(q.id, 'approved')} disabled={reviewingId === q.id} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 transition-colors disabled:opacity-50 shadow-sm">
                            {reviewingId === q.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Approve & Submit to Admin
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQuestions.length === 0 && generatedQuestions.length > 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
              <Filter size={36} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700 mb-1">No questions match this filter</h3>
              <p className="text-sm text-gray-500">Try selecting a different quality level above.</p>
            </div>
          )}

          {generatedQuestions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-emerald-200 border-dashed">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-1">All Questions Reviewed</h3>
              <p className="text-sm font-medium text-emerald-600 mb-6">Every question has been approved and submitted to Super Admin.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => { setCurrentStep(1); setGeneratedQuestions([]); setGeneratedCount(0); setSuccessMsg(''); setJobId(null); setActiveGenStep(0); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">Generate More</button>
                <a href="/sme/questions/review" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">View All Questions</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Save/Summary */}
      {currentStep === 4 && (
        <div className="mb-7 p-8 bg-white rounded-xl border border-emerald-200 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)] text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">All Questions Submitted</h2>
          <p className="text-sm font-medium text-gray-500 mb-6">Questions have been approved and submitted to Super Admin for final approval.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => { setCurrentStep(1); setGeneratedQuestions([]); setGeneratedCount(0); setSuccessMsg(''); setJobId(null); setActiveGenStep(0); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">Generate More</button>
            <a href="/sme/questions/review" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">View All Questions</a>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 1: Configure — Two-Column Layout                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-6 items-start">

            {/* ─── Left: Form ─── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      <Settings size={12} /> Step 1 of 4
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      <Sparkles size={12} /> All fields are required
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 mt-4 mb-1">Configure Your Question Blueprint</h2>
                  <p className="text-sm text-gray-500">Provide details below to help AI generate accurate and relevant questions.</p>
                </div>

                {/* Form Grid */}
                <div className="px-8 pb-8 space-y-6">

                  {/* Row 1: Grade / Subject / Competency */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Grade <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select name="grade_level" value={formData.grade_level} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                          {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select name="subject_id" value={formData.subject_id} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                          <option value="">Select Subject</option>
                          {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Competency <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select name="competency_id" value={formData.competency_id} onChange={handleChange} disabled={!formData.subject_id || loadingCompetencies} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400">
                          <option value="">{loadingCompetencies ? 'Loading...' : competencies.length === 0 ? 'No competencies available' : 'Select Competency'}</option>
                          {competencies.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.description || `Competency ${c.code || c.id}`}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 1a: Term Selector — Controls which curriculum grade is used */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Assessment Term <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.term === '1' ? 'border-indigo-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input type="radio" name="term" value="1" checked={formData.term === '1'} onChange={handleChange} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.term === '1' ? 'border-indigo-500' : 'border-gray-300'}`}>
                          {formData.term === '1' && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Term 1 — Diagnostic</p>
                          <p className="text-[11px] font-medium text-gray-500">Uses <span className="font-bold text-indigo-600">Grade {parseInt(formData.grade_level) - 1}</span> curriculum</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.term === '2' ? 'border-indigo-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input type="radio" name="term" value="2" checked={formData.term === '2'} onChange={handleChange} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.term === '2' ? 'border-indigo-500' : 'border-gray-300'}`}>
                          {formData.term === '2' && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Term 2 — Achievement</p>
                          <p className="text-[11px] font-medium text-gray-500">Uses <span className="font-bold text-indigo-600">Grade {formData.grade_level}</span> curriculum</p>
                        </div>
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
                      <Info size={12} />
                      {formData.term === '1'
                        ? `Assessing Grade ${formData.grade_level} students on Grade ${parseInt(formData.grade_level) - 1} content (previous year's curriculum)`
                        : `Assessing Grade ${formData.grade_level} students on Grade ${formData.grade_level} content (current year's curriculum)`}
                    </p>
                  </div>

                  {/* Row 2: Learning Outcome / Bloom Level / Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        Learning Outcome <span className="text-red-400">*</span>
                        <span className="group relative"><Info size={13} className="text-gray-400 cursor-help" /><span className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5">Select the specific learning outcome that this question should assess.</span></span>
                      </label>
                      <div className="relative">
                        <select name="learning_outcome_id" value={formData.learning_outcome_id} onChange={handleChange} disabled={!formData.competency_id || loadingLOs} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400">
                          <option value="">{loadingLOs ? 'Loading...' : learningOutcomes.length === 0 ? 'No learning outcomes available' : 'Select Learning Outcome'}</option>
                          {learningOutcomes.map((lo: any) => <option key={lo.id} value={lo.id}>{lo.description?.length > 80 ? lo.description.substring(0, 80) + '...' : lo.description || lo.code}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Bloom Level <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select name="bloom_level" value={formData.bloom_level} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                          {BLOOM_LEVELS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Difficulty <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Number of Questions / Visual Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Number of Questions <span className="text-red-400">*</span></label>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))} className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200" disabled={formData.count <= 1}>
                          <Minus size={16} />
                        </button>
                        <div className="flex-1 text-center text-sm font-bold text-gray-900 py-3 select-none">{formData.count}</div>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, count: Math.min(10, prev.count + 1) }))} className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-200" disabled={formData.count >= 10}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        Visual Questions (Images) <span className="text-red-400">*</span>
                        <span className="group relative"><Info size={13} className="text-gray-400 cursor-help" /><span className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5">AI will automatically choose which questions benefit most from images.</span></span>
                      </label>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" onClick={() => setFormData(prev => ({ ...prev, visual_question_count: n }))} className={`flex-1 py-3 text-sm font-bold transition-all ${
                            formData.visual_question_count === n ? 'bg-indigo-600 text-white shadow-inner' : 'text-gray-500 hover:bg-gray-50'
                          }`}>
                            {n}
                          </button>
                        ))}
                      </div>
                      {formData.visual_question_count > 0 && (
                        <p className="text-[11px] font-medium text-indigo-500 mt-1.5">AI will automatically choose the {formData.visual_question_count} questions where images will be most helpful.</p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Additional Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Additional Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea name="additional_instructions" value={formData.additional_instructions} onChange={handleChange} rows={3} placeholder="Add any specific context, scenario, keywords, or constraints for the AI. E.g., Include real-life examples, local context, diagrams, avoid lengthy options, etc." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none" />
                  </div>

                  {/* Hidden fields */}
                  <input type="hidden" name="llm_provider" value={formData.llm_provider} />
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                  <button type="button" onClick={() => {
                    setFormData({ grade_level: '3', subject_id: '', competency_id: '', learning_outcome_id: '', bloom_level: 'understanding', difficulty: 'medium', term: '2', count: 5, visual_question_count: 2, llm_provider: 'nvidia', additional_instructions: '' });
                    setCompetencies([]);
                    setLearningOutcomes([]);
                  }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Reset Defaults
                  </button>
                  <button type="submit" disabled={loading || !canSubmit} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    {loading ? 'Generating...' : 'Generate Questions'}
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Right: Sidebar ─── */}
            <div className="hidden lg:block w-[280px] flex-shrink-0 space-y-5 pt-12">

              {/* AI Will Consider */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Sparkles size={16} className="text-indigo-600" /></div>
                  <h3 className="text-sm font-extrabold text-gray-900">AI will consider</h3>
                </div>
                <div className="space-y-3.5">
                  {[
                    { icon: <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={10} className="text-emerald-600" strokeWidth={3} /></div>, title: 'NCERT aligned content', desc: 'Questions aligned with NCERT learning outcomes.' },
                    { icon: <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"><Target size={10} className="text-blue-600" /></div>, title: 'Competency focused', desc: 'Questions generated based on selected competency.' },
                    { icon: <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><BarChart3Icon size={10} className="text-amber-600" /></div>, title: 'Bloom level & difficulty', desc: 'AI will match the cognitive level and difficulty you select.' },
                    { icon: <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center"><Check size={10} className="text-purple-600" strokeWidth={3} /></div>, title: 'Quality assured', desc: 'AI ensures clarity, accuracy and conceptual understanding.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900 leading-tight">{item.title}</p>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4">Best practices</h3>
                <div className="space-y-2.5">
                  {[
                    'Be specific with learning outcome',
                    'Select the right Bloom level',
                    'Choose appropriate difficulty',
                    'Add instructions for better results',
                    'Review and edit before submit',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><Check size={10} className="text-white" strokeWidth={3} /></div>
                      <span className="text-[12px] font-medium text-gray-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider (hidden settings) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-5">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Advanced Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">LLM Provider</label>
                    <div className="relative">
                      <select name="llm_provider" value={formData.llm_provider} onChange={handleChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option value="nvidia">NVIDIA Nemotron 550B</option>
                        <option value="gemini">Gemini 2.5 Flash</option>
                        <option value="openai">GPT-4o (OpenAI)</option>
                        <option value="groq">Groq (Llama 3 70B)</option>
                        <option value="deepseek">DeepSeek Chat</option>
                        <option value="kimi">Kimi (Moonshot)</option>
                        <option value="mock">Mock (Test)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}

function BarChart3Icon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
