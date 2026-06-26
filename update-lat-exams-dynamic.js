const fs = require('fs');
const file = 'c:/Users/user 30/Desktop/LAT/lat-frontend/src/app/super-admin/lat-exams/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = "import React from 'react';";
const newImports = "import React, { useState, useEffect } from 'react';";
content = content.replace(importTarget, newImports);

const mockExamsRegex = /const mockExams = \[\s*\{[\s\S]*?\];/m;

const newExamsLogic = `
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/papers', {
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match frontend UI expectations
          const formatted = data.map((paper: any) => {
            const dateObj = new Date(paper.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            // Extract info from title if possible (e.g. "Grade 5 LAT-I (2026)")
            const isLatI = paper.title?.includes('LAT-I');
            const isLatII = paper.title?.includes('LAT-II');
            let latType = isLatII ? 'LAT-II' : 'LAT-I';
            if (!isLatI && !isLatII) latType = 'LAT'; // fallback
            
            let grade = \`Grade \${paper.grade_level}\`;
            let assessmentGroup = paper.grade_level <= 5 ? 'Preparatory' : 'Middle';
            let groupGrades = paper.grade_level <= 5 ? '(Grades 3-5)' : '(Grades 6-8)';

            return {
              id: paper.id,
              name: paper.title,
              code: \`LAT-\${paper.id.toString().padStart(4, '0')}\`,
              latType: latType,
              grade: grade,
              assessmentGroup: assessmentGroup,
              assessmentGroupGrades: groupGrades,
              date: formattedDate,
              duration: \`\${paper.duration_minutes} Min\`,
              totalQuestions: paper.total_marks || 60,
              status: paper.is_locked ? 'Completed' : 'Upcoming' // Mock status logic
            };
          });
          setExams(formatted);
        } else {
          console.error('Failed to fetch exams');
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);
`;

content = content.replace(mockExamsRegex, newExamsLogic);

// Update mapping from mockExams.map to exams.map
content = content.replace(/mockExams\.map/g, 'exams.map');

// In the tbody, if loading is true, show a loader
const tbodyStart = `<tbody className="divide-y divide-[#e2e8f0]">`;
const newTbody = `<tbody className="divide-y divide-[#e2e8f0]">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#64748b]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb] mb-4" />
                        <p className="text-[14px] font-bold">Loading LAT Exams...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && exams.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#64748b]">
                        <FileText className="w-12 h-12 text-[#cbd5e1] mb-4" />
                        <p className="text-[16px] font-bold text-gray-900">No Exams Found</p>
                        <p className="text-[14px] font-medium mt-1">Create a new LAT Exam to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && exams.map((exam, idx) => (`;
content = content.replace(`{mockExams.map((exam, idx) => (`, ''); 
content = content.replace(`{exams.map((exam, idx) => (`, ''); // in case we already replaced it

// Let's replace the whole tbody opening correctly to inject loading state:
const oldTbodyWithMap = `<tbody className="divide-y divide-[#e2e8f0]">\n                  {exams.map((exam, idx) => (`
content = content.replace(oldTbodyWithMap, newTbody);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated page.tsx to fetch dynamic data');
