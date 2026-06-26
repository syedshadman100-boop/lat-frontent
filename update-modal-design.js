const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/create/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Exam ID box
const examIdBox = `              {/* Exam ID Box */}
              <div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-6 py-3 flex items-center gap-3 mb-8">
                <span className="text-[12px] font-bold text-[#94a3b8]">LAT Exam ID</span>
                <span className="text-[16px] font-black text-gray-900">LAT-I-G5-2026-0001</span>
                <button className="text-[#2563eb] hover:text-blue-700 ml-2">
                  <Copy size={16} />
                </button>
              </div>`;
content = content.replace(examIdBox, '');

// 2. Fix inner div rounded corners
// The inner scrollable div is:
// <div className="p-10 flex-1 overflow-y-auto flex flex-col items-center text-center">
// We need to add rounded-t-[24px] to it so it matches the outer container and doesn't overlap the rounded corners
const oldInner = '<div className="p-10 flex-1 overflow-y-auto flex flex-col items-center text-center">';
const newInner = '<div className="p-10 flex-1 overflow-y-auto flex flex-col items-center text-center rounded-t-[24px]">';
content = content.replace(oldInner, newInner);

// Let's also ensure the footer has rounded-b-[24px] just in case
const oldFooter = '<div className="p-6 px-10 border-t border-[#e2e8f0] bg-white shrink-0">';
const newFooter = '<div className="p-6 px-10 border-t border-[#e2e8f0] bg-white shrink-0 rounded-b-[24px]">';
content = content.replace(oldFooter, newFooter);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated modal design');
