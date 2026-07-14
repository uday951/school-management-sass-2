import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invitesApi } from '@/api/invites';
import { PageLoader } from '@/components/LoadingSpinner';
import { GraduationCap, Landmark, Calendar, Layers, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResolveInvitePage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [codeInput, setCodeInput] = React.useState('');
  const [resolvedToken, setResolvedToken] = React.useState(token || '');

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ['resolveInvite', resolvedToken],
    queryFn: () => invitesApi.resolveInvite(resolvedToken),
    enabled: !!resolvedToken,
    retry: false
  });

  const handleResolveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      setResolvedToken(codeInput.trim().toUpperCase());
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 p-6 text-slate-100 font-sans">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Step 1: Input Code if no token specified */}
        {!resolvedToken && (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
              <Landmark className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-indigo-200 bg-clip-text text-transparent">Enter Onboarding Code</h1>
            <p className="mt-2 text-sm text-slate-400">Please provide the 8-character invite code shared by your school standard.</p>
            <form onSubmit={handleResolveCode} className="mt-6 space-y-4">
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. 5C9A4B12"
                className="text-center font-mono text-lg tracking-wider border-slate-800 bg-slate-950 uppercase"
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-md font-semibold">
                Verify Code <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Display Resolved Code Info */}
        {resolvedToken && invite && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/25">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-2xl font-bold bg-gradient-to-r from-slate-100 to-indigo-100 bg-clip-text text-transparent">{invite.schoolName}</h1>
            <p className="text-sm text-slate-400 mt-1">Official invite token: <span className="font-mono text-indigo-300 font-semibold">{invite.publicCode}</span></p>

            {/* Invite Parameters Card */}
            <div className="mt-8 space-y-3.5 text-left rounded-2xl bg-slate-950/80 p-6 border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Academic Scoping</h3>
              
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                <span>Academic Year: <strong className="text-slate-100">{invite.academicYear?.name || 'Any'}</strong></span>
              </div>

              {invite.class && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Class Standard: <strong className="text-slate-100">{invite.class.name}</strong></span>
                </div>
              )}

              {invite.section && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Section Homeroom: <strong className="text-slate-100">{invite.section.name}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-amber-400/80 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10 mt-4">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>Onboarding requests require manual approval from school administration.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <Button onClick={() => navigate(`/join/student/${invite.publicCode}`)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6">
                Register Student Profile
              </Button>
              <Button variant="ghost" onClick={() => setResolvedToken('')} className="text-slate-400 hover:text-slate-100 hover:bg-slate-850">
                Use different code
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Handle Invalid/Expired Code Errors */}
        {resolvedToken && error && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-xl font-bold text-destructive">Verification Failed</h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {(error as any).response?.data?.message || 'The invite code provided is invalid, has expired, or has reached its usage limit.'}
            </p>
            <Button onClick={() => setResolvedToken('')} className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-100">
              Try Another Code
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
