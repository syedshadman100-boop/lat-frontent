const fs = require('fs');

let code = fs.readFileSync('c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/sme/questions/generate/page.tsx', 'utf8');

if (!code.includes('const [currentStep, setCurrentStep]')) {
  code = code.replace(
    'const [loadingLOs, setLoadingLOs] = useState(false);',
    'const [loadingLOs, setLoadingLOs] = useState(false);\n  const [currentStep, setCurrentStep] = useState(1);'
  );
}

const canSubmitReplacement = 
  const canProceedStep1 = mounted && formData.grade_level && formData.subject_id && formData.competency_id && formData.learning_outcome_id;
  const canProceedStep2 = mounted && formData.bloom_level && formData.difficulty && formData.count;
  const canSubmit = canProceedStep1 && canProceedStep2;
;

code = code.replace(/const canSubmit = [^;]+;/, canSubmitReplacement);

const newFormJSX = \
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
                  {/* Stepper Header */}
                  <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-extrabold text-gray-900">Configure Question Blueprint</h2>
                    </div>
                    
                    {/* Stepper UI */}
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full overflow-hidden -z-10">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}></div>
                      </div>
                      
                      {[
                        { num: 1, label: 'Alignment' },
                        { num: 2, label: 'Configuration' },
                        { num: 3, label: 'Review' }
                      ].map((step) => (
                        <div key={step.num} className="flex flex-col items-center gap-2 bg-white px-2">
                          <div className={\\\w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm border-2 \\\\\\}>
                            {currentStep > step.num ? <Check size={18} strokeWidth={3} /> : step.num}
                          </div>
                          <span className={\\\	ext-[11px] font-bold uppercase tracking-wider \\\\\\}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-8 py-8 space-y-6 min-h-[400px]">
                    {/* STEP 1: Alignment */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        </div>

                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Assessment Term <span className="text-red-400">*</span></label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className={\\\lex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all \\\\\\}>
                              <input type="radio" name="term" value="1" checked={formData.term === '1'} onChange={handleChange} className="hidden" />
                              <div className={\\\w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 \\\\\\}>
                                {formData.term === '1' && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Term 1 — Diagnostic</p>
                                <p className="text-[11px] font-medium text-gray-500">Uses <span className="font-bold text-indigo-600">Grade {parseInt(formData.grade_level) - 1}</span> curriculum</p>
                              </div>
                            </label>
                            <label className={\\\lex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all \\\\\\}>
                              <input type="radio" name="term" value="2" checked={formData.term === '2'} onChange={handleChange} className="hidden" />
                              <div className={\\\w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 \\\\\\}>
                                {formData.term === '2' && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Term 2 — Achievement</p>
                                <p className="text-[11px] font-medium text-gray-500">Uses <span className="font-bold text-indigo-600">Grade {formData.grade_level}</span> curriculum</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Competency <span className="text-red-400">*</span></label>
                            <div className="relative">
                              <select name="competency_id" value={formData.competency_id} onChange={handleChange} disabled={!formData.subject_id || loadingCompetencies} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400">
                                <option value="">{loadingCompetencies ? 'Loading...' : competencies.length === 0 ? 'No competencies available' : 'Select Competency'}</option>
                                {competencies.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.description || \Competency \\}</option>)}
                              </select>
                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                              Learning Outcome <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <select name="learning_outcome_id" value={formData.learning_outcome_id} onChange={handleChange} disabled={!formData.competency_id || loadingLOs} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400">
                                <option value="">{loadingLOs ? 'Loading...' : learningOutcomes.length === 0 ? 'No learning outcomes available' : 'Select Learning Outcome'}</option>
                                {learningOutcomes.map((lo: any) => <option key={lo.id} value={lo.id}>{lo.description?.length > 80 ? lo.description.substring(0, 80) + '...' : lo.description || lo.code}</option>)}
                              </select>
                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Configuration */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

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
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                              {[0, 1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button" onClick={() => setFormData(prev => ({ ...prev, visual_question_count: n }))} className={\\\lex-1 py-3 text-sm font-bold transition-all \\\\\\}>
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Review */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Review Configuration</h3>
                          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Grade & Term</p>
                              <p className="font-bold text-gray-900">Grade {formData.grade_level} (Term {formData.term})</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Subject</p>
                              <p className="font-bold text-gray-900">{subjects.find(s => s.id == formData.subject_id)?.name || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Bloom Level</p>
                              <p className="font-bold text-gray-900 capitalize">{formData.bloom_level}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Difficulty</p>
                              <p className="font-bold text-gray-900 capitalize">{formData.difficulty}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Additional Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                          <textarea name="additional_instructions" value={formData.additional_instructions} onChange={handleChange} rows={3} placeholder="Add any specific context, scenario, keywords, or constraints for the AI..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none" />
                        </div>
                        <input type="hidden" name="llm_provider" value={formData.llm_provider} />
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                        Back
                      </button>
                    ) : (
                      <button type="button" onClick={() => {
                        setFormData({ grade_level: '3', subject_id: '', competency_id: '', learning_outcome_id: '', bloom_level: 'understanding', difficulty: 'medium', term: '2', count: 5, visual_question_count: 2, llm_provider: 'nvidia', additional_instructions: '' });
                        setCompetencies([]);
                        setLearningOutcomes([]);
                        setCurrentStep(1);
                      }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Reset
                      </button>
                    )}

                    {currentStep < 3 ? (
                      <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        Next Step
                      </button>
                    ) : (
                      <button type="submit" disabled={loading || !canSubmit} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                        {loading ? 'Generating...' : 'Generate Questions'}
                      </button>
                    )}
                  </div>
                </div>
\

const oldFormStartIndex = code.indexOf('<div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100');
const oldFormEndIndex = code.indexOf('              {/* ??? Right: Sidebar ??? */}');

if (oldFormStartIndex !== -1 && oldFormEndIndex !== -1) {
  code = code.substring(0, oldFormStartIndex) + newFormJSX + code.substring(oldFormEndIndex);
  fs.writeFileSync('c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/sme/questions/generate/page.tsx', code);
  console.log('Successfully replaced form UI with 3-step wizard!');
} else {
  console.log('Failed to find exact boundaries of the form UI.');
}
