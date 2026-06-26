const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
const importTarget = "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2, X, Check } from 'lucide-react';";
const newImports = "import { ArrowLeft, Info, HelpCircle, CheckCircle2, ChevronDown, Calendar, Clock, BookOpen, Layers, Copy, Eye, Download as DownloadIcon, Users, FileText, Shield, Grid as GridIcon, Loader2, X, Check, RefreshCw, CheckCircle } from 'lucide-react';";
content = content.replace(importTarget, newImports);

// 2. Add State and Mock Data
const stateTarget = "const [isSubmitting, setIsSubmitting] = useState(false);";
const newState = `const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [replacingQuestionId, setReplacingQuestionId] = useState<number | null>(null);

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
  };`;
content = content.replace(stateTarget, newState);

// 3. Update Subject Grid Headers
const thTarget = `<th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-right w-[200px]">Total Questions (MCQ)</th>
                      </tr>`;
const newTh = `<th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-center w-[200px]">Total Questions (MCQ)</th>
                        <th className="py-4 px-5 text-[12px] font-bold text-[#64748b] bg-white text-right w-[150px]">Action</th>
                      </tr>`;
content = content.replace(thTarget, newTh);

// 4. Update Subject Grid Rows
const rowEnglish = `<td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">15</td>
                      </tr>`;
const newRowEnglish = `<td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">15</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('English')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>`;
content = content.replace(rowEnglish, newRowEnglish);

const rowHindi = `<td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">15</td>
                      </tr>`;
const newRowHindi = `<td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">15</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('Hindi')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>`;
content = content.replace(rowHindi, newRowHindi);

const rowMath = `<td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">20</td>
                      </tr>`;
const newRowMath = `<td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">20</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('Mathematics')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>`;
content = content.replace(rowMath, newRowMath);

const rowEvs = `<td className="py-4 px-5 text-right text-[13px] font-semibold text-gray-900 pr-12">10</td>
                      </tr>`;
const newRowEvs = `<td className="py-4 px-5 text-center text-[13px] font-semibold text-gray-900">10</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setPreviewSubject('EVS')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] hover:bg-[#dbeafe] rounded-lg text-[12px] font-bold transition-colors">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>`;
content = content.replace(rowEvs, newRowEvs);

const rowTotal = `<td className="py-4 px-5 text-right text-[14px] font-black text-[#2563eb] pr-12">60</td>
                      </tr>`;
const newRowTotal = `<td className="py-4 px-5 text-center text-[14px] font-black text-[#2563eb]">60</td>
                        <td></td>
                      </tr>`;
content = content.replace(rowTotal, newRowTotal);


// 5. Add the Drawer Modal UI
const drawerUI = `
      {/* Question Preview & Replace Drawer */}
      {previewSubject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="w-[800px] h-full bg-[#f8fafc] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
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
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
                        <div key={oIdx} className={\`p-3 rounded-xl border \${oIdx === q.correct ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'border-[#f1f5f9] bg-[#f8fafc]'}\`}>
                          <div className="flex items-center gap-3">
                            <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 \${oIdx === q.correct ? 'bg-[#16a34a] text-white' : 'bg-white border border-[#cbd5e1] text-[#64748b]'}\`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className={\`text-[13px] font-medium \${oIdx === q.correct ? 'text-[#166534]' : 'text-[#475569]'}\`}>{opt}</span>
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
                        <div key={oIdx} className={\`p-3 rounded-xl border \${oIdx === alt.correct ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'border-[#f1f5f9] bg-[#f8fafc]'}\`}>
                          <div className="flex items-center gap-3">
                            <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 \${oIdx === alt.correct ? 'bg-[#16a34a] text-white' : 'bg-white border border-[#cbd5e1] text-[#64748b]'}\`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className={\`text-[13px] font-medium \${oIdx === alt.correct ? 'text-[#166534]' : 'text-[#475569]'}\`}>{opt}</span>
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
      )}
`;

content = content.replace('    </div>\n  );\n}', drawerUI + '\n    </div>\n  );\n}');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added Question Preview and Replace feature');
