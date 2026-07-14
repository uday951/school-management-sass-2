import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, CheckCircle2, XCircle, FileText, UserCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ApprovalQueuePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'STUDENTS' | 'GUARDIANS'>('STUDENTS');
  
  // Modals state
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [selectedGuardianClaim, setSelectedGuardianClaim] = React.useState<any>(null);
  
  // Action details
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [correctOpen, setCorrectOpen] = React.useState(false);
  
  const [actionMessage, setActionMessage] = React.useState('');
  const [createLogin, setCreateLogin] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [tempPassword, setTempPassword] = React.useState('TempPass123!');

  // Placement selection state
  const [selectedYearId, setSelectedYearId] = React.useState('');
  const [selectedClassId, setSelectedClassId] = React.useState('');
  const [selectedSectionId, setSelectedSectionId] = React.useState('');

  // Fetch placement options
  const { data: years } = useQuery({
    queryKey: ['academicYearsList'],
    queryFn: () => academicYearsApi.list()
  });

  const { data: classes } = useQuery({
    queryKey: ['classesList'],
    queryFn: () => classesApi.listClasses()
  });

  const { data: sections } = useQuery({
    queryKey: ['sectionsList', selectedClassId],
    queryFn: () => classesApi.listSections(selectedClassId),
    enabled: !!selectedClassId
  });

  React.useEffect(() => {
    if (selectedStudent) {
      setSelectedYearId(selectedStudent.requestedAcademicYearId || '');
      setSelectedClassId(selectedStudent.requestedClassId || '');
      setSelectedSectionId(selectedStudent.requestedSectionId || '');
    }
  }, [selectedStudent]);

  // Queries
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['studentQueue'],
    queryFn: () => onboardingApi.listStudentRequests({ page: 1, limit: 20 })
  });

  const { data: guardianData, isLoading: guardianLoading } = useQuery({
    queryKey: ['guardianClaimsQueue'],
    queryFn: () => onboardingApi.listGuardianClaims({ page: 1, limit: 20 })
  });

  // Mutations
  const reviewStudentMutation = useMutation({
    mutationFn: (payload: { id: string; action: 'APPROVE' | 'REJECT' | 'CORRECT'; message?: string; createLoginAccount?: boolean; loginEmail?: string; temporaryPassword?: string; academicYearId?: string; classId?: string; sectionId?: string }) =>
      onboardingApi.reviewStudentRequest(payload.id, payload),
    onSuccess: () => {
      toast.success('Student onboarding request successfully updated!');
      setApproveOpen(false);
      setRejectOpen(false);
      setCorrectOpen(false);
      setSelectedStudent(null);
      setActionMessage('');
      queryClient.invalidateQueries({ queryKey: ['studentQueue'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Review action failed');
    }
  });

  const reviewGuardianMutation = useMutation({
    mutationFn: (payload: { id: string; action: 'APPROVE' | 'REJECT'; rejectionReason?: string }) =>
      onboardingApi.reviewGuardianClaim(payload.id, payload),
    onSuccess: () => {
      toast.success('Guardian child claim request successfully updated!');
      setApproveOpen(false);
      setRejectOpen(false);
      setSelectedGuardianClaim(null);
      setActionMessage('');
      queryClient.invalidateQueries({ queryKey: ['guardianClaimsQueue'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Review action failed');
    }
  });

  const handleApproveStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    reviewStudentMutation.mutate({
      id: selectedStudent.id,
      action: 'APPROVE',
      createLoginAccount: createLogin,
      loginEmail: createLogin ? loginEmail : undefined,
      temporaryPassword: createLogin ? tempPassword : undefined,
      academicYearId: selectedYearId || undefined,
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined
    });
  };

  const handleRejectStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    reviewStudentMutation.mutate({
      id: selectedStudent.id,
      action: 'REJECT',
      message: actionMessage
    });
  };

  const handleCorrectStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    reviewStudentMutation.mutate({
      id: selectedStudent.id,
      action: 'CORRECT',
      message: actionMessage
    });
  };

  const handleApproveGuardian = (claimId: string) => {
    reviewGuardianMutation.mutate({
      id: claimId,
      action: 'APPROVE'
    });
  };

  const handleRejectGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuardianClaim) return;
    reviewGuardianMutation.mutate({
      id: selectedGuardianClaim.id,
      action: 'REJECT',
      rejectionReason: actionMessage
    });
  };

  if (studentLoading || guardianLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding Approval Queues</h1>
          <p className="text-sm text-muted-foreground">Verify and authorize student self-registrations and parent claims.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <Button onClick={() => setActiveTab('STUDENTS')} variant={activeTab === 'STUDENTS' ? 'default' : 'ghost'} className="text-xs font-semibold rounded-lg">
          Student Registrations ({studentData?.requests?.length || 0})
        </Button>
        <Button onClick={() => setActiveTab('GUARDIANS')} variant={activeTab === 'GUARDIANS' ? 'default' : 'ghost'} className="text-xs font-semibold rounded-lg">
          Guardian Link Claims ({guardianData?.claims?.length || 0})
        </Button>
      </div>

      {/* Student Onboarding queue */}
      {activeTab === 'STUDENTS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead>Student Name</TableHead>
                <TableHead>Admission Details</TableHead>
                <TableHead>Requested Placement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentData?.requests && studentData.requests.length > 0 ? (
                studentData.requests.map((req) => (
                  <TableRow key={req.id} className="border-slate-800 hover:bg-slate-900/15">
                    <TableCell className="font-semibold text-slate-200">{req.personalData.firstName} {req.personalData.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-300">
                      No: {req.admissionData.admissionNumber} &bull; Born: {new Date(req.personalData.dateOfBirth).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      Year: {req.academicYear?.name || 'N/A'} <br /> Class: {req.class?.name || 'N/A'} &bull; Sec: {req.section?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        req.status === 'NEEDS_CORRECTION' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1.5">
                      <Button onClick={() => { setSelectedStudent(req); setLoginEmail(req.personalData.personalEmail || ''); }} variant="outline" size="sm" className="border-slate-800 bg-slate-900/40 gap-1"><FileText className="h-3.5 w-3.5" /> Review</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No student registration requests in queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Guardian Child Claims queue */}
      {activeTab === 'GUARDIANS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead>Parent Name</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead>Claimed Sibling / Child</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guardianData?.claims && guardianData.claims.length > 0 ? (
                guardianData.claims.map((claim) => (
                  <TableRow key={claim.id} className="border-slate-800 hover:bg-slate-900/15">
                    <TableCell className="font-semibold text-slate-200">{claim.guardianUser?.firstName} {claim.guardianUser?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-300">{claim.guardianUser?.email} <br /> {claim.guardianUser?.phone || 'No phone'}</TableCell>
                    <TableCell className="text-sm text-slate-200">
                      {claim.student ? `${claim.student.firstName} ${claim.student.lastName} (${claim.student.admissionNumber})` : `Adm No: ${claim.studentAdmissionNumber}`}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-750 text-indigo-300 font-semibold">{claim.relationship}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {claim.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1.5">
                      {claim.status === 'PENDING' && (
                        <>
                          <Button onClick={() => handleApproveGuardian(claim.id)} disabled={reviewGuardianMutation.isPending} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1 flex items-center"><CheckCircle className="h-3.5 w-3.5" /> Approve</Button>
                          <Button onClick={() => setSelectedGuardianClaim(claim)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-1 flex items-center"><XCircle className="h-3.5 w-3.5" /> Reject</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No guardian child claims in queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* STUDENT REVIEW DETAILS MODAL */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-2xl overflow-y-auto max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Onboarding Profile: {selectedStudent.personalData.firstName} {selectedStudent.personalData.lastName}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              
              {/* Profile details */}
              <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-950 p-5 border border-slate-850">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Personal</h4>
                  <p className="mt-2 text-sm text-slate-200">Gender: {selectedStudent.personalData.gender}</p>
                  <p className="text-sm text-slate-200">Birth: {new Date(selectedStudent.personalData.dateOfBirth).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-200">Email: {selectedStudent.personalData.personalEmail || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Placement</h4>
                  <p className="mt-2 text-sm text-slate-200">Class: {selectedStudent.class?.name || 'N/A'}</p>
                  <p className="text-sm text-slate-200">Section: {selectedStudent.section?.name || 'N/A'}</p>
                  <p className="text-sm text-slate-200">Adm No: {selectedStudent.admissionData.admissionNumber}</p>
                </div>
              </div>

              {/* Address details */}
              {selectedStudent.addressData && (
                <div className="rounded-xl bg-slate-950 p-5 border border-slate-850">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Current Address</h4>
                  <p className="mt-2 text-sm text-slate-200">
                    {selectedStudent.addressData.currentAddressLine1} <br />
                    {selectedStudent.addressData.currentAddressLine2 && `${selectedStudent.addressData.currentAddressLine2}, `}
                    {selectedStudent.addressData.currentCity}, {selectedStudent.addressData.currentState}, {selectedStudent.addressData.currentPostalCode}
                  </p>
                </div>
              )}

              {/* Guardian details */}
              {selectedStudent.guardianData && (
                <div className="rounded-xl bg-slate-950 p-5 border border-slate-850">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Guardian Info</h4>
                  <p className="mt-2 text-sm text-slate-200">Name: {selectedStudent.guardianData.firstName} {selectedStudent.guardianData.lastName}</p>
                  <p className="text-sm text-slate-200">Relationship: {selectedStudent.guardianData.relationship}</p>
                  <p className="text-sm text-slate-200">Phone: {selectedStudent.guardianData.phone}</p>
                  <p className="text-sm text-slate-200">Email: {selectedStudent.guardianData.email || 'N/A'}</p>
                </div>
              )}

              {/* Request Status Correction Banner */}
              {selectedStudent.status === 'NEEDS_CORRECTION' && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-300 text-sm">
                  <strong>Correction Message Requested:</strong> <p className="mt-1">{selectedStudent.correctionMessage}</p>
                </div>
              )}

              {/* Actions Footer */}
              {selectedStudent.status === 'PENDING' && (
                <div className="flex gap-2 pt-4 border-t border-slate-800 justify-end">
                  <Button onClick={() => setApproveOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1"><UserCheck className="h-4 w-4" /> Approve Profile</Button>
                  <Button onClick={() => setCorrectOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1">Request Correction</Button>
                  <Button onClick={() => setRejectOpen(true)} variant="ghost" className="text-destructive hover:bg-destructive/10">Reject Application</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* APPROVE STUDENT DIALOG */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Student Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApproveStudentSubmit} className="mt-4 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Confirming this application will register the student profile and create their enrollment placement record.
            </p>
            {/* Placement scoping selector */}
            <div className="space-y-3 border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide">Assign Academic Placement</h4>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Academic Year *</label>
                <select value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select Year...</option>
                  {years?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Grade Level / Class *</label>
                <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }} required className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select Class...</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Section Room *</label>
                <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select Section...</option>
                  {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 pb-2">
              <span className="text-xs font-semibold text-slate-300">Create Login Credentials</span>
              <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} className="h-4 w-4 accent-indigo-500" />
            </div>
            {createLogin && (
              <div className="space-y-3 border-t border-slate-800 pt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Login Email Address</label>
                  <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Temporary Password</label>
                  <Input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
              </div>
            )}
            <Button type="submit" disabled={reviewStudentMutation.isPending} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              {reviewStudentMutation.isPending ? 'Processing...' : 'Confirm Approval'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT STUDENT DIALOG */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectStudentSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Rejection Reason</label>
              <Input value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} placeholder="e.g. Duplicate credentials" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
            </div>
            <Button type="submit" disabled={reviewStudentMutation.isPending} className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/95">
              Confirm Rejection
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* REQUEST CORRECTION DIALOG */}
      <Dialog open={correctOpen} onOpenChange={setCorrectOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Request Correction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCorrectStudentSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Correction message</label>
              <Input value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} placeholder="e.g. Please check your DOB format" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
            </div>
            <Button type="submit" disabled={reviewStudentMutation.isPending} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Send Correction Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT GUARDIAN CLAIM DIALOG */}
      {selectedGuardianClaim && (
        <Dialog open={!!selectedGuardianClaim} onOpenChange={() => setSelectedGuardianClaim(null)}>
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Child Claim Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRejectGuardianSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Rejection Reason</label>
                <Input value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} placeholder="e.g. Details do not match profile" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
              </div>
              <Button type="submit" disabled={reviewGuardianMutation.isPending} className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/95">
                Confirm Rejection
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
