import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '@/api/employees';
import { departmentsApi } from '@/api/departments';
import { rolesApi } from '@/api/roles';
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
  Users,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  'Personal',
  'Employment',
  'Contacts & Address',
  'Emergency',
  'Qualifications',
  'Experience',
  'Account Access',
  'Review',
];

const employeeFormSchema = z.object({
  // Step 1: Personal
  firstName: z.string().min(2, 'First Name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name is required'),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  personalEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  personalPhone: z.string().optional(),

  // Step 2: Employment
  employeeType: z.string().min(1, 'Employee type category is required'),
  employmentType: z.string().min(1, 'Employment type mode is required'),
  designation: z.string().min(1, 'Designation is required'),
  primaryDepartmentId: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  confirmationDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  reportingManagerEmployeeId: z.string().optional(),

  // Step 3: Contact & Address
  workEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  workPhone: z.string().optional(),
  currentAddressLine1: z.string().optional(),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().optional(),
  currentState: z.string().optional(),
  currentCountry: z.string().optional().default('India'),
  currentPostalCode: z.string().optional(),
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional().default('India'),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().default(true),

  // Step 4: Emergency
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),

  // Step 7: Account access settings
  createLoginAccount: z.boolean().default(false),
  loginEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  schoolRoleId: z.string().optional(),
  temporaryPassword: z.string().optional(),
});

