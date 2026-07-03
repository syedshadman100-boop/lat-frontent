import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '@/lib/api-client';

// Helper to load image for PDF
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export interface ReportData {
  dateOfTest: string;
}

export const generateStudentReport = async (data: ReportData) => {
  let apiData: any = null;

try {
  const res = await apiClient.get('/analytics/region-wise-report');
  apiData = res?.data;
} catch (err: any) {
  console.error("API Error:", err);

  const status = err.response?.status;
  const errorData = err.response?.data;

  alert(
    JSON.stringify(
      {
        status,
        error: errorData,
      },
      null,
      2
    )
  );

  return;
}

if (!apiData) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  
  const brandBlue = [43, 91, 132]; // #2b5b84
  const headerGray = [79, 98, 114]; // #4f6272
  const textDark = [30, 30, 30]; 
  const textBody = [50, 50, 50];
  
  let currentY = margin;
  let pageNumber = 1;

  // Cover Page Header Background Design
  doc.setFillColor(244, 245, 247); // Light grayish/white tone
  // Draw a block on the left side from top to where the blue banner starts
  doc.rect(0, 0, 80, pageHeight / 3 - 3, 'F');

  // Try to add the logos on the first page, top left and top right
  const targetHeight = 35; // Maximum height for the logos
  let maxLogoBottomY = targetHeight;
  
  try {
    const logoImg = await loadImage('/logo-left.png');
    const ratio = logoImg.width / logoImg.height;
    const calcWidth = targetHeight * ratio;
    // Draw the left logo at y=5
    doc.addImage(logoImg, 'PNG', margin, 5, calcWidth, targetHeight);
    maxLogoBottomY = 5 + targetHeight;
  } catch (err) {
    console.warn("Left logo image '/logo-left.png' not found or failed to load.");
  }

  try {
    const rightLogoImg = await loadImage('/right-logo.png');
    const ratio = rightLogoImg.width / rightLogoImg.height;
    const rightTargetHeight = 25; // Scaled down smaller than the left logo (35)
    const calcWidth = rightTargetHeight * ratio;
    // Draw the right logo aligned to the right edge. Shift down slightly to center it vertically relative to the left logo.
    const yOffset = 5 + (targetHeight - rightTargetHeight) / 2; // (35-25)/2 = 5mm shift
    doc.addImage(rightLogoImg, 'PNG', pageWidth - margin - calcWidth, yOffset, calcWidth, rightTargetHeight);
    maxLogoBottomY = Math.max(maxLogoBottomY, yOffset + rightTargetHeight);
  } catch (err) {
    console.warn("Right logo image '/right-logo.png' not found or failed to load.");
  }
  
  currentY = maxLogoBottomY + 10; // Push content down below the logos

  const addHeaderFooter = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pageNumber++;
  };

  const addText = (text: string, x: number, y: number, options: any = {}) => { doc.text(text, x, y, options); };
  
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      addHeaderFooter();
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // -----------------------------------------------------
  // COVER PAGE (PAGE 1)
  // -----------------------------------------------------
  doc.setFillColor(239, 133, 54); // Orange accent
  doc.rect(0, pageHeight / 3 - 3, pageWidth, 3, 'F');
  doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.rect(0, pageHeight / 3, pageWidth, pageHeight / 3.5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  addText("LEARNERS' ACHIEVEMENT", margin, pageHeight / 3 + 25);
  addText("TEST (LAT) 2025–26", margin, pageHeight / 3 + 40);
  addText("REPORT FOR KVS", margin, pageHeight / 3 + 55);
  
  doc.setFontSize(12);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText("SUBMITTED TO", margin, pageHeight / 3 + pageHeight / 3.5 + 20);
  doc.setFontSize(22);
  addText("KENDRIYA VIDYALAYA SANGATHAN", margin, pageHeight / 3 + pageHeight / 3.5 + 30);
  
  // Right-aligned "SUBMITTED BY" section
  doc.setFontSize(12);
  doc.text("SUBMITTED BY", pageWidth - margin, pageHeight / 3 + pageHeight / 3.5 + 65, { align: 'right' });
  doc.setFontSize(22);
  doc.text("SRI AUROBINDO SOCIETY", pageWidth - margin, pageHeight / 3 + pageHeight / 3.5 + 75, { align: 'right' });
  
  addHeaderFooter();

  // -----------------------------------------------------
  // EXECUTIVE SUMMARY & INTRODUCTION
  // -----------------------------------------------------
  doc.addPage();
  currentY = margin;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText('Executive Summary & Test Objectives', margin, currentY);
  
  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(textBody[0], textBody[1], textBody[2]);
  
  const execText = `LAT stands for Learners' Achievement Test. It is a diagnostic test designed to ascertain if students have achieved their learning goals and if they need further remediation. The test is structured around subject-specific competencies and grade-aligned learning outcomes.\n\nThe test was conducted on ${data.dateOfTest} across ${apiData.summary?.regionparticipated || apiData.summary?.regionsParticipated || 25} KVS regions.`;
  const execLines = doc.splitTextToSize(execText, contentWidth);
  doc.text(execLines, margin, currentY);
  currentY += execLines.length * 5 + 10;

  // Add Objectives of LAT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText('Objectives of LAT', margin, currentY);
  currentY += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(textBody[0], textBody[1], textBody[2]);
  
  const obj1 = "1. Evaluate Students' Academic Performance: To measure the academic performance of students in various subjects in order to determine whether they have achieved the learning goals or not";
  const obj2 = "2. Identify Learning Gaps: To identify areas where students are struggling or have gaps in their understanding";
  const obj3 = "3. Improve Learning Outcomes: To use assessment results to improve student learning outcomes and academic performance";

  const obj1Lines = doc.splitTextToSize(obj1, contentWidth - 10);
  doc.text(obj1Lines, margin + 5, currentY);
  currentY += obj1Lines.length * 5 + 4;
  
  const obj2Lines = doc.splitTextToSize(obj2, contentWidth - 10);
  doc.text(obj2Lines, margin + 5, currentY);
  currentY += obj2Lines.length * 5 + 4;
  
  const obj3Lines = doc.splitTextToSize(obj3, contentWidth - 10);
  doc.text(obj3Lines, margin + 5, currentY);
  currentY += obj3Lines.length * 5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText('Participation Summary', margin, currentY);
  currentY += 4;

  const stGrades = apiData.summary?.studentsParticipated || {};
  
  const gradeKeys = Object.keys(stGrades)
    .filter(k => k.startsWith('grade'))
    .map(k => parseInt(k.replace('grade', ''), 10))
    .sort((a, b) => a - b);

  if (gradeKeys.length === 0) {
    // Fallback if no grades are present in data
    gradeKeys.push(3, 6, 9);
  }

  const gradeHeaders = gradeKeys.map(g => `Grade ${g}`);
  const gradeValues = gradeKeys.map(g => (stGrades[`grade${g}`] || 0).toLocaleString());

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, halign: 'center', valign: 'middle', lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: headerGray as any, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: [255, 255, 255], lineWidth: 0.2 },
    bodyStyles: { textColor: textDark as any },
    head: [
      [
        { content: 'Regions Participated', rowSpan: 2 },
        { content: 'Schools Participated', rowSpan: 2 },
        { content: 'Students Participated', colSpan: gradeHeaders.length }
      ],
      gradeHeaders
    ],
    body: [
      [
        (apiData.summary?.regionparticipated || apiData.summary?.regionsParticipated || 0).toString(),
        (apiData.summary?.schoolparticipated || apiData.summary?.schoolsParticipated || 0).toLocaleString(),
        ...gradeValues
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const partDesc = "This table summarizes the total footprint of the assessment, showing the number of participating regions, schools, and students evaluated across the targeted grades.";
  doc.text(doc.splitTextToSize(partDesc, contentWidth), margin, currentY);
  currentY += 12;
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  // Increase box height to 40 to fit all content cleanly
  doc.roundedRect(margin, currentY, contentWidth, 40, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText("Key Insight (National Average):", margin + 5, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textBody[0], textBody[1], textBody[2]);
  
  const natAvg = apiData.overallPerformance?.nationalAverage || 0;
  
  // Sleek Progress Bar for National Average
  // Moved down slightly to create a gap between the title and the bar
  const avgBarY = currentY + 12;
  const avgBarH = 10;
  // Reduced width so the right-side text fits inside the box boundaries
  const avgBarW = contentWidth - 65;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin + 5, avgBarY, avgBarW, avgBarH, 2, 2, 'F');
  doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.roundedRect(margin + 5, avgBarY, (natAvg / 100) * avgBarW, avgBarH, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${natAvg.toFixed(1)}%`, margin + 10, avgBarY + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text("National Average Score", margin + 5 + avgBarW + 5, avgBarY + 7);
  
  // Position the insight text nicely below the progress bar
  currentY += 32;
  
  const insightText = `Regions performing above this threshold demonstrate strong foundational systems, while those below may require targeted academic interventions.`;
  const insightLines = doc.splitTextToSize(insightText, contentWidth - 10);
  doc.text(insightLines, margin + 5, currentY);

  addHeaderFooter();

  // -----------------------------------------------------
  // OVERALL PERFORMANCE (TOP AND BOTTOM CHARTS)
  // -----------------------------------------------------
  doc.addPage();
  currentY = margin;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText('Part A: Top and Bottom Regions Analysis', margin, currentY);
  currentY += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(textBody[0], textBody[1], textBody[2]);
  const tbText = "The following charts identify the highest-performing and lowest-performing regions based on the overall average scores from the LAT assessment.";
  const tbLines = doc.splitTextToSize(tbText, contentWidth);
  doc.text(tbLines, margin, currentY);
  currentY += tbLines.length * 5 + 6;

  const topRegions = apiData.overallPerformance?.topRegions || [];
  const bottomRegions = apiData.overallPerformance?.bottomRegions || [];
  
  const drawHorizontalBarChart = (yPos: number, title: string, dataPoints: Array<any>, color: number[]) => {
    if (!dataPoints || dataPoints.length === 0) return yPos;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(color[0], color[1], color[2]);
    addText(title, margin, yPos + 10);
    
    let chartY = yPos + 20;
    const maxScore = 100;
    const barHeight = 8;
    const labelWidth = 40;
    const maxBarWidth = contentWidth - labelWidth - 25;
    
    dataPoints.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(item.name || item.region, margin, chartY + 6);
      
      const barW = (item.score / maxScore) * maxBarWidth;
      
      // background track
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin + labelWidth, chartY, maxBarWidth, barHeight, 1, 1, 'F');
      
      // fill bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin + labelWidth, chartY, Math.max(barW, 2), barHeight, 1, 1, 'F');
      
      // score text
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.score.toFixed(1)}%`, margin + labelWidth + barW + 3, chartY + 6);
      
      chartY += 16;
    });
    
    return chartY + 10;
  };

  currentY = drawHorizontalBarChart(currentY, 'Top Performing Regions', topRegions, [16, 185, 129]); // Emerald Green
  currentY = drawHorizontalBarChart(currentY, 'Regions Needing Support', bottomRegions, [245, 158, 11]); // Amber/Orange
  
  currentY += 10;
  checkPageBreak(50); // Ensure enough space for the title and the table
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  addText('Tabular Data: Regional Extremes', margin, currentY);
  currentY += 5;

  const formatCell = (item: any) => item ? `${item.name || item.region}\n(${item.score.toFixed(1)}%)` : '-';

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, halign: 'center', valign: 'middle', lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: brandBlue as any, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: [255, 255, 255], lineWidth: 0.2 },
    head: [[{ content: 'Performance Extremes (Tabular)', colSpan: Math.max(topRegions.length, 5) + 1 }]],
    body: [
      [
        { content: 'Top Regions\n(Highest Scores)', styles: { fillColor: headerGray as any, textColor: [255, 255, 255], fontStyle: 'bold' } },
        ...topRegions.map(formatCell)
      ],
      [
        { content: 'Bottom Regions\n(Lowest Scores)', styles: { fillColor: headerGray as any, textColor: [255, 255, 255], fontStyle: 'bold' } },
        ...bottomRegions.map(formatCell)
      ]
    ]
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const tableDesc = "The table above highlights the absolute highest and lowest performing regions across all assessed subjects, providing a clear view of performance extremes.";
  doc.text(doc.splitTextToSize(tableDesc, contentWidth), margin, currentY);

  addHeaderFooter();

  // Helper for dynamic bar charts
  const drawDynamicBarChart = (yPos: number, title: string, dataPoints: Array<{label: string, score: number}>) => {
    const chartHeight = 90;
    const chartWidth = contentWidth;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250); 
    doc.rect(margin, yPos, chartWidth, chartHeight, 'FD');
    
    // Grid
    doc.setDrawColor(230, 230, 230);
    for(let i=1; i<=4; i++) {
      const lineY = yPos + (chartHeight - 25) - (i * ((chartHeight - 45)/4));
      doc.line(margin, lineY, margin + chartWidth, lineY);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    addText(title, pageWidth / 2, yPos + 10, { align: 'center' });
    
    const maxScore = 100; // Fixed to 100% scale for consistency
    const barMargin = 10;
    const totalBarSpace = chartWidth - 20;
    const barWidth = (totalBarSpace / Math.max(dataPoints.length, 1)) - barMargin;
    const chartBottomY = yPos + chartHeight - 25;
    
    dataPoints.forEach((item, i) => {
      const x = margin + 10 + i * (barWidth + barMargin) + (barMargin/2);
      const barH = (item.score / maxScore) * (chartHeight - 45);
      const y = chartBottomY - barH;
      
      doc.setFillColor(96, 165, 250); // Blue
      doc.rect(x, y, barWidth, barH, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(item.score.toFixed(1), x + barWidth/2, y - 2, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      // Split label if too long
      const labelLines = doc.splitTextToSize(item.label, barWidth + 10);
      doc.text(labelLines, x + barWidth/2, chartBottomY + 5, { align: 'center' });
    });
    
    return yPos + chartHeight + 15;
  };

  const drawAreaLineChart = (yPos: number, title: string, dataPoints: Array<{label: string, score: number}>) => {
    const chartHeight = 90;
    const chartWidth = contentWidth;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250); 
    doc.rect(margin, yPos, chartWidth, chartHeight, 'FD');
    
    // Grid
    doc.setDrawColor(235, 235, 235);
    for(let i=1; i<=4; i++) {
      const lineY = yPos + (chartHeight - 25) - (i * ((chartHeight - 45)/4));
      doc.line(margin, lineY, margin + chartWidth, lineY);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    addText(title, pageWidth / 2, yPos + 10, { align: 'center' });
    
    const maxScore = 100; 
    const barMargin = 10;
    const totalBarSpace = chartWidth - 20;
    const barWidth = (totalBarSpace / Math.max(dataPoints.length, 1)) - barMargin;
    const chartBottomY = yPos + chartHeight - 25;
    
    const points: {x: number, y: number}[] = [];
    
    // First calculate all points
    dataPoints.forEach((item, i) => {
      const x = margin + 10 + i * (barWidth + barMargin) + (barMargin/2) + barWidth/2;
      const barH = (item.score / maxScore) * (chartHeight - 45);
      const y = chartBottomY - barH;
      points.push({ x, y });
    });
    
    // Draw connecting lines
    if (points.length > 1) {
      doc.setDrawColor(139, 92, 246); // Purple color
      doc.setLineWidth(2.5);
      for (let i = 0; i < points.length - 1; i++) {
        doc.line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      }
    }
    
    // Draw dots and text
    dataPoints.forEach((item, i) => {
      const p = points[i];
      
      // Draw Circle (Dot)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(139, 92, 246); // Purple color
      doc.setLineWidth(1.5);
      doc.circle(p.x, p.y, 4, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(item.score.toFixed(1), p.x, p.y - 7, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      const labelLines = doc.splitTextToSize(item.label, barWidth + 10);
      doc.text(labelLines, p.x, chartBottomY + 5, { align: 'center' });
    });
    
    return yPos + chartHeight + 15;
  };

  const drawHorizontalSubjectChart = (yPos: number, title: string, dataPoints: Array<{label: string, score: number}>) => {
    const chartHeight = Math.max(60, dataPoints.length * 20 + 30);
    const chartWidth = contentWidth;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250); 
    doc.rect(margin, yPos, chartWidth, chartHeight, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    addText(title, pageWidth / 2, yPos + 10, { align: 'center' });
    
    const maxScore = 100;
    const labelWidth = 35;
    const maxBarWidth = chartWidth - labelWidth - 30;
    
    dataPoints.forEach((item, i) => {
      const itemY = yPos + 25 + (i * 20);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      const labelLines = doc.splitTextToSize(item.label, labelWidth - 5);
      doc.text(labelLines, margin + 5, itemY + 4);
      
      const barW = (item.score / maxScore) * maxBarWidth;
      
      // Background track
      doc.setFillColor(235, 235, 235);
      doc.roundedRect(margin + labelWidth, itemY, maxBarWidth, 6, 1, 1, 'F');
      
      // Colored bar
      doc.setFillColor(16, 185, 129); // Emerald
      doc.roundedRect(margin + labelWidth, itemY, barW, 6, 1, 1, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.score.toFixed(1)}%`, margin + labelWidth + barW + 5, itemY + 5);
    });
    
    return yPos + chartHeight + 15;
  };

  // -----------------------------------------------------
  // GRADE-WISE ANALYSIS (DYNAMIC)
  // -----------------------------------------------------
  const gradeWise = apiData.gradeWiseAnalysis || [];
  
  gradeWise.forEach((gradeData: any, idx: number) => {
    doc.addPage();
    currentY = margin;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    addText(`Part B: Grade ${gradeData.grade} Analysis`, margin, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    addText(`Overall Average Score: ${gradeData.overallAverage.toFixed(1)}%`, margin, currentY);
    currentY += 10;
    
    // 1. Subject Scores Chart
    if (gradeData.subjectScores) {
      const subjectPoints = Object.keys(gradeData.subjectScores).map(subject => ({
        label: subject,
        score: gradeData.subjectScores[subject]
      }));
      
      if (idx % 3 === 0) {
        currentY = drawDynamicBarChart(currentY, `Grade ${gradeData.grade} Subject Performance`, subjectPoints);
      } else if (idx % 3 === 1) {
        currentY = drawAreaLineChart(currentY, `Grade ${gradeData.grade} Subject Performance`, subjectPoints);
      } else {
        currentY = drawHorizontalSubjectChart(currentY, `Grade ${gradeData.grade} Subject Performance`, subjectPoints);
      }
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const gradeDesc = `The chart above visualizes the average score distribution across individual subjects for Grade ${gradeData.grade}, helping identify specific academic strengths and weaknesses for this cohort.`;
      doc.text(doc.splitTextToSize(gradeDesc, contentWidth), margin, currentY - 5);
      currentY += 10;
    }
    
    checkPageBreak(30);
    
    // Top Regions List for this grade
    if (gradeData.topRegions && gradeData.topRegions.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      addText(`Top Performing Regions for Grade ${gradeData.grade}:`, margin, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textBody[0], textBody[1], textBody[2]);
      addText(gradeData.topRegions.join(', '), margin + 65, currentY);
      currentY += 15;
    }
    
    addHeaderFooter();
    
    // 2. Competencies Charts
    if (gradeData.competencies) {
      Object.keys(gradeData.competencies).forEach(subject => {
        checkPageBreak(120);
        
        const compData = gradeData.competencies[subject];
        const compPoints = compData.map((c: any) => ({
          label: c.name,
          score: c.score
        }));
        
        currentY = drawDynamicBarChart(currentY, `Grade ${gradeData.grade} ${subject} Competencies`, compPoints);
      });
    }
  });

  // -----------------------------------------------------
  // THANK YOU PAGE
  // -----------------------------------------------------
  doc.addPage();
  
  doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  addText('Thank You', pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  addText('Learners\' Achievement Test (LAT) 2025–26', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });
  
  addHeaderFooter();

  // --- Output PDF ---
  doc.save('Official_LAT_Report_2025_26.pdf');
};
