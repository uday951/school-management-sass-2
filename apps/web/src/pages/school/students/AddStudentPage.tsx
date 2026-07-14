import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { guardiansApi, type Guardian } from '@/api/guardians';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  Calendar,
  Building,
  Layers,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

// Guided steps list
const STEPS = [
  'Personal Info',
  'Admission Info',
  'Enrollment standard',
  'Guardians',
  'Addresses',
  'Emergency & Sensitive',
  'Review',
];

const studentFormSchema = z.object({
  // Step 1: Personal
  firstName: z.string().min(2, 'First Name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name is required'),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.string().min(1, 'Gender selection is required'),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional().default('Indian'),
  motherTongue: z.string().optional(),
  personalEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  personalPhone: z.string().optional(),

  // Step 2: Admission
  admissionNumber: z.string().min(2, 'Admission Number is required'),
  admissionDate: z.string().min(1, 'Admission Date is required'),
  joiningType: z.string().optional().default('NEW'),
  previousSchoolName: z.string().optional(),
  previousClassName: z.string().optional(),

  // Step 3: Enrollment
  enrollment: z.object({
    academicYearId: z.string().min(1, 'Academic Session is required'),
    gradeLevelId: z.string().min(1, 'Class Standard is required'),
    sectionId: z.string().min(1, 'Section selection is required'),
    rollNumber: z.string().optional(),
  }),

  // Step 4: Guardians (we handle list separately in state)
  
  // Step 5: Address
  currentAddressLine1: z.string().min(5, 'Current address is required'),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1, 'City is required'),
  currentState: z.string().min(1, 'State is required'),
  currentCountry: z.string().min(1, 'Country is required').default('India'),
  currentPostalCode: z.string().min(4, 'Postal code is required'),
  
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().default(true),

  // Step 6: Emergency
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  specialAssistanceNotes: z.string().optional(),
});

type FormValues = z.infer<typeof studentFormSchema>;

