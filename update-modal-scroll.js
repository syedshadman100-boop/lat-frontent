const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The outer modal container needs flex flex-col and overflow-hidden instead of overflow-y-auto
const oldOuter = '<div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">';
const newOuter = '<div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-300">';
content = content.replace(oldOuter, newOuter);

// We need to wrap the upper content in a scrollable div and separate the action buttons.
// Let's replace the single <div className="p-10 flex flex-col items-center text-center"> 
// with the scrollable wrapper, and then extract the action buttons.

const contentStart = '<div className="p-10 flex flex-col items-center text-center">';
const newContentStart = '<div className="p-10 flex-1 overflow-y-auto flex flex-col items-center text-center">';
content = content.replace(contentStart, newContentStart);

// Now for the buttons: they are at the end of the p-10 div.
const actionButtonsTarget = `              {/* Action Buttons */}
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

            </div>`;

const newActionButtons = `            </div>

            {/* Action Buttons (Fixed Footer) */}
            <div className="p-6 px-10 border-t border-[#e2e8f0] bg-white shrink-0">
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
            </div>`;

content = content.replace(actionButtonsTarget, newActionButtons);

// Make sure the close button is absolute but has a higher z-index so it stays above the scrolling content
const closeBtnOld = `            <button 
              onClick={() => router.push('/super-admin/lat-exams')}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
            >`;
const closeBtnNew = `            <button 
              onClick={() => router.push('/super-admin/lat-exams')}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors z-10 bg-white rounded-full p-1"
            >`;
content = content.replace(closeBtnOld, closeBtnNew);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated modal layout');
