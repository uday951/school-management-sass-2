import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitesApi } from '@/api/invites';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Link, QrCode, Trash2, Copy, Eye, Landmark, HelpCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

const inviteSchema = z.object({
  inviteType: z.enum(['SCHOOL', 'CLASS', 'SECTION', 'PARENT']),
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
  maxUses: z.number().min(1).optional(),
  requireApproval: z.boolean().default(true)
});

export default function InvitesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [qrLink, setQrLink] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const { data: invitesData, isLoading } = useQuery({
    queryKey: ['schoolInvites'],
    queryFn: () => invitesApi.listInvites({ page: 1, limit: 15 })
  });

  const { data: years } = useQuery({
    queryKey: ['academicYearsList'],
    queryFn: academicYearsApi.list
  });

  const { data: classes } = useQuery<any[]>({
    queryKey: ['classesList'],
    queryFn: classesApi.listClasses
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteType: 'SCHOOL',
      academicYearId: '',
      classId: '',
      sectionId: '',
      expiresInDays: 30,
      maxUses: 100,
      requireApproval: true
    }
  });

  const selectedType = watch('inviteType');
  const selectedClass = watch('classId');

  const { data: sections } = useQuery<any[]>({
    queryKey: ['sectionsList', selectedClass],
    queryFn: () => classesApi.listSections(selectedClass),
    enabled: !!selectedClass
  });

  const createMutation = useMutation({
    mutationFn: invitesApi.createInvite,
    onSuccess: (newInvite) => {
      toast.success(`Invite created successfully! Code: ${newInvite.publicCode}`);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['schoolInvites'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create invite');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: invitesApi.revokeInvite,
    onSuccess: () => {
      toast.success('Invite link revoked successfully!');
      queryClient.invalidateQueries({ queryKey: ['schoolInvites'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to revoke invite');
    }
  });

  const onCreateSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      academicYearId: data.academicYearId || undefined,
      classId: data.classId || undefined,
      sectionId: data.sectionId || undefined,
    });
  };

  const getJoinUrl = (code: string) => {
    const base = window.location.origin;
    return `${base}/join/${code}`;
  };

  const handleCopyLink = (code: string, id: string) => {
    const url = getJoinUrl(code);
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied to clipboard!');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding Codes & Links</h1>
          <p className="text-sm text-muted-foreground">Manage secure join links for student self-registration.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Create Invite Link
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Join Code</DialogTitle>
              <DialogDescription className="text-slate-400">Configure scoping options for the new registration link.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Invite Scope *</label>
                <select {...register('inviteType')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="SCHOOL">School Wide</option>
                  <option value="CLASS">Class Scoped</option>
                  <option value="SECTION">Section Scoped</option>
                  <option value="PARENT">Parent Link</option>
                </select>
              </div>

              {(selectedType === 'CLASS' || selectedType === 'SECTION') && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Academic Year *</label>
                  <select {...register('academicYearId')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Select Year...</option>
                    {years?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>
              )}

              {(selectedType === 'CLASS' || selectedType === 'SECTION') && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Target Class *</label>
                  <select {...register('classId')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Select Class...</option>
                    {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {selectedType === 'SECTION' && selectedClass && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Target Section *</label>
                  <select {...register('sectionId')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Select Section...</option>
                    {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Expires In (Days)</label>
                  <Input type="number" {...register('expiresInDays', { valueAsNumber: true })} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Max Uses</label>
                  <Input type="number" {...register('maxUses', { valueAsNumber: true })} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-300">Require Administrator Approval</span>
                <input type="checkbox" {...register('requireApproval')} className="h-4 w-4 accent-indigo-500" />
              </div>

              <Button type="submit" disabled={createMutation.isPending} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white">
                {createMutation.isPending ? 'Generating...' : 'Create Invite Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invites Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead>Public Code</TableHead>
              <TableHead>Invite Scope</TableHead>
              <TableHead>Placement details</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitesData?.invites && invitesData.invites.length > 0 ? (
              invitesData.invites.map((invite) => (
                <TableRow key={invite.id} className="border-slate-800 hover:bg-slate-900/15">
                  <TableCell className="font-mono font-bold text-slate-200">{invite.publicCode}</TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold uppercase bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                      {invite.inviteType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-300">
                    {invite.inviteType === 'SCHOOL' && <span>School wide signup</span>}
                    {invite.inviteType === 'CLASS' && <span>Class: {invite.class?.name || 'N/A'}</span>}
                    {invite.inviteType === 'SECTION' && <span>Section: {invite.class?.name || 'N/A'} &bull; {invite.section?.name || 'N/A'}</span>}
                    {invite.inviteType === 'PARENT' && <span>Parent claim link</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {invite.usageCount} {invite.maxUses ? `/ ${invite.maxUses}` : ''} uses
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                      invite.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {invite.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1.5">
                    <Button onClick={() => handleCopyLink(invite.publicCode, invite.id)} variant="ghost" size="icon" className="hover:bg-slate-800/80">
                      {copiedId === invite.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setQrLink(getJoinUrl(invite.publicCode))} variant="ghost" size="icon" className="hover:bg-slate-800/80">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-xs text-center p-6">
                        <DialogHeader>
                          <DialogTitle className="text-md font-bold">QR Registration Code</DialogTitle>
                        </DialogHeader>
                        {qrLink && (
                          <div className="mt-4 mx-auto p-4 rounded-2xl bg-white border border-slate-100 inline-block">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}`}
                              alt="Invite QR Code"
                              className="h-44 w-44"
                            />
                          </div>
                        )}
                        <p className="mt-3 text-xs text-slate-400 font-mono select-all truncate">{qrLink}</p>
                      </DialogContent>
                    </Dialog>
                    {invite.status === 'ACTIVE' && (
                      <Button onClick={() => revokeMutation.mutate(invite.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  No active registration codes created.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
