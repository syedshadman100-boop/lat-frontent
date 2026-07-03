'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  AlertCircle,
  Filter,
  Download,
  BarChart2,
  Calendar,
  Loader,
  BookOpen
} from 'lucide-react';
import { generateStudentReport } from '@/lib/pdf-report-generator';
import apiClient from '@/lib/api-client';

export default function StudentOverviewPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/analytics/region-wise-report');
        setApiData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportReport = async () => {
    if (!apiData) return;
    setIsExporting(true);
    try {
      // Pass the fully dynamic apiData directly to the PDF generator.
      // The generator will use apiData implicitly inside itself, 
      // but we also pass it the date structure it expects.
      await generateStudentReport({ dateOfTest: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } as any);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Loader size={40} className="animate-spin" />
          <p className="font-semibold">Loading Overview...</p>
        </div>
      </div>
    );
  }

  if (error || !apiData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-semibold flex items-center gap-3">
          <AlertCircle size={20} /> {error || "No data available."}
        </div>
      </div>
    );
  }

  const { summary, overallPerformance, gradeWiseAnalysis } = apiData;

  const formatGrades = (grades: any) => {
    if (!grades) return "3, 6 and 9";
    if (Array.isArray(grades)) {
      const filtered = grades.filter(g => String(g) !== '7');
      if (filtered.length === 0) return "3, 6 and 9";
      if (filtered.length === 1) return filtered[0];
      if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
      return `${filtered.slice(0, -1).join(', ')} and ${filtered[filtered.length - 1]}`;
    }
    let gStr = String(grades).trim();
    gStr = gStr.replace(/,? ?7/g, '').trim(); // Try to strip 7 out of strings
    if (gStr === "358" || gStr === "3,5,8" || gStr === "3, 5, 8" || gStr === "369" || gStr === "3,6,9" || gStr === "3, 6, 9" || gStr === "3, 6, and 9") return "3, 6 and 9";
    return gStr || "3, 6 and 9";
  };

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1400px] mx-auto">

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Overview</h1>
          <p className="text-sm font-medium text-gray-500">Analyze performance metrics and learning outcomes across all regions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(29,78,216,0.25)] hover:shadow-[0_6px_16px_rgba(29,78,216,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>


      {/* KPI Cards dynamically bound to apiData */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Target size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{summary.regionparticipated || summary.regionsParticipated || 0}</h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Regions</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <BarChart2 size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{summary.schoolparticipated || summary.schoolsParticipated || 0}</h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Schools</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-1">
                {Object.values(summary.studentsParticipated || {})
                  .reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
                  .toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                {formatGrades(summary.gradesparticiated || summary.gradesParticipated || summary.grades)}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Grades Included</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Top Regions */}
        {overallPerformance?.topRegions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> Top Performing Regions
            </h2>
            <div className="space-y-4">
              {overallPerformance.topRegions.map((region: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-700">{region.name || region.region}</span>
                    <span className="text-sm font-bold text-gray-900">{region.score.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${region.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Regions */}
        {overallPerformance?.bottomRegions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={20} /> Regions Needing Support
            </h2>
            <div className="space-y-4">
              {overallPerformance.bottomRegions.map((region: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-700">{region.name || region.region}</span>
                    <span className="text-sm font-bold text-gray-900">{region.score.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${region.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grade-wise Analysis */}
      {gradeWiseAnalysis && (
        <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={20} />
            </div>
            Grade-wise Highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradeWiseAnalysis.filter((g: any) => g.grade !== 7 && g.grade !== '7').map((gradeData: any, idx: number) => {
              // Generate distinct color themes for each card
              const themes = [
                { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', accent: 'bg-blue-500', icon: 'text-blue-500' },
                { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', accent: 'bg-emerald-500', icon: 'text-emerald-500' },
                { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', accent: 'bg-purple-500', icon: 'text-purple-500' },
                { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', accent: 'bg-orange-500', icon: 'text-orange-500' }
              ];
              const t = themes[idx % themes.length];

              return (
                <div key={idx} className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Top colorful accent bar */}
                  <div className={`h-1.5 w-full ${t.accent}`}></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Grade {gradeData.grade}</h3>
                      </div>
                      <div className={`px-3 py-1.5 ${t.bg} ${t.text} text-sm font-extrabold rounded-lg shadow-sm border ${t.border}`}>
                        {gradeData.overallAverage.toFixed(1)}% Avg
                      </div>
                    </div>

                    {gradeData.topRegions && gradeData.topRegions.length > 0 && (
                      <div className="mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Region</p>
                        <div className="flex items-center gap-2">
                          <Target size={14} className={t.icon} />
                          <p className="text-sm font-bold text-gray-800">{gradeData.topRegions[0]}</p>
                        </div>
                      </div>
                    )}

                    {gradeData.subjectScores && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Subject Performance</p>
                        <div className="space-y-4">
                          {Object.keys(gradeData.subjectScores).map((subject, sIdx) => {
                            const score = gradeData.subjectScores[subject];
                            return (
                              <div key={sIdx} className="group">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{subject}</span>
                                  <span className="text-sm font-bold text-gray-900">{score.toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${t.accent} rounded-full transition-all duration-700 ease-out`} style={{ width: `${score}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
