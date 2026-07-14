import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubmittedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-8 text-2xl font-black bg-gradient-to-r from-slate-100 to-emerald-300 bg-clip-text text-transparent">Application Submitted!</h1>
        <p className="mt-3 text-slate-400 leading-relaxed text-sm">
          Your student registration request was recorded successfully.
        </p>

        <div className="mt-6 flex items-start gap-3 text-left rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-300 text-xs">
          <Clock className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Awaiting Administrator Review</span>
            <p className="mt-1 text-slate-400">
              The school admin will verify your details, check for duplicates, and approve your academic placement. You will receive access credentials once approved.
            </p>
          </div>
        </div>

        <Button onClick={() => navigate('/login')} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
          Return to Login
        </Button>
      </div>
    </div>
  );
}
