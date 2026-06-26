const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Scroll area padding
const oldScroll = '<div className="p-10 flex-1 overflow-y-auto flex flex-col items-center text-center rounded-t-[24px]">';
const newScroll = '<div className="p-6 px-8 flex-1 flex flex-col items-center text-center rounded-t-[24px] overflow-hidden">';
// Wait, user says "dont want scroll in web view". So we shouldn't have overflow-y-auto unless necessary. I'll just change padding.
content = content.replace(oldScroll, newScroll);

// 2. Update Icon
const oldIcon = `<div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center shadow-lg z-20">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>`;
const newIcon = `<div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center shadow-lg z-20">
                <Check size={32} className="text-white" strokeWidth={3} />
              </div>`;
content = content.replace(oldIcon, newIcon);

// 3. Update Heading & Paragraph
const oldText = `<h2 className="text-2xl font-black text-gray-900 mb-2 mt-4">LAT Exam Created Successfully!</h2>
              <p className="text-[#64748b] text-[14px] font-medium max-w-md mx-auto mb-8">
                Your LAT exam has been created and is ready. You can now preview or download the question paper.
              </p>`;
const newText = `<h2 className="text-[20px] font-black text-gray-900 mb-1 mt-4">LAT Exam Created Successfully!</h2>
              <p className="text-[#64748b] text-[13px] font-medium max-w-md mx-auto mb-5">
                Your LAT exam has been created and is ready. You can now preview or download the question paper.
              </p>`;
content = content.replace(oldText, newText);

// 4. Update ID Box
const oldIdBox = `<div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-6 py-3 flex items-center justify-center gap-3 mb-8 w-fit mx-auto">
                <span className="text-[12px] font-bold text-[#94a3b8]">LAT Exam ID</span>
                <span className="text-[16px] font-black text-gray-900">LAT-I-G5-2026-0001</span>`;
const newIdBox = `<div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-lg px-4 py-2 flex items-center justify-center gap-3 mb-6 w-fit mx-auto">
                <span className="text-[11px] font-bold text-[#94a3b8]">LAT Exam ID</span>
                <span className="text-[14px] font-black text-gray-900">LAT-I-G5-2026-0001</span>`;
content = content.replace(oldIdBox, newIdBox);

// 5. Update Grid
const oldGrid = '<div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full text-left mb-10">';
const newGrid = '<div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-left mb-4">';
content = content.replace(oldGrid, newGrid);

// Change text size inside grid
// text-[13px] -> text-[12px]
// w-8 h-8 -> w-7 h-7
// We will replace all w-8 h-8 rounded-full in the grid
let gridBlockStart = content.indexOf(newGrid);
if (gridBlockStart !== -1) {
  let gridBlockEnd = content.indexOf('</div>\n\n            {/* Action Buttons (Fixed Footer) */}');
  let gridContent = content.substring(gridBlockStart, gridBlockEnd);
  
  gridContent = gridContent.replace(/w-8 h-8/g, 'w-7 h-7');
  gridContent = gridContent.replace(/text-\[13px\]/g, 'text-[12px]');
  gridContent = gridContent.replace(/size=\{14\}/g, 'size={12}');
  gridContent = gridContent.replace(/mb-0\.5/g, 'mb-0');
  
  content = content.substring(0, gridBlockStart) + gridContent + content.substring(gridBlockEnd);
}

// 6. Update Footer
const oldFooter = '<div className="p-6 px-10 border-t border-[#e2e8f0] bg-white shrink-0 rounded-b-[24px]">';
const newFooter = '<div className="p-4 px-8 border-t border-[#e2e8f0] bg-white shrink-0 rounded-b-[24px]">';
content = content.replace(oldFooter, newFooter);

// 7. Update outer modal max-w
// Since it's more compact, max-w-[550px] might look better and help items fit closer
const oldOuter = '<div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-300">';
const newOuter = '<div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[550px] flex flex-col relative animate-in fade-in zoom-in duration-300">';
// Notice I removed max-h-[90vh] because we want it to just size to its content normally without scrolling.
content = content.replace(oldOuter, newOuter);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully compacted modal design');
