'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Mail, Loader2, User, Lock, EyeOff, Eye, BookOpen, ShieldCheck, CheckCircle2, BarChart2, Camera, Check, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student specific step 2 state
  const [step, setStep] = useState(1);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Handle Camera for students
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 2 && !photoCaptured) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
      } else {
        console.warn("Camera API not available (requires HTTPS or localhost). Bypassing photo capture for local dev.");
        // Provide a dummy 1x1 image base64 to bypass for dev
        setPhotoCaptured("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token, user } = res.data;
      
      const roles = user.roles || [];

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (roles.includes('STUDENT')) {
        setLoading(false);
        setStep(2); // move to proctoring step for students
        return;
      }

      if (roles.includes('SUPER_ADMIN')) {
        router.push('/super-admin/dashboard');
      } else if (roles.includes('SME')) {
        router.push('/sme/questions/generate');
      } else {
        router.push('/teacher/students');
      }
    } catch (err: any) {
      let rawMsg = err.response?.data?.message || err.message || '';
      if (Array.isArray(rawMsg)) {
        rawMsg = rawMsg.join(' ');
      }
      const msgLower = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';
      let friendlyMsg = 'Authentication failed. Please check details.';
      
      if (msgLower.includes('email must be an email') || msgLower.includes('user not found') || msgLower.includes('invalid email') || msgLower.includes('not exist')) {
        friendlyMsg = 'Enter correct email';
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
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">
      {/* Left Panel - Hidden on mobile, takes 45% width on large screens */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#f0f4fc] flex-col p-12 relative overflow-hidden">
        {/* Logo area */}
        <div className="flex items-center gap-3 z-10">
          <div className="bg-[#435eea] text-white p-2 rounded-lg shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-[#1e293b] text-lg">Learners' Achievement Test</span>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col justify-center mt-8 z-10">
          <h1 className="text-4xl xl:text-[42px] font-extrabold leading-[1.1] text-[#1e293b] tracking-tight">
            Empowering<br />Assessments.<br />
            <span className="text-[#435eea]">Enabling Growth.</span>
          </h1>
          <p className="mt-6 text-slate-500 text-[15px] max-w-sm leading-relaxed">
            A unified platform to create, deliver and analyze assessments for learners everywhere.
          </p>

          {/* Illustration Placeholder - Mimicking the layout of the image */}
          <div className="mt-8 relative flex-1 min-h-[250px] w-full max-w-[400px]">
             {/* Replace with actual 3D laptop illustration later */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#e2eaf8] to-transparent rounded-2xl flex items-center justify-center border border-white/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
                <div className="text-slate-400 font-medium text-sm text-center px-4">
                  [Illustration Area]<br />
                  <span className="text-xs font-normal">Please add the laptop 3D graphic here</span>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom tags */}
        <div className="bg-white rounded-xl py-3 px-6 flex items-center justify-between shadow-sm mt-6 z-10 w-full max-w-[400px]">
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#435eea]" /> Secure
          </div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-[#435eea]" /> Reliable
          </div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
            <BarChart2 className="w-4 h-4 text-[#435eea]" /> Insightful
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[400px] bg-white lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:border border-slate-100 rounded-3xl p-8 lg:p-10 relative z-10">

          {step === 1 ? (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 bg-[#f0f4fc] rounded-full flex items-center justify-center mb-4 text-[#435eea] border border-[#e2eaf8]">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Sign In</h2>
                <p className="text-slate-500 mt-2 text-[13px]">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 text-center font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">
                    Email or Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="text"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#435eea]/20 focus:border-[#435eea] transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#435eea]/20 focus:border-[#435eea] transition-colors cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1 pb-2">
                  <a href="#" className="text-[13px] font-bold text-[#004cfb] hover:text-blue-700 cursor-pointer">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#004cfb] hover:bg-[#003ed1] text-white text-sm font-semibold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(0,76,251,0.39)] transition-all disabled:opacity-70 disabled:shadow-none flex justify-center items-center cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
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
                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <Camera className="h-4 w-4" /> Capture Photo
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleStep2Submit}
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="h-4 w-4" /> Yes, This Is Me</>}
                    </button>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all cursor-pointer"
                    >
                      <RefreshCcw className="h-4 w-4" /> Retake Photo
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 flex flex-col items-center gap-3 text-[11px] font-medium text-slate-500 w-full">
          <p className="font-semibold text-slate-600">Need help? Contact your administrator.</p>
          <div className="flex gap-3 items-center">
            <span>© 2024 All rights reserved.</span>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-slate-800 transition-colors cursor-pointer">Privacy Policy</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-slate-800 transition-colors cursor-pointer">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