type FormValues = z.infer<typeof employeeFormSchema>;

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState(0);

  // Qualifications and experience arrays managed in local state
  const [qualifications, setQualifications] = React.useState<any[]>([]);
  const [newQual, setNewQual] = React.useState({
    qualificationName: '',
    specialization: '',
    institution: '',
    universityOrBoard: '',
    startYear: '',
    completionYear: '',
    gradeOrPercentage: '',
  });

  const [experiences, setExperiences] = React.useState<any[]>([]);
  const [newExp, setNewExp] = React.useState({
    organizationName: '',
    designation: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  // Queries
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      sameAsCurrentAddress: true,
      currentCountry: 'India',
      permanentCountry: 'India',
      createLoginAccount: false,
      employeeType: 'TEACHING',
      employmentType: 'FULL_TIME',
    },
  });

  const values = watch();

  const createMutation = useMutation({
    mutationFn: (data: any) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee record onboarded successfully');
      navigate('/school/employees');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to onboarding employee profile');
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['firstName', 'lastName'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['employeeType', 'employmentType', 'designation', 'joiningDate'];
    } else if (currentStep === 6 && values.createLoginAccount) {
      fieldsToValidate = ['loginEmail', 'schoolRoleId', 'temporaryPassword'];
    }

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;
    if (!isValid) return;

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addQual = () => {
    if (!newQual.qualificationName || !newQual.institution) {
      toast.error('Qualification Name and Institution are required');
      return;
    }
    setQualifications((prev) => [...prev, {
      ...newQual,
      startYear: newQual.startYear ? Number(newQual.startYear) : null,
      completionYear: newQual.completionYear ? Number(newQual.completionYear) : null,
    }]);
    setNewQual({
      qualificationName: '',
      specialization: '',
      institution: '',
      universityOrBoard: '',
      startYear: '',
      completionYear: '',
      gradeOrPercentage: '',
    });
  };

  const removeQual = (idx: number) => {
    setQualifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const addExp = () => {
    if (!newExp.organizationName || !newExp.designation || !newExp.startDate) {
      toast.error('Organization Name, Designation and Start Date are required');
      return;
    }
    setExperiences((prev) => [...prev, newExp]);
    setNewExp({
      organizationName: '',
      designation: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
  };

  const removeExp = (idx: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = (formVal: FormValues) => {
    // Structure payload with qualifications and experience logs
    const payload = {
      ...formVal,
      qualifications,
      experiences,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/school/employees')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard Employee</h1>
          <p className="text-sm text-muted-foreground">Register teaching or non-teaching employee profiles with qualification logs.</p>
        </div>
      </div>

      {/* Steps indicator */}
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
            {/* STEP 1: PERSONAL */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
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
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={values.gender || ''} onValueChange={(val) => setValue('gender', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" placeholder="e.g. AB+" {...register('bloodGroup')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalPhone">Personal Phone</Label>
                    <Input id="personalPhone" {...register('personalPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <Input id="personalEmail" type="email" {...register('personalEmail')} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLOYMENT */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Category *</Label>
                    <Select value={values.employeeType} onValueChange={(val) => setValue('employeeType', val as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEACHING">Teaching Faculty</SelectItem>
                        <SelectItem value="ADMINISTRATIVE">Administrative Staff</SelectItem>
                        <SelectItem value="SUPPORT">Support Staff</SelectItem>
                        <SelectItem value="MANAGEMENT">School Management</SelectItem>
                        <SelectItem value="OTHER">Other Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Mode *</Label>
                    <Select value={values.employmentType} onValueChange={(val) => setValue('employmentType', val as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract Basis</SelectItem>
                        <SelectItem value="TEMPORARY">Temporary Staff</SelectItem>
                        <SelectItem value="INTERN">Internship</SelectItem>
                        <SelectItem value="VISITING">Visiting Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="designation">Designation / Role Title *</Label>
                    <Input id="designation" placeholder="e.g. Mathematics Teacher" {...register('designation')} />
                    {errors.designation && <p className="text-xs text-destructive">{errors.designation.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Department</Label>
                    <Select value={values.primaryDepartmentId || ''} onValueChange={(val) => setValue('primaryDepartmentId', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date *</Label>
                    <Input id="joiningDate" type="date" {...register('joiningDate')} />
                    {errors.joiningDate && <p className="text-xs text-destructive">{errors.joiningDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmationDate">Confirmation Date</Label>
                    <Input id="confirmationDate" type="date" {...register('confirmationDate')} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACTS & ADDRESS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Work Contacts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workEmail">Work Email</Label>
                      <Input id="workEmail" type="email" placeholder="e.g. employee@school.com" {...register('workEmail')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workPhone">Work Phone</Label>
                      <Input id="workPhone" {...register('workPhone')} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Current Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentAddressLine1">Address Line 1</Label>
                    <Input id="currentAddressLine1" {...register('currentAddressLine1')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentCity">City</Label>
                      <Input id="currentCity" {...register('currentCity')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentState">State</Label>
                      <Input id="currentState" {...register('currentState')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPostalCode">Postal Code</Label>
                      <Input id="currentPostalCode" {...register('currentPostalCode')} />
                    </div>
                    <div className="space-y-2 flex items-end pb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sameAsCurrentAddress"
                          className="rounded border-border bg-background h-4 w-4"
                          checked={values.sameAsCurrentAddress}
                          onChange={(e) => setValue('sameAsCurrentAddress', e.target.checked)}
                        />
                        <Label htmlFor="sameAsCurrentAddress" className="font-semibold cursor-pointer text-xs">
                          Permanent Address same as current
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {!values.sameAsCurrentAddress && (
                  <div className="space-y-4 pt-4 border-t animate-fade-in">
                    <h3 className="text-lg font-semibold">Permanent Address</h3>
                    <div className="space-y-2">
                      <Label htmlFor="permanentAddressLine1">Address Line 1</Label>
                      <Input id="permanentAddressLine1" {...register('permanentAddressLine1')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="permanentCity">City</Label>
                        <Input id="permanentCity" {...register('permanentCity')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permanentState">State</Label>
                        <Input id="permanentState" {...register('permanentState')} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: EMERGENCY */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input id="emergencyContactName" {...register('emergencyContactName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input id="emergencyContactRelationship" placeholder="e.g. Spouse" {...register('emergencyContactRelationship')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                    <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Special Instructions</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('notes')}
                  />
                </div>
              </div>
            )}

            {/* STEP 5: QUALIFICATIONS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Academic Qualifications</h3>
                
                <div className="grid grid-cols-3 gap-4 bg-muted/10 p-4 border rounded-lg">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Degree / Certificate Name</Label>
                    <Input
                      placeholder="e.g. Master of Science (Physics)"
                      value={newQual.qualificationName}
                      onChange={(e) => setNewQual((prev) => ({ ...prev, qualificationName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Specialization</Label>
                    <Input
                      placeholder="e.g. Astrophysics"
                      value={newQual.specialization}
                      onChange={(e) => setNewQual((prev) => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>College / Institution</Label>
                    <Input
                      placeholder="e.g. Delhi University"
                      value={newQual.institution}
                      onChange={(e) => setNewQual((prev) => ({ ...prev, institution: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Completion Year</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2018"
                      value={newQual.completionYear}
                      onChange={(e) => setNewQual((prev) => ({ ...prev, completionYear: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <Button type="button" onClick={addQual} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Add Qualification
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-bold">Added Qualifications ({qualifications.length})</Label>
                  {qualifications.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">No qualifications added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {qualifications.map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded bg-muted/20 text-xs sm:text-sm">
                          <div>
                            <span className="font-bold text-foreground">{q.qualificationName}</span>
                            <span className="text-muted-foreground ml-2">from {q.institution} ({q.completionYear})</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="hover:text-destructive" onClick={() => removeQual(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: EXPERIENCE */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Employment History</h3>
                
                <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 border rounded-lg">
                  <div className="space-y-1.5">
                    <Label>Organization Name</Label>
                    <Input
                      placeholder="e.g. Oxford Public School"
                      value={newExp.organizationName}
                      onChange={(e) => setNewExp((prev) => ({ ...prev, organizationName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Designation / Role</Label>
                    <Input
                      placeholder="e.g. Physics PGT Teacher"
                      value={newExp.designation}
                      onChange={(e) => setNewExp((prev) => ({ ...prev, designation: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newExp.startDate}
                      onChange={(e) => setNewExp((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newExp.endDate}
                      onChange={(e) => setNewExp((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button type="button" onClick={addExp} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Add Experience Record
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-bold">Added History Records ({experiences.length})</Label>
                  {experiences.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">No experience records added.</p>
                  ) : (
                    <div className="space-y-2">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded bg-muted/20 text-xs sm:text-sm">
                          <div>
                            <span className="font-bold text-foreground">{exp.designation}</span>
                            <span className="text-muted-foreground ml-2">at {exp.organizationName} ({exp.startDate} - {exp.endDate || 'Present'})</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="hover:text-destructive" onClick={() => removeExp(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: ACCOUNT ACCESS */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Workspace Login Access</h3>
                
                <div className="flex items-center gap-2 pb-3">
                  <input
                    type="checkbox"
                    id="createLoginAccount"
                    className="rounded border-border h-4 w-4 bg-background"
                    checked={values.createLoginAccount}
                    onChange={(e) => setValue('createLoginAccount', e.target.checked)}
                  />
                  <Label htmlFor="createLoginAccount" className="font-semibold cursor-pointer text-sm">
                    Activate Workspace Login Account for this Employee
                  </Label>
                </div>

                {values.createLoginAccount && (
                  <div className="space-y-4 border p-4 rounded-lg bg-card animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="loginEmail">Login Email Address *</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          placeholder="employee@school.com"
                          {...register('loginEmail')}
                        />
                        {errors.loginEmail && <p className="text-xs text-destructive">{errors.loginEmail.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>School Role / Access Permission Level *</Label>
                        <Select value={values.schoolRoleId || ''} onValueChange={(val) => setValue('schoolRoleId', val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles?.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 max-w-[280px]">
                      <Label htmlFor="temporaryPassword">Temporary Password *</Label>
                      <Input
                        id="temporaryPassword"
                        type="password"
                        placeholder="e.g. Temp@2026"
                        {...register('temporaryPassword')}
                      />
                      {errors.temporaryPassword && <p className="text-xs text-destructive">{errors.temporaryPassword.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: REVIEW */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Confirm Employee Profile</h3>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2 border-r pr-6">
                    <h4 className="font-bold text-muted-foreground uppercase text-xs">Employee Bio</h4>
                    <p><span className="text-muted-foreground">Full Name:</span> <strong className="text-foreground">{values.firstName} {values.lastName}</strong></p>
                    <p><span className="text-muted-foreground">Category:</span> <span>{values.employeeType}</span></p>
                    <p><span className="text-muted-foreground">Designation:</span> <strong>{values.designation}</strong></p>
                    <p><span className="text-muted-foreground">Joining Date:</span> <span>{values.joiningDate}</span></p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-muted-foreground uppercase text-xs">Workplace Access</h4>
                    <p><span className="text-muted-foreground">Login Access:</span> <span>{values.createLoginAccount ? 'Enabled' : 'Disabled'}</span></p>
                    {values.createLoginAccount && (
                      <>
                        <p><span className="text-muted-foreground">Login Email:</span> <span>{values.loginEmail}</span></p>
                        <p><span className="text-muted-foreground">Access Role:</span> <span>{roles?.find(r => r.id === values.schoolRoleId)?.name || '—'}</span></p>
                      </>
                    )}
                  </div>
                </div>

                {createMutation.isError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                    {createMutation.error?.response?.data?.message || 'Error occurred during employee creation.'}
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
                {createMutation.isPending ? 'Saving Record...' : 'Confirm & Complete'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
