'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  BookOpen,
  User,
  ShieldCheck,
  Info,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Users,
  Camera,
  RefreshCcw,
  Check,
  Lock
} from 'lucide-react';

export default function TeacherSignIn() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Handle Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 2 && !photoCaptured) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, photoCaptured]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoCaptured(dataUrl);
      }
    }
  };

  const retakePhoto = () => {
    setPhotoCaptured(null);
  };

  // In a real implementation, you might want to fetch initial state or clear layout state

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email: studentId, password });
      const { access_token, refresh_token, user } = res.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      setLoading(false);
      router.push('/teacher/students');
    } catch (err: any) {
      let rawMsg = err.response?.data?.message || err.message || '';
      if (Array.isArray(rawMsg)) {
        rawMsg = rawMsg.join(' ');
      }
      
      const msgLower = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';
      
      let friendlyMsg = 'Authentication failed. Please check details.';
      
      if (msgLower.includes('email must be an email') || msgLower.includes('user not found') || msgLower.includes('invalid email') || msgLower.includes('not exist')) {
        friendlyMsg = 'Enter correct email address';
      } else if (msgLower.includes('password') || msgLower.includes('credentials') || msgLower.includes('unauthorized') || err.response?.status === 401) {
        friendlyMsg = 'Enter correct password';
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      setError(friendlyMsg);
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await apiClient.get('/exams/student/upcoming');
      if (res.data && res.data.length > 0) {
        router.push(`/student/exam/${res.data[0].id}`);
      } else {
        router.push('/student/exam/123');
      }
    } catch (err) {
      console.error('Failed to load upcoming exams:', err);
      router.push('/student/exam/123');
    }
  }

  return (
    <div className="min-h-screen bg-white flex w-full font-sans">
      {/* LEFT PANEL - Marketing / Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#f0f4ff] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Learners' Achievement Test
          </span>
        </div>

        {/* Main Marketing Content */}
        <div className="relative z-10 mt-12 mb-auto max-w-md">
          <h1 className="text-[44px] leading-[1.1] font-black text-slate-900 mb-2 tracking-tight">
            Empowering <br /> Assessments. <br />
            <span className="text-blue-600">Enabling Growth.</span>
          </h1>
          <p className="text-slate-600 mt-6 text-lg leading-relaxed max-w-sm">
            A unified platform to create, deliver and analyze assessments for learners everywhere.
          </p>
        </div>

        {/* Abstract Illustration Placeholder */}
        <div className="relative z-10 flex-1 flex items-center justify-center min-h-[300px]">
           <div className="relative w-full max-w-[400px] aspect-video">
              <div className="absolute inset-x-8 bottom-0 h-4 bg-slate-300 rounded-b-xl shadow-xl z-20"></div>
              <div className="absolute inset-x-12 bottom-4 top-12 bg-slate-800 rounded-t-xl border-8 border-slate-800 overflow-hidden shadow-2xl z-10 flex flex-col">
                 <div className="flex-1 bg-white p-5 relative">
                    <div className="w-1/3 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                       <div className="w-16 h-16 bg-blue-400 rounded-full border-4 border-white shadow-sm"></div>
                    </div>
                    <div className="absolute top-6 right-6 w-5/12 space-y-3">
                       <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                       <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
                       <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                       <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                    </div>
                 </div>
              </div>
              {/* Floating icons */}
              <div className="absolute -left-4 top-1/4 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100/50 z-30 animate-bounce" style={{ animationDuration: '3.2s' }}>
                 <BarChart3 className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="absolute top-2 right-8 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100/50 z-30 animate-bounce" style={{ animationDuration: '4.1s', animationDelay: '1s' }}>
                 <ClipboardList className="h-6 w-6 text-blue-500" />
              </div>
              <div className="absolute bottom-8 -right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100/50 z-30 animate-bounce" style={{ animationDuration: '3.7s', animationDelay: '0.5s' }}>
                 <Users className="h-6 w-6 text-violet-500" />
              </div>
           </div>
        </div>

        {/* Bottom Badges */}
        <div className="relative z-10 mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center px-8">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Secure
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Users className="h-4 w-4 text-blue-600" /> Reliable
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <BarChart3 className="h-4 w-4 text-blue-600" /> Insightful
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Action Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative bg-white">
        
        {/* Main Form Container */}
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome, Teacher!</h2>
            <p className="text-slate-500 text-sm">
              Enter your teacher email to access the dashboard.
            </p>
          </div>


          {/* Step 1 Content */}
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="studentId" className="block text-xs font-bold text-slate-900">
                    Enter Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                      placeholder="Enter your teacher email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-900">
                    Enter Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs text-slate-500">Ask your teacher for your credentials.</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !studentId.trim() || !password.trim()}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Student Found!</h3>
                 <p className="text-xs text-slate-500">Please capture a photo to confirm your identity.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-50 bg-slate-100 shadow-inner flex items-center justify-center">
                  {!photoCaptured ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <img 
                      src={photoCaptured} 
                      alt="Captured" 
                      className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                {!photoCaptured ? (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <Camera className="h-4 w-4" /> Capture Photo
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleStep2Submit}
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
                    >
                      {loading ? 'Starting...' : (
                        <><Check className="h-4 w-4" /> Yes, This Is Me</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
                    >
                      <RefreshCcw className="h-4 w-4" /> Retake Photo
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Safe & Secure Badge */}
          <div className="mt-8 p-4 bg-[#fafafa] border border-slate-100 rounded-xl flex items-start gap-3">
            <div className="mt-0.5 bg-emerald-50 p-1.5 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Safe & Secure</h4>
              <p className="text-xs text-slate-500 mt-0.5">Your assessment is secure and monitored. Do your best!</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
            <span>© 2024 All rights reserved.</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <span className="w-px h-3 bg-slate-300"></span>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </div>
  );
}
