const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add new imports
const importTarget = "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers } from 'lucide-react';";
const newImports = "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2 } from 'lucide-react';";
content = content.replace(importTarget, newImports);

// Add isSubmitting state and handleConfirm
const stateTarget = "const [step, setStep] = useState(1);";
const newStates = `const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 1500);
  };`;
content = content.replace(stateTarget, newStates);

// Update step 3 circle
const step3Target = `{/* Step 3 */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full border border-[#cbd5e1] text-[#64748b] flex items-center justify-center text-[13px] font-bold bg-white">
                3
              </div>`;
const step3New = `{/* Step 3 */}
            <div className={\`flex items-center gap-3 \${step === 3 ? '' : 'opacity-50'}\`}>
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm \${step === 3 ? 'bg-[#2563eb] text-white shadow-blue-200' : 'border border-[#cbd5e1] text-[#64748b] bg-white'}\`}>
                3
              </div>`;
content = content.replace(step3Target, step3New);

// Add modal UI at the end before closing tags
const modalUI = `
      {/* Success Modal */}
      {step === 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] overflow-hidden relative animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => router.push('/super-admin/lat-exams')}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="p-10 flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">LAT Exam Created Successfully!</h2>
              <p className="text-[#64748b] text-[14px] font-medium max-w-md mx-auto mb-8">
                Your LAT exam has been created and is ready. You can now preview or download the question paper.
              </p>

              {/* Exam ID Box */}
              <div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-6 py-3 flex items-center gap-3 mb-8">
                <span className="text-[12px] font-bold text-[#94a3b8]">LAT Exam ID</span>
                <span className="text-[16px] font-black text-gray-900">LAT-I-G5-2026-0001</span>
                <button className="text-[#2563eb] hover:text-blue-700 ml-2">
                  <Copy size={16} />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full text-left mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Exam Name</p>
                    <p className="text-[13px] font-bold text-gray-900">Grade 5 LAT-I (2026)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Exam Date</p>
                    <p className="text-[13px] font-bold text-gray-900">10 Jul 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Current Grade</p>
                    <p className="text-[13px] font-bold text-gray-900">Grade 5</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fffbeb] text-[#d97706] flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Duration</p>
                    <p className="text-[13px] font-bold text-gray-900">90 Minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center shrink-0">
                    <Shield size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Assessment Group</p>
                    <p className="text-[13px] font-bold text-gray-900">Preparatory (Grades 3-5)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
                    <GridIcon size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Total Questions</p>
                    <p className="text-[13px] font-bold text-gray-900">60</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Assessment Basis</p>
                    <p className="text-[13px] font-bold text-gray-900">Previous Academic Year (Grade 4)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
                    <Layers size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Subjects</p>
                    <p className="text-[13px] font-bold text-gray-900">4 (English, Hindi, Math, EVS)</p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
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
`;

content = content.replace('    </div>\n  );\n}', modalUI + '\n    </div>\n  );\n}');

// Note: I also need to make sure I import `X` which I didn't add to the newImports block above. I will add it now.
content = content.replace(
  "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2 } from 'lucide-react';",
  "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2, X } from 'lucide-react';"
);


// Update Confirm Exam button to trigger handleConfirm
const confirmBtnTarget = `<button 
              className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next: Confirm Exam</span>`;
const newConfirmBtn = `<button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span className="hidden sm:inline">{isSubmitting ? 'Creating Exam...' : 'Next: Confirm Exam'}</span>`;
content = content.replace(confirmBtnTarget, newConfirmBtn);


fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated create/page.tsx with Step 3 Modal');
