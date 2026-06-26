const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const [latType, setLatType] = useState('LAT-I');",
  "const [latType, setLatType] = useState('LAT-I');\n  const [step, setStep] = useState(1);"
);

const stepperStart = content.indexOf('{/* Stepper Card */}');
const stepperEnd = content.indexOf('{/* Form and Sidebar Grid */}');
const newStepper = `{/* Stepper Card */}
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
                <p className={\`text-[13px] font-bold \${step === 1 ? 'text-[#2563eb]' : 'text-gray-900'}\`}>Basic Details</p>
                <p className="text-[11px] font-medium text-[#64748b]">Set exam details</p>
              </div>
            </div>
            
            <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>

            {/* Step 2 */}
            <div className={\`flex items-center gap-3 \${step === 1 ? 'opacity-50' : ''}\`}>
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
                <p className={\`text-[13px] font-bold \${step === 2 ? 'text-[#2563eb]' : 'text-gray-900'}\`}>Question Distribution</p>
                <p className="text-[11px] font-medium text-[#64748b]">View subject & question split</p>
              </div>
            </div>

            <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full border border-[#cbd5e1] text-[#64748b] flex items-center justify-center text-[13px] font-bold bg-white">
                3
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Exam Created</p>
                <p className="text-[11px] font-medium text-[#64748b]">LAT exam will be created</p>
              </div>
            </div>
          </div>
        </div>\n\n        `;
content = content.substring(0, stepperStart) + newStepper + content.substring(stepperEnd);

// Wrap step 1
content = content.replace(
  '{/* Form and Sidebar Grid */}\n        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">',
  '{/* Form and Sidebar Grid */}\n        {step === 1 && (\n          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">'
);

// End wrap step 1 and add step 2 before footer
const step2UI = `          </div>
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
                        <th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-right w-[200px]">Total Questions (MCQ)</th>
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
                        <td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">15</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#fdf2f8] text-[#db2777] flex items-center justify-center text-[14px] font-bold">अ</div>
                            <span className="text-[13px] font-semibold text-gray-900">Hindi</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">15</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] text-[#475569] flex items-center justify-center text-[14px] font-bold font-serif">π</div>
                            <span className="text-[13px] font-semibold text-gray-900">Mathematics</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">20</td>
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
                        <td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">10</td>
                      </tr>
                      <tr className="bg-[#eff4ff]">
                        <td className="py-4 px-5 text-[13px] font-bold text-[#2563eb]">Total</td>
                        <td className="py-4 px-5 text-right text-[13px] font-bold text-[#2563eb] pr-12">60</td>
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
        )}\n`;

content = content.replace(
  '        </div>\n\n      </div>\n      </div>',
  step2UI + '      </div>'
);

content = content.replace(
  'onClick={() => router.back()}',
  'onClick={() => step === 2 ? setStep(1) : router.back()}'
);

const btnTarget = `<button className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2">
            <span className="hidden sm:inline">Next: Question Distribution</span>
            <span className="sm:hidden">Next</span>
            <span className="text-lg leading-none">→</span>
          </button>`;

const newBtn = `{step === 1 ? (
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
              className="px-4 md:px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next: Confirm Exam</span>
              <span className="sm:hidden">Next</span>
              <span className="text-lg leading-none">→</span>
            </button>
          )}`;

content = content.replace(btnTarget, newBtn);

fs.writeFileSync(file, content, 'utf8');
