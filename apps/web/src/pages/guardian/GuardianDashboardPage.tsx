import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';
import { PageLoader } from '@/components/LoadingSpinner';
import { User, Users, GraduationCap, Calendar, Layers, ShieldAlert, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const claimSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  studentAdmissionNumber: z.string().min(1, 'Admission number is required'),
  studentDateOfBirth: z.string().min(1, 'Date of birth is required'),
  relationship: z.string().min(1, 'Relationship is required'),
});

export default function GuardianDashboardPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data: children, isLoading, error } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: onboardingApi.getLinkedChildren
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      tenantId: user?.tenantId || '',
      studentAdmissionNumber: '',
      studentDateOfBirth: '',
      relationship: 'FATHER'
    }
  });

  const claimMutation = useMutation({
    mutationFn: onboardingApi.submitClaim,
    onSuccess: () => {
      toast.success('Child claim request submitted successfully! Awaiting administrator approval.');
      reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['parentChildren'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit claim request');
    }
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  React.useEffect(() => {
    if (user?.tenantId) {
      reset({
        tenantId: user.tenantId,
        studentAdmissionNumber: '',
        studentDateOfBirth: '',
        relationship: 'FATHER'
      });
    }
  }, [user, reset]);

  const onClaimSubmit = (data: any) => {
    claimMutation.mutate(data);
  };

  const onInvalid = (formErrors: any) => {
    console.error('Validation errors:', formErrors);
    toast.error('Please correct all validation errors before submitting.');
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 p-6 text-slate-100 md:p-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
                Parent & Guardian Portal
              </h1>
              <p className="text-sm text-slate-400">Welcome, {user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                  <Plus className="h-4 w-4" /> Link Sibling / Claim Child
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Child Claim Verification</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onClaimSubmit, onInvalid)} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Tenant ID</label>
                    <Input {...register('tenantId')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                    {errors.tenantId && <p className="mt-1 text-xs text-destructive">{errors.tenantId.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Student Admission Number</label>
                    <Input {...register('studentAdmissionNumber')} placeholder="e.g. ADM-1001" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                    {errors.studentAdmissionNumber && <p className="mt-1 text-xs text-destructive">{errors.studentAdmissionNumber.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Student Date of Birth</label>
                    <Input {...register('studentDateOfBirth')} type="date" style={{ colorScheme: 'dark' }} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                    {errors.studentDateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.studentDateOfBirth.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Your Relationship</label>
                    <select {...register('relationship')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="GUARDIAN">Guardian</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={claimMutation.isPending} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white">
                    {claimMutation.isPending ? 'Verifying...' : 'Submit Claim Request'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={handleLogout} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:text-destructive">
              Logout
            </Button>
          </div>
        </header>

        {/* Linked Children Directory */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-200">Linked Students</h2>
          {children && children.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {children.map((child: any, idx: number) => {
                const current = child.student.enrollments?.find((e: any) => e.isCurrent);
                return (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100">{child.student.firstName} {child.student.lastName}</h3>
                          <p className="text-xs text-slate-400">Relationship: {child.relationship} &bull; Adm: {child.student.admissionNumber}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        {child.student.status}
                      </span>
                    </div>

                    {current ? (
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-950/60 p-4 border border-slate-900">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Class Standard</p>
                            <p className="mt-1 font-bold text-slate-200">{current.gradeLevel?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Section Room</p>
                            <p className="mt-1 font-bold text-slate-200">{current.section?.name}</p>
                          </div>
                        </div>
                        <Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                          <Link to={`/guardian/children/${child.student.id}/attendance`}>
                            Track Student Attendance
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">No current academic year placement found.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 py-16 px-6 text-center">
              <ShieldAlert className="h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-lg font-bold text-slate-300">No Children Linked</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                You do not have any child records mapped to your account yet. Use the claim portal above to verify student admission details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
