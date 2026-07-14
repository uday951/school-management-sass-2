import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { guardiansApi } from '@/api/guardians';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import {
  GraduationCap,
  Calendar,
  Building,
  User,
  ShieldAlert,
  Plus,
  ArrowLeft,
  FileText,
  Trash2,
  Bookmark,
  Share2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'academic' | 'guardians' | 'documents'>('overview');

  // Dialog / Modal state toggles
  const [isTransferOpen, setIsTransferOpen] = React.useState(false);
  const [targetSectionId, setTargetSectionId] = React.useState('');

  const [isClassChangeOpen, setIsClassChangeOpen] = React.useState(false);
  const [promoteYearId, setPromoteYearId] = React.useState('');
  const [promoteClassId, setPromoteClassId] = React.useState('');
  const [promoteSectionId, setPromoteSectionId] = React.useState('');
  const [promoteRollNumber, setPromoteRollNumber] = React.useState('');

  const [isLinkGuardianOpen, setIsLinkGuardianOpen] = React.useState(false);
  const [guardianSearchQuery, setGuardianSearchQuery] = React.useState('');
  const [guardianSearchResults, setGuardianSearchResults] = React.useState<any[]>([]);
  const [linkRelationship, setLinkRelationship] = React.useState('Father');
  const [linkIsPrimary, setLinkIsPrimary] = React.useState(false);

  const [isDocOpen, setIsDocOpen] = React.useState(false);
  const [docType, setDocType] = React.useState('BIRTH_CERTIFICATE');
  const [docTitle, setDocTitle] = React.useState('');
  const [docUrl, setDocUrl] = React.useState('');

  // Queries
  const { data: student, isLoading, error } = useQuery({
    queryKey: ['studentProfile', id],
    queryFn: () => studentsApi.getProfile(id!),
    enabled: !!id,
  });

  const { data: years } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const { data: promoteSections } = useQuery({
    queryKey: ['promoteSections', promoteClassId],
    queryFn: () => classesApi.listSections(promoteClassId || undefined),
    enabled: !!promoteClassId,
  });

  // Automatically select default section when class standard changes
  React.useEffect(() => {
    if (promoteSections && promoteSections.length > 0) {
      setPromoteSectionId(promoteSections[0].id);
    } else {
      setPromoteSectionId('');
    }
  }, [promoteSections]);

  // Mutations
  const transferMutation = useMutation({
    mutationFn: (data: { targetSectionId: string; reason?: string }) =>
      studentsApi.transferSection(student?.currentEnrollment?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Section transferred successfully');
      setIsTransferOpen(false);
      setTargetSectionId('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Transfer failed');
    },
  });

  const changeClassMutation = useMutation({
    mutationFn: (data: any) => studentsApi.changeClass(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Student re-enrolled successfully');
      setIsClassChangeOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Re-enrollment failed');
    },
  });

  const unlinkGuardianMutation = useMutation({
    mutationFn: (linkId: string) => studentsApi.unlinkGuardian(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Guardian unlinked successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to unlink guardian');
    },
  });

  const searchGuardiansMutation = useMutation({
    mutationFn: (q: string) => guardiansApi.list({ search: q, page: 1, limit: 5 }),
    onSuccess: (res) => {
      setGuardianSearchResults(res.data);
    },
  });

  const linkGuardianMutation = useMutation({
    mutationFn: (data: any) => studentsApi.linkGuardian(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Guardian linked successfully');
      setIsLinkGuardianOpen(false);
      setGuardianSearchQuery('');
      setGuardianSearchResults([]);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Link failed');
    },
  });

  const addDocMutation = useMutation({
    mutationFn: (data: any) => studentsApi.addDocument(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Document metadata registered');
      setIsDocOpen(false);
      setDocTitle('');
      setDocUrl('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to register document');
    },
  });

  const archiveDocMutation = useMutation({
    mutationFn: (docId: string) => studentsApi.archiveDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Document reference deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete document');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !student) return <div className="text-center py-12 text-destructive">Student not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/school/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Admission No: <span className="font-mono font-bold text-foreground">{student.admissionNumber}</span> | Status:{' '}
              <Badge variant={student.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{student.status}</Badge>
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/school/students/${student.id}/edit`}>
            <Edit className="h-4 w-4 mr-1.5" /> Edit Profile
          </Link>
        </Button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile Overview
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'academic'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Academic & Enrollment
        </button>
        <button
          onClick={() => setActiveTab('guardians')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'guardians'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Guardians
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Documents Metadata
        </button>
      </div>

      {/* TAB CONTENTS: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Full Name</span>
                  <span className="text-foreground font-semibold">
                    {student.firstName} {student.middleName || ''} {student.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Gender</span>
                  <span className="text-foreground font-medium">{student.gender}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Date of Birth</span>
                  <span className="text-foreground font-medium">{formatDate(student.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Blood Group</span>
                  <span className="text-foreground font-medium">{student.bloodGroup || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Nationality</span>
                  <span className="text-foreground font-medium">{student.nationality || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Mother Tongue</span>
                  <span className="text-foreground font-medium">{student.motherTongue || '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact & Address details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Phone</span>
                    <span className="text-foreground font-medium">{student.personalPhone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Email Address</span>
                    <span className="text-foreground font-medium">{student.personalEmail || '—'}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <span className="text-muted-foreground block text-xs uppercase font-semibold">Current Address</span>
                  <span className="text-foreground block mt-1">
                    {student.currentAddressLine1}, {student.currentAddressLine2 ? `${student.currentAddressLine2}, ` : ''}
                    {student.currentCity}, {student.currentState}, {student.currentCountry} - {student.currentPostalCode}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <span className="text-muted-foreground block text-xs uppercase font-semibold">Permanent Address</span>
                  <span className="text-foreground block mt-1">
                    {student.sameAsCurrentAddress ? (
                      <span className="text-xs text-muted-foreground italic">Same as current address</span>
                    ) : (
                      <span>
                        {student.permanentAddressLine1}, {student.permanentAddressLine2 ? `${student.permanentAddressLine2}, ` : ''}
                        {student.permanentCity}, {student.permanentState}, {student.permanentCountry} - {student.permanentPostalCode}
                      </span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar restricted emergency / enrollment metadata */}
          <div className="space-y-6">
            <Card className="border-border bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base">Current Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs sm:text-sm">
                {student.currentEnrollment ? (
                  <>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase">Academic Session</span>
                      <span className="font-semibold">{student.currentEnrollment.academicYear.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase">Class Standard</span>
                      <span className="font-semibold">{student.currentEnrollment.gradeLevel.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase">Section Room</span>
                      <span className="font-semibold">{student.currentEnrollment.section.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase">Roll Number</span>
                      <span className="font-mono font-bold">{student.currentEnrollment.rollNumber || '—'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-amber-500 italic">No current active enrollment context found</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency & Restricted Info */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" /> Sensitive Health Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-red-400/80 block text-xs uppercase font-bold">Emergency Contact</span>
                  {student.emergencyContactName ? (
                    <span className="text-foreground font-semibold">
                      {student.emergencyContactName} ({student.emergencyContactRelationship}) - {student.emergencyContactPhone}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="border-t border-red-500/10 pt-2">
                  <span className="text-red-400/80 block text-xs uppercase font-bold">Allergies</span>
                  <span className="text-foreground font-semibold">{student.allergies || 'None recorded'}</span>
                </div>
                <div className="border-t border-red-500/10 pt-2">
                  <span className="text-red-400/80 block text-xs uppercase font-bold">Medical Notes</span>
                  <span className="text-foreground block mt-1">{student.medicalNotes || '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENTS: ACADEMIC */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsTransferOpen(true)} disabled={!student.currentEnrollment} size="sm" variant="outline">
              Transfer Section
            </Button>
            <Button onClick={() => setIsClassChangeOpen(true)} size="sm">
              Change Class (Promotion)
            </Button>
          </div>

          {/* Section Transfer Dialog form */}
          {isTransferOpen && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Execute Section Transfer</CardTitle>
                <CardDescription>Move student under another section of the same class standard.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 items-end">
                <div className="space-y-2 flex-1 max-w-[240px]">
                  <Label>Target Section</Label>
                  <Select value={targetSectionId} onValueChange={setTargetSectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose section" />
                    </SelectTrigger>
                    <SelectContent>
                      {student.currentEnrollment &&
                        classes?.find((c) => c.id === student.currentEnrollment.gradeLevelId) && (
                          // Fetch sections mapped to the current class
                          // We can just load the classes list and lookup sections since they are mapped or query sections
                          // Since we fetch classes list, let's load sections dynamically based on class Level.
                          // Wait, we query sections in TanStack! We can use a query mapping here.
                          // But sections query is loaded. Let's make sure it handles sections.
                          // Wait! In StudentsPage we have sections query. We can use a direct mapping using a simple component.
                          // Let's just list select components.
                          // Let's load the class section list. Since they are fetched.
                          // Wait, let's check if the class sections are fetched in class query.
                          // No, sections query is fetched under query key 'promoteSections'!
                          // Let's use promoteSections array as the source since it fetches sections for any ClassId!
                          // So we can set promoteClassId to student.currentEnrollment.gradeLevelId on mount!
                        null
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Wait! Let's build a simple custom selector for sections. 
                    Actually, we can load the sections via classesApi.listSections(currentEnrollment.gradeLevelId) using a simple inline hook!
                */}
              </CardContent>
            </Card>
          )}

          {/* Dynamic Sections selector for section transfer */}
          <SectionTransferPanel
            enrollmentId={student.currentEnrollment?.id}
            gradeLevelId={student.currentEnrollment?.gradeLevelId}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['studentProfile', id] })}
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
          />

          {/* Class Change Dialog panel */}
          <ClassPromotionPanel
            studentId={student.id}
            years={years || []}
            classes={classes || []}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['studentProfile', id] })}
            isOpen={isClassChangeOpen}
            onClose={() => setIsClassChangeOpen(false)}
          />

          {/* Enrollment History List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Enrollment History Registry</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Lifecycle status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-semibold">{e.academicYear.name} {e.isCurrent && '(Current)'}</TableCell>
                      <TableCell>{e.gradeLevel.name}</TableCell>
                      <TableCell>{e.section.name}</TableCell>
                      <TableCell>{e.rollNumber || '—'}</TableCell>
                      <TableCell>{formatDate(e.enrollmentDate)}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{e.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: GUARDIANS */}
      {activeTab === 'guardians' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsLinkGuardianOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Link Guardian
            </Button>
          </div>

          {/* Link Guardian Dialog Panel */}
          <LinkGuardianPanel
            studentId={student.id}
            isOpen={isLinkGuardianOpen}
            onClose={() => setIsLinkGuardianOpen(false)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['studentProfile', id] })}
          />

          {/* List Guardians mapped */}
          <div className="grid gap-4 md:grid-cols-2">
            {student.guardians.map((g) => (
              <Card key={g.id} className="border-border">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">
                      {g.guardian.firstName} {g.guardian.lastName}
                    </CardTitle>
                    <CardDescription>{g.relationship}</CardDescription>
                  </div>
                  <ConfirmDialog
                    title="Unlink Guardian"
                    description={`Are you sure you want to unlink guardian '${g.guardian.firstName} ${g.guardian.lastName}' from this student profile?`}
                    confirmLabel="Unlink"
                    variant="destructive"
                    onConfirm={() => unlinkGuardianMutation.mutate(g.id)}
                    isLoading={unlinkGuardianMutation.isPending}
                    trigger={
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Unlink Guardian">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <p><span className="text-muted-foreground">Phone:</span> <strong>{g.guardian.phone}</strong></p>
                  <p><span className="text-muted-foreground">Email:</span> <span>{g.guardian.email || '—'}</span></p>
                  <p><span className="text-muted-foreground">Occupation:</span> <span>{g.guardian.occupation || '—'}</span></p>
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {g.isPrimary && <Badge variant="success" className="text-[10px]">Primary Contact</Badge>}
                    {g.isEmergencyContact && <Badge variant="outline" className="text-[10px]">Emergency Contact</Badge>}
                    {g.isAuthorizedPickup && <Badge variant="outline" className="text-[10px]">Authorized Pickup</Badge>}
                    {g.receivesAcademicUpdates && <Badge variant="secondary" className="text-[10px]">Academic updates</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENTS: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsDocOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Document Metadata
            </Button>
          </div>

          {/* Add Doc Dialog Panel */}
          {isDocOpen && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Add Document Metadata</CardTitle>
                <CardDescription>Enter file references or certificate metadata details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                        <SelectItem value="TRANSFER_CERTIFICATE">Transfer Certificate</SelectItem>
                        <SelectItem value="PREVIOUS_MARKS_MEMO">Previous Marks Memo</SelectItem>
                        <SelectItem value="IDENTITY_DOCUMENT">Identity Document</SelectItem>
                        <SelectItem value="MEDICAL_DOCUMENT">Medical Document</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Title *</Label>
                    <Input
                      placeholder="e.g. Birth Certificate Copy"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reference Link / URL (Optional)</Label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => setIsDocOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => addDocMutation.mutate({ documentType: docType, title: docTitle, fileUrl: docUrl })} disabled={addDocMutation.isPending || !docTitle}>
                  Save Document
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* List documents */}
          {student.documents.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground italic text-center py-6">No document references stored.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {student.documents.map((d) => (
                <Card key={d.id} className="border-border">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <FileText className="h-8 w-8 text-primary shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{d.documentType}</p>
                      {d.fileUrl && (
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline block mt-2 font-medium truncate"
                        >
                          View Document Link
                        </a>
                      )}
                    </div>
                    <ConfirmDialog
                      title="Delete Document Reference"
                      description={`Are you sure you want to archive this reference to '${d.title}'?`}
                      confirmLabel="Delete"
                      variant="destructive"
                      onConfirm={() => archiveDocMutation.mutate(d.id)}
                      isLoading={archiveDocMutation.isPending}
                      trigger={
                        <Button variant="ghost" size="icon" className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* HELPER COMPONENTS */

// Section Transfer helper
function SectionTransferPanel({ enrollmentId, gradeLevelId, onSuccess, isOpen, onClose }: any) {
  const [targetId, setTargetId] = React.useState('');
  const { data: sections } = useQuery({
    queryKey: ['sections', gradeLevelId],
    queryFn: () => classesApi.listSections(gradeLevelId),
    enabled: !!gradeLevelId && isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => studentsApi.transferSection(enrollmentId, data),
    onSuccess: () => {
      onSuccess();
      toast.success('Section transferred');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Transfer failed');
    },
  });

  if (!isOpen) return null;

  return (
    <Card className="border-border p-4 bg-muted/10">
      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1 max-w-[240px]">
          <Label>Target Section Standard</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Section" />
            </SelectTrigger>
            <SelectContent>
              {sections?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => mutation.mutate({ targetSectionId: targetId })} disabled={mutation.isPending || !targetId}>
          Confirm Transfer
        </Button>
      </div>
    </Card>
  );
}

// Class Promotion helper
function ClassPromotionPanel({ studentId, years, classes, onSuccess, isOpen, onClose }: any) {
  const [yearId, setYearId] = React.useState('');
  const [classId, setClassId] = React.useState('');
  const [sectionId, setSectionId] = React.useState('');
  const [roll, setRoll] = React.useState('');

  const { data: sections } = useQuery({
    queryKey: ['promoteSections', classId],
    queryFn: () => classesApi.listSections(classId || undefined),
    enabled: !!classId && isOpen,
  });

  React.useEffect(() => {
    if (sections && sections.length > 0) {
      setSectionId(sections[0].id);
    } else {
      setSectionId('');
    }
  }, [sections]);

  const mutation = useMutation({
    mutationFn: (data: any) => studentsApi.changeClass(studentId, data),
    onSuccess: () => {
      onSuccess();
      toast.success('Student re-enrolled/promoted');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Re-enrollment failed');
    },
  });

  if (!isOpen) return null;

  return (
    <Card className="border-border p-4 bg-muted/10 space-y-4">
      <h4 className="font-bold text-sm">Enroll in New Class Standard</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Target Session</Label>
          <Select value={yearId} onValueChange={setYearId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Session" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y: any) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name} {y.isCurrent && '(Active)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Class Level</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Section Standard</Label>
          <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Section" />
            </SelectTrigger>
            <SelectContent>
              {sections?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-1.5 max-w-[200px]">
          <Label>Roll Number (Optional)</Label>
          <Input placeholder="e.g. 15" value={roll} onChange={(e) => setRoll(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => mutation.mutate({ academicYearId: yearId, gradeLevelId: classId, sectionId, rollNumber: roll })} disabled={mutation.isPending || !yearId || !classId || !sectionId}>
            Confirm Re-Enrollment
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Link Guardian helper
function LinkGuardianPanel({ studentId, isOpen, onClose, onSuccess }: any) {
  const [search, setSearch] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [rel, setRel] = React.useState('Father');
  const [primary, setPrimary] = React.useState(false);

  const searchMutation = useMutation({
    mutationFn: (q: string) => guardiansApi.list({ search: q, page: 1, limit: 5 }),
    onSuccess: (res) => {
      setResults(res.data);
    },
  });

  const linkMutation = useMutation({
    mutationFn: (data: any) => studentsApi.linkGuardian(studentId, data),
    onSuccess: () => {
      onSuccess();
      toast.success('Guardian linked successfully');
      onClose();
      setSearch('');
      setResults([]);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Link failed');
    },
  });

  if (!isOpen) return null;

  return (
    <Card className="border-border p-4 bg-muted/10 space-y-4">
      <h4 className="font-bold text-sm">Link Sibling / Guardian profile</h4>
      <div className="flex gap-2">
        <Input placeholder="Search phone, email or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="button" size="sm" onClick={() => searchMutation.mutate(search)}>Search</Button>
      </div>

      {results.length > 0 && (
        <div className="border rounded divide-y max-h-[140px] overflow-y-auto bg-card">
          {results.map((g) => (
            <div key={g.id} className="p-2 flex items-center justify-between text-xs sm:text-sm">
              <span>{g.firstName} {g.lastName} ({g.phone})</span>
              <div className="flex gap-2 items-center">
                <Select value={rel} onValueChange={setRel}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Legal Guardian">Guardian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <input type="checkbox" id={`chk_${g.id}`} checked={primary} onChange={(e) => setPrimary(e.target.checked)} />
                  <Label htmlFor={`chk_${g.id}`} className="text-[10px]">Primary</Label>
                </div>
                <Button size="sm" className="h-7 text-xs" onClick={() => linkMutation.mutate({ guardianId: g.id, relationship: rel, isPrimary: primary })} disabled={linkMutation.isPending}>
                  Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
      </div>
    </Card>
  );
}