export default function AddStudentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState(0);

  // State for mapped guardians (handled dynamically outside standard hook form schema)
  const [linkedGuardians, setLinkedGuardians] = React.useState<any[]>([]);
  const [guardianSearch, setGuardianSearch] = React.useState('');
  const [guardianSearchResults, setGuardianSearchResults] = React.useState<Guardian[]>([]);
  const [showNewGuardianForm, setShowNewGuardianForm] = React.useState(false);

  // Dynamic state for new guardian inputs
  const [newGuardian, setNewGuardian] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    occupation: '',
    employer: '',
    relationship: 'Father',
    isPrimary: true,
    isEmergencyContact: true,
    isAuthorizedPickup: true,
    receivesAcademicUpdates: true,
    receivesAttendanceUpdates: true,
    receivesFeeUpdates: true,
    hasPortalAccess: false,
  });

  // Queries
  const { data: years } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      sameAsCurrentAddress: true,
      nationality: 'Indian',
      joiningType: 'NEW',
      currentCountry: 'India',
      permanentCountry: 'India',
    },
  });

  const values = watch();

  // Load sections based on class standard selection
  const { data: sections } = useQuery({
    queryKey: ['sections', values.enrollment?.gradeLevelId],
    queryFn: () => classesApi.listSections(values.enrollment?.gradeLevelId),
    enabled: !!values.enrollment?.gradeLevelId,
  });

  // Set default academic year
  React.useEffect(() => {
    if (years && years.length > 0 && !values.enrollment?.academicYearId) {
      const current = years.find((y) => y.isCurrent);
      setValue('enrollment.academicYearId', current ? current.id : years[0].id);
    }
  }, [years, values.enrollment?.academicYearId, setValue]);

  // Set default class & section
  React.useEffect(() => {
    if (classes && classes.length > 0 && !values.enrollment?.gradeLevelId) {
      setValue('enrollment.gradeLevelId', classes[0].id);
    }
  }, [classes, values.enrollment?.gradeLevelId, setValue]);

  React.useEffect(() => {
    if (sections && sections.length > 0 && !values.enrollment?.sectionId) {
      setValue('enrollment.sectionId', sections[0].id);
    }
  }, [sections, values.enrollment?.sectionId, setValue]);

  // Create Student Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolDashboard'] });
      toast.success('Student enrolled and registered successfully');
      navigate('/school/students');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to onboard student');
    },
  });

  const handleNext = async () => {
    // Validate current step fields before progressing
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['admissionNumber', 'admissionDate'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['enrollment.academicYearId', 'enrollment.gradeLevelId', 'enrollment.sectionId'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['currentAddressLine1', 'currentCity', 'currentState', 'currentPostalCode'];
      if (!values.sameAsCurrentAddress) {
        fieldsToValidate.push('permanentAddressLine1', 'permanentCity', 'permanentState', 'permanentPostalCode');
      }
    }

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;
    if (!isValid) return;

    if (currentStep === 3 && linkedGuardians.length === 0) {
      toast.error('Please assign or link at least one guardian profile.');
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Guardian Search implementation (siblings lookup)
  const executeGuardianSearch = async () => {
    if (!guardianSearch.trim()) return;
    try {
      const res = await guardiansApi.list({ search: guardianSearch, page: 1, limit: 5 });
      setGuardianSearchResults(res.data);
    } catch {
      toast.error('Search failed');
    }
  };

  const linkExistingGuardian = (guardian: Guardian) => {
    // Check if already linked
    if (linkedGuardians.some((g) => g.guardianId === guardian.id)) {
      toast.warning('Guardian is already linked');
      return;
    }

    setLinkedGuardians((prev) => [
      ...prev,
      {
        guardianId: guardian.id,
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        phone: guardian.phone,
        relationship: 'Father',
        isPrimary: linkedGuardians.length === 0,
        isEmergencyContact: true,
        isAuthorizedPickup: true,
        receivesAcademicUpdates: true,
        receivesAttendanceUpdates: true,
        receivesFeeUpdates: true,
        hasPortalAccess: false,
      },
    ]);
    toast.success(`Linked existing guardian: ${guardian.firstName} ${guardian.lastName}`);
  };

  const removeLinkedGuardian = (index: number) => {
    setLinkedGuardians((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewGuardian = () => {
    if (!newGuardian.firstName || !newGuardian.lastName || !newGuardian.phone) {
      toast.error('Guardian first name, last name, and phone are required');
      return;
    }

    setLinkedGuardians((prev) => [
      ...prev,
      {
        ...newGuardian,
        isPrimary: linkedGuardians.length === 0 ? true : newGuardian.isPrimary,
      },
    ]);

    // Reset new guardian inputs
    setNewGuardian({
      firstName: '',
      lastName: '',
      phone: '',
      alternatePhone: '',
      email: '',
      occupation: '',
      employer: '',
      relationship: 'Father',
      isPrimary: false,
      isEmergencyContact: true,
      isAuthorizedPickup: true,
      receivesAcademicUpdates: true,
      receivesAttendanceUpdates: true,
      receivesFeeUpdates: true,
      hasPortalAccess: false,
    });
    setShowNewGuardianForm(false);
  };

  const onSubmit = (formVal: FormValues) => {
    if (linkedGuardians.length === 0) {
      toast.error('Please assign or link at least one guardian');
      return;
    }

    // Structure final payload
    const payload = {
      ...formVal,
      guardians: linkedGuardians,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/school/students')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard Student</h1>
          <p className="text-sm text-muted-foreground">Register student profile, academic enrollment, and linked guardians.</p>
        </div>
      </div>

      {/* Guided steps indicator */}
      <div className="flex items-center justify-between border-b pb-4 overflow-x-auto whitespace-nowrap gap-4">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                idx === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : idx < currentStep
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentStep ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
            </span>
            <span className={`text-xs font-semibold ${idx === currentStep ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
              {step}
            </span>
            {idx < STEPS.length - 1 && <span className="text-muted-foreground text-[10px]">—</span>}
          </div>
        ))}
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            {/* STEP 1: PERSONAL INFO */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Student Personal Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...register('middleName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                    {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={values.gender || ''} onValueChange={(val) => setValue('gender', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" placeholder="e.g. O+" {...register('bloodGroup')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" {...register('nationality')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherTongue">Mother Tongue</Label>
                    <Input id="motherTongue" placeholder="e.g. Hindi" {...register('motherTongue')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalPhone">Student Phone (Optional)</Label>
                    <Input id="personalPhone" {...register('personalPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Student Email (Optional)</Label>
                    <Input id="personalEmail" type="email" {...register('personalEmail')} />
                    {errors.personalEmail && <p className="text-xs text-destructive">{errors.personalEmail.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADMISSION INFO */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Admission Registers</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionNumber">Admission Number *</Label>
                    <Input id="admissionNumber" placeholder="e.g. ADM2026001" {...register('admissionNumber')} />
                    {errors.admissionNumber && <p className="text-xs text-destructive">{errors.admissionNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date *</Label>
                    <Input id="admissionDate" type="date" {...register('admissionDate')} />
                    {errors.admissionDate && <p className="text-xs text-destructive">{errors.admissionDate.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Joining Type</Label>
                    <Select value={values.joiningType || 'NEW'} onValueChange={(val) => setValue('joiningType', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New Admission</SelectItem>
                        <SelectItem value="TRANSFER">Transfer Admission</SelectItem>
                        <SelectItem value="RE_ADMISSION">Re-Admission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousSchoolName">Previous School Name</Label>
                    <Input id="previousSchoolName" placeholder="e.g. St. Xaviers" {...register('previousSchoolName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousClassName">Previous Class Grade</Label>
                    <Input id="previousClassName" placeholder="e.g. Class 9" {...register('previousClassName')} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ENROLLMENT */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Academic Session Enrollment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Session *</Label>
                    <Select
                      value={values.enrollment?.academicYearId || ''}
                      onValueChange={(val) => setValue('enrollment.academicYearId', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Session" />
                      </SelectTrigger>
                      <SelectContent>
                        {years?.map((y) => (
                          <SelectItem key={y.id} value={y.id}>
                            {y.name} {y.isCurrent && '(Active)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Class / Grade Standard *</Label>
                    <Select
                      value={values.enrollment?.gradeLevelId || ''}
                      onValueChange={(val) => {
                        setValue('enrollment.gradeLevelId', val);
                        setValue('enrollment.sectionId', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Class Section Room *</Label>
                    <Select
                      value={values.enrollment?.sectionId || ''}
                      onValueChange={(val) => setValue('enrollment.sectionId', val)}
                      disabled={!values.enrollment?.gradeLevelId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.capacity ? `${s.capacity} Limit` : 'No Limit'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 max-w-[200px]">
                  <Label htmlFor="rollNumber">Roll Number (Optional)</Label>
                  <Input id="rollNumber" placeholder="e.g. 15" {...register('enrollment.rollNumber')} />
                </div>
              </div>
            )}

            {/* STEP 4: GUARDIANS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">Assign Guardians</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowNewGuardianForm(!showNewGuardianForm)}>
                    {showNewGuardianForm ? 'Cancel' : 'Add New Guardian Profile'}
                  </Button>
                </div>

                {/* Search existing (siblings lookup) */}
                {!showNewGuardianForm && (
                  <Card className="bg-muted/10 border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Search Existing Guardian (Sibling Connect)</CardTitle>
                      <CardDescription>Look up by name, phone or email to reuse profiles without duplicating records.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search phone, email, or name..."
                          value={guardianSearch}
                          onChange={(e) => setGuardianSearch(e.target.value)}
                        />
                        <Button type="button" onClick={executeGuardianSearch} variant="secondary" className="gap-1.5">
                          <Search className="h-4 w-4" /> Search
                        </Button>
                      </div>

                      {guardianSearchResults.length > 0 && (
                        <div className="border rounded divide-y max-h-[150px] overflow-y-auto bg-card">
                          {guardianSearchResults.map((g) => (
                            <div key={g.id} className="p-2.5 flex items-center justify-between text-xs sm:text-sm">
                              <div>
                                <span className="font-semibold text-foreground">{g.firstName} {g.lastName}</span>
                                <span className="text-muted-foreground ml-3 font-mono text-xs">{g.phone}</span>
                              </div>
                              <Button type="button" size="sm" variant="ghost" onClick={() => linkExistingGuardian(g)}>
                                Link Sibling
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* New Guardian Form */}
                {showNewGuardianForm && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">Create & Link New Guardian</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name *</Label>
                          <Input
                            value={newGuardian.firstName}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name *</Label>
                          <Input
                            value={newGuardian.lastName}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Primary Phone *</Label>
                          <Input
                            value={newGuardian.phone}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={newGuardian.email}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Relationship *</Label>
                          <Select
                            value={newGuardian.relationship}
                            onValueChange={(val) => setNewGuardian((prev) => ({ ...prev, relationship: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Father">Father</SelectItem>
                              <SelectItem value="Mother">Mother</SelectItem>
                              <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                              <SelectItem value="Grandparent">Grandparent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Relative">Relative</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Occupation</Label>
                          <Input
                            value={newGuardian.occupation}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, occupation: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="new_isPrimary"
                            className="rounded h-4 w-4"
                            checked={newGuardian.isPrimary}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                          />
                          <Label htmlFor="new_isPrimary" className="text-xs">Primary Contact</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="new_isEmergency"
                            className="rounded h-4 w-4"
                            checked={newGuardian.isEmergencyContact}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, isEmergencyContact: e.target.checked }))}
                          />
                          <Label htmlFor="new_isEmergency" className="text-xs">Emergency contact</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="new_pickup"
                            className="rounded h-4 w-4"
                            checked={newGuardian.isAuthorizedPickup}
                            onChange={(e) => setNewGuardian((prev) => ({ ...prev, isAuthorizedPickup: e.target.checked }))}
                          />
                          <Label htmlFor="new_pickup" className="text-xs">Authorized Pickup</Label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowNewGuardianForm(false)}>Cancel</Button>
                      <Button type="button" size="sm" onClick={handleAddNewGuardian}>Add Guardian</Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Linked Guardians list */}
                <div className="space-y-3">
                  <Label className="font-bold">Assigned Guardians ({linkedGuardians.length})</Label>
                  {linkedGuardians.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No guardians linked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedGuardians.map((g, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 text-xs sm:text-sm">
                          <div>
                            <span className="font-bold text-foreground">{g.firstName} {g.lastName}</span>
                            <span className="text-muted-foreground ml-2">({g.relationship})</span>
                            <span className="text-muted-foreground ml-3 font-mono">{g.phone}</span>
                            <div className="flex gap-2 mt-1">
                              {g.isPrimary && <Badge variant="success" className="text-[9px] py-0">Primary</Badge>}
                              {g.isEmergencyContact && <Badge variant="outline" className="text-[9px] py-0">Emergency</Badge>}
                              {g.isAuthorizedPickup && <Badge variant="outline" className="text-[9px] py-0">Pickup</Badge>}
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="hover:text-destructive" onClick={() => removeLinkedGuardian(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: ADDRESSES */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Current Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentAddressLine1">Address Line 1 *</Label>
                    <Input id="currentAddressLine1" {...register('currentAddressLine1')} />
                    {errors.currentAddressLine1 && <p className="text-xs text-destructive">{errors.currentAddressLine1.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAddressLine2">Address Line 2 (Optional)</Label>
                    <Input id="currentAddressLine2" {...register('currentAddressLine2')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentCity">City *</Label>
                      <Input id="currentCity" {...register('currentCity')} />
                      {errors.currentCity && <p className="text-xs text-destructive">{errors.currentCity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentState">State *</Label>
                      <Input id="currentState" {...register('currentState')} />
                      {errors.currentState && <p className="text-xs text-destructive">{errors.currentState.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPostalCode">Postal Code / PIN *</Label>
                      <Input id="currentPostalCode" {...register('currentPostalCode')} />
                      {errors.currentPostalCode && <p className="text-xs text-destructive">{errors.currentPostalCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentCountry">Country</Label>
                      <Input id="currentCountry" {...register('currentCountry')} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sameAsCurrentAddress"
                      className="rounded border-border bg-background h-4 w-4"
                      checked={values.sameAsCurrentAddress}
                      onChange={(e) => setValue('sameAsCurrentAddress', e.target.checked)}
                    />
                    <Label htmlFor="sameAsCurrentAddress" className="font-semibold cursor-pointer">
                      Permanent Address is same as Current Address
                    </Label>
                  </div>

                  {!values.sameAsCurrentAddress && (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="text-lg font-semibold border-b pb-2">Permanent Address</h3>
                      <div className="space-y-2">
                        <Label htmlFor="permanentAddressLine1">Address Line 1 *</Label>
                        <Input id="permanentAddressLine1" {...register('permanentAddressLine1')} />
                        {errors.permanentAddressLine1 && <p className="text-xs text-destructive">{errors.permanentAddressLine1.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permanentAddressLine2">Address Line 2 (Optional)</Label>
                        <Input id="permanentAddressLine2" {...register('permanentAddressLine2')} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="permanentCity">City *</Label>
                          <Input id="permanentCity" {...register('permanentCity')} />
                          {errors.permanentCity && <p className="text-xs text-destructive">{errors.permanentCity.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permanentState">State *</Label>
                          <Input id="permanentState" {...register('permanentState')} />
                          {errors.permanentState && <p className="text-xs text-destructive">{errors.permanentState.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="permanentPostalCode">Postal Code / PIN *</Label>
                          <Input id="permanentPostalCode" {...register('permanentPostalCode')} />
                          {errors.permanentPostalCode && <p className="text-xs text-destructive">{errors.permanentPostalCode.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permanentCountry">Country</Label>
                          <Input id="permanentCountry" {...register('permanentCountry')} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: EMERGENCY / SENSITIVE INFO */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact & Sensitive Info</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input id="emergencyContactName" {...register('emergencyContactName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input id="emergencyContactRelationship" placeholder="e.g. Uncle" {...register('emergencyContactRelationship')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Phone</Label>
                    <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="allergies">Allergies / Medical Warnings</Label>
                  <Input id="allergies" placeholder="e.g. Peanut allergy, asthma" {...register('allergies')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Sensitive Medical Conditions (Optional)</Label>
                  <textarea
                    id="medicalNotes"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter sensitive health info..."
                    {...register('medicalNotes')}
                  />
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Confirm Enrollment Details</h3>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2 border-r pr-6">
                    <h4 className="font-bold text-muted-foreground uppercase text-xs">Student Profile</h4>
                    <p><span className="text-muted-foreground">Full Name:</span> <strong className="text-foreground">{values.firstName} {values.lastName}</strong></p>
                    <p><span className="text-muted-foreground">Date of Birth:</span> <span>{values.dateOfBirth}</span></p>
                    <p><span className="text-muted-foreground">Gender:</span> <span>{values.gender}</span></p>
                    <p><span className="text-muted-foreground">Admission Number:</span> <span className="font-mono text-xs">{values.admissionNumber}</span></p>
                    <p><span className="text-muted-foreground">Admission Date:</span> <span>{values.admissionDate}</span></p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-muted-foreground uppercase text-xs">Initial Enrollment</h4>
                    <p><span className="text-muted-foreground">Academic Year:</span> <span>{years?.find(y => y.id === values.enrollment.academicYearId)?.name || '—'}</span></p>
                    <p><span className="text-muted-foreground">Class Standard:</span> <span>{classes?.find(c => c.id === values.enrollment.gradeLevelId)?.name || '—'}</span></p>
                    <p><span className="text-muted-foreground">Section:</span> <span>{sections?.find(s => s.id === values.enrollment.sectionId)?.name || '—'}</span></p>
                    <p><span className="text-muted-foreground">Roll Number:</span> <span>{values.enrollment.rollNumber || 'Not assigned'}</span></p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-bold text-muted-foreground uppercase text-xs">Linked Guardians ({linkedGuardians.length})</h4>
                  <div className="divide-y divide-border">
                    {linkedGuardians.map((g, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                        <span>{g.firstName} {g.lastName} ({g.relationship})</span>
                        <div className="flex gap-1">
                          {g.isPrimary && <Badge variant="success">Primary</Badge>}
                          {g.isEmergencyContact && <Badge variant="outline">Emergency</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {createMutation.isError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                    {createMutation.error?.response?.data?.message || 'Error occurred during enrollment. Please try again.'}
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Enrolling Student...' : 'Confirm & Register'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
