import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { schoolsApi } from '@/api/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronLeft, Check, Copy, School, AlertCircle } from 'lucide-react';
import { SCHOOL_TYPE_LABELS, BOARD_TYPE_LABELS, type CreateSchoolResponse } from '@/types';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'School Information' },
  { id: 2, title: 'Address Details' },
  { id: 3, title: 'First School Admin' },
  { id: 4, title: 'Review & Confirm' },
];

const schoolSchema = z.object({
  // Step 1
  name: z.string().min(2, 'School name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Code must be 2-20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'School code must be alphanumeric (letters and numbers only)'),
  schoolType: z.enum(['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'COMBINED', 'PRESCHOOL', 'INTERNATIONAL']),
  board: z.enum(['CBSE', 'ICSE', 'STATE', 'IB', 'CAMBRIDGE', 'OTHER']),
  establishedYear: z
    .number({ invalid_type_error: 'Please enter a valid year' })
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  officialEmail: z.string().email('Please enter a valid school official email'),
  officialPhone: z.string().min(10, 'Official phone number must be at least 10 digits'),
  website: z.string().url('Please enter a valid website URL').or(z.literal('')).optional(),

  // Step 2
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  logoUrl: z.string().url('Please enter a valid logo URL').or(z.literal('')).optional(),

  // Step 3
  firstAdmin: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid admin email'),
    phone: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof schoolSchema>;

export default function AddSchoolPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [createdResult, setCreatedResult] = React.useState<CreateSchoolResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      country: 'India',
      website: '',
      logoUrl: '',
      firstAdmin: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
    },
  });

  const stepFields: Record<number, (keyof FormValues | string)[]> = {
    1: ['name', 'code', 'schoolType', 'board', 'establishedYear', 'officialEmail', 'officialPhone', 'website'],
    2: ['addressLine1', 'addressLine2', 'city', 'state', 'country', 'postalCode', 'logoUrl'],
    3: ['firstAdmin.firstName', 'firstAdmin.lastName', 'firstAdmin.email', 'firstAdmin.phone'],
  };

  const nextStep = async () => {
    const fieldsToValidate = stepFields[currentStep];
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        code: data.code.toUpperCase(),
      };
      const response = await schoolsApi.create(formattedData);
      setCreatedResult(response);
      toast.success('School onboarded successfully!');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to onboard school. Please check details.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // If successfully created, show onboarding completion page with credentials
  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-emerald-500/20 bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <Check className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-foreground">Onboarding Complete!</CardTitle>
            <CardDescription>
              School tenant and administration setup has been finalized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <School className="h-4 w-4 text-primary" /> {createdResult.school.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                School Code: <span className="font-mono text-foreground font-semibold">{createdResult.school.code}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Tenant Slug: <span className="font-mono text-foreground">{createdResult.tenant.slug}</span>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">First School Admin Credentials</h3>
              <div className="space-y-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
                  <AlertCircle className="h-4 w-4" /> Important Onboarding Notice
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide these credentials securely to the School Administrator. They will be forced to change this password on their first sign-in. This password is shown once.
                </p>

                <div className="mt-4 space-y-2 font-mono text-sm text-foreground">
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <span>Email: {createdResult.adminUser.email}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdResult.adminUser.email)} className="h-8 w-8 hover:bg-white/10">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <span>Password: {createdResult.adminUser.tempPassword}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdResult.adminUser.tempPassword)} className="h-8 w-8 hover:bg-white/10">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link to="/schools">Back to List</Link>
            </Button>
            <Button asChild>
              <Link to={`/schools/${createdResult.school.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const values = watch();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboard New School</h1>
        <p className="text-sm text-muted-foreground">
          Step-by-step school tenant and primary administrator provisioning.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-lg">
        {STEPS.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={`hidden sm:inline text-xs font-medium ${
                currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
            {step.id < 4 && <ChevronRight className="hidden sm:block h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            {/* STEP 1: School Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">School Name *</Label>
                    <Input id="name" placeholder="e.g. Greenwood High School" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">School Code *</Label>
                    <Input id="code" placeholder="e.g. GHS001" {...register('code')} />
                    {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School Type *</Label>
                    <Select
                      defaultValue={values.schoolType}
                      onValueChange={(val) => setValue('schoolType', val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SCHOOL_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.schoolType && <p className="text-xs text-destructive">{errors.schoolType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Education Board *</Label>
                    <Select
                      defaultValue={values.board}
                      onValueChange={(val) => setValue('board', val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BOARD_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.board && <p className="text-xs text-destructive">{errors.board.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      placeholder="e.g. 2005"
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        setValue('establishedYear', val);
                      }}
                    />
                    {errors.establishedYear && (
                      <p className="text-xs text-destructive">{errors.establishedYear.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input id="website" placeholder="e.g. https://school.com" {...register('website')} />
                    {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officialEmail">Official Email *</Label>
                    <Input id="officialEmail" type="email" placeholder="contact@greenwood.edu" {...register('officialEmail')} />
                    {errors.officialEmail && (
                      <p className="text-xs text-destructive">{errors.officialEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officialPhone">Official Phone *</Label>
                    <Input id="officialPhone" placeholder="e.g. +91 9999988888" {...register('officialPhone')} />
                    {errors.officialPhone && (
                      <p className="text-xs text-destructive">{errors.officialPhone.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input id="addressLine1" placeholder="Building, Street name" {...register('addressLine1')} />
                  {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input id="addressLine2" placeholder="Suite, Landmark, Area (Optional)" {...register('addressLine2')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="City" {...register('city')} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" placeholder="State" {...register('state')} />
                    {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code / PIN *</Label>
                    <Input id="postalCode" placeholder="Postal Code" {...register('postalCode')} />
                    {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" placeholder="Country" {...register('country')} />
                    {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo Image URL (Optional)</Label>
                  <Input id="logoUrl" placeholder="https://image-bucket/logo.png" {...register('logoUrl')} />
                  {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: School Admin */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-muted/40 p-4 rounded-lg border border-border mb-4 text-xs text-muted-foreground">
                  The primary administrator account will be created and mapped specifically to this school tenant context. Platform permissions will be disallowed for safety.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstAdmin.firstName">First Name *</Label>
                    <Input id="firstAdmin.firstName" placeholder="Admin First Name" {...register('firstAdmin.firstName')} />
                    {errors.firstAdmin?.firstName && (
                      <p className="text-xs text-destructive">{errors.firstAdmin.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstAdmin.lastName">Last Name *</Label>
                    <Input id="firstAdmin.lastName" placeholder="Admin Last Name" {...register('firstAdmin.lastName')} />
                    {errors.firstAdmin?.lastName && (
                      <p className="text-xs text-destructive">{errors.firstAdmin.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstAdmin.email">Email Address *</Label>
                    <Input id="firstAdmin.email" type="email" placeholder="admin@school.com" {...register('firstAdmin.email')} />
                    {errors.firstAdmin?.email && (
                      <p className="text-xs text-destructive">{errors.firstAdmin.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstAdmin.phone">Phone (Optional)</Label>
                    <Input id="firstAdmin.phone" placeholder="Phone Number" {...register('firstAdmin.phone')} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground text-sm border-b pb-2 mb-3">School Information</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium text-foreground">{values.name}</dd>

                    <dt className="text-muted-foreground">School Code:</dt>
                    <dd className="font-mono text-foreground">{values.code?.toUpperCase()}</dd>

                    <dt className="text-muted-foreground">Type & Board:</dt>
                    <dd className="text-foreground">
                      {SCHOOL_TYPE_LABELS[values.schoolType]} — {BOARD_TYPE_LABELS[values.board]}
                    </dd>

                    <dt className="text-muted-foreground">Official Contact:</dt>
                    <dd className="text-foreground">
                      {values.officialEmail} | {values.officialPhone}
                    </dd>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-sm border-b pb-2 mb-3">Address & Location</h3>
                  <p className="text-sm text-foreground">
                    {values.addressLine1}
                    {values.addressLine2 && `, ${values.addressLine2}`}
                    <br />
                    {values.city}, {values.state} — {values.postalCode}
                    <br />
                    {values.country}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-sm border-b pb-2 mb-3">Primary School Admin</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium text-foreground">
                      {values.firstAdmin?.firstName} {values.firstAdmin?.lastName}
                    </dd>

                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="text-foreground">{values.firstAdmin?.email}</dd>

                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd className="text-foreground">{values.firstAdmin?.phone || '—'}</dd>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild>
                <Link to="/schools">Cancel</Link>
              </Button>
            )}

            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Provisioning Tenant...' : 'Confirm & Create School'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
