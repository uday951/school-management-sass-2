import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { invitesApi } from '@/api/invites';
import { onboardingApi } from '@/api/onboarding';
import { PageLoader } from '@/components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, ArrowLeft, ArrowRight, Save, Landmark } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  personalData: z.object({
    firstName: z.string().min(1, 'First Name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last Name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    personalEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
    personalPhone: z.string().optional(),
  }),
  admissionData: z.object({
    admissionNumber: z.string().min(1, 'Admission number is required'),
    admissionDate: z.string().min(1, 'Admission date is required'),
    rollNumber: z.string().optional(),
  }),
  addressData: z.object({
    currentAddressLine1: z.string().min(1, 'Address line 1 is required'),
    currentAddressLine2: z.string().optional(),
    currentCity: z.string().min(1, 'City is required'),
    currentState: z.string().min(1, 'State is required'),
    currentCountry: z.string().min(1, 'Country is required'),
    currentPostalCode: z.string().min(1, 'Postal code is required'),
  }),
  guardianData: z.object({
    firstName: z.string().min(1, 'Guardian first name is required'),
    lastName: z.string().min(1, 'Guardian last name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(1, 'Guardian phone is required'),
    email: z.string().email('Invalid email').or(z.literal('')).optional(),
  })
});

export default function StudentRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ['resolveInvite', token],
    queryFn: () => invitesApi.resolveInvite(token!),
    enabled: !!token,
    retry: false
  });

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      personalData: {
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        personalEmail: '',
        personalPhone: ''
      },
      admissionData: {
        admissionNumber: '',
        admissionDate: new Date().toISOString().split('T')[0],
        rollNumber: ''
      },
      addressData: {
        currentAddressLine1: '',
        currentAddressLine2: '',
        currentCity: '',
        currentState: '',
        currentCountry: 'India',
        currentPostalCode: ''
      },
      guardianData: {
        firstName: '',
        lastName: '',
        relationship: 'FATHER',
        phone: '',
        email: ''
      }
    }
  });

  const submitMutation = useMutation({
    mutationFn: onboardingApi.submitStudentRequest,
    onSuccess: () => {
      toast.success('Registration submitted successfully! Redirecting...');
      navigate(`/join/submitted`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit registration');
    }
  });

  const onSubmit = (data: any) => {
    submitMutation.mutate({
      publicCode: token!,
      ...data
    });
  };

  const onInvalid = (formErrors: any) => {
    console.error('Validation errors:', formErrors);
    toast.error('Please correct all validation errors before submitting.');
  };

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = [
        'personalData.firstName',
        'personalData.lastName',
        'personalData.dateOfBirth',
        'personalData.gender',
        'personalData.personalEmail',
        'personalData.personalPhone'
      ];
    } else if (step === 2) {
      fieldsToValidate = [
        'admissionData.admissionNumber',
        'admissionData.admissionDate',
        'admissionData.rollNumber'
      ];
    } else if (step === 3) {
      fieldsToValidate = [
        'addressData.currentAddressLine1',
        'addressData.currentAddressLine2',
        'addressData.currentCity',
        'addressData.currentState',
        'addressData.currentCountry',
        'addressData.currentPostalCode'
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    } else {
      toast.error('Please fill all required fields in the current step correctly.');
    }
  };

  if (isLoading) return <PageLoader />;

  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-md">
          <GraduationCap className="mx-auto h-16 w-16 text-destructive" />
          <h2 className="mt-6 text-xl font-bold">Invalid Invite Token</h2>
          <p className="mt-3 text-slate-400">This link has expired, was revoked, or does not exist.</p>
          <Button onClick={() => navigate('/join')} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500">Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950 p-6 text-slate-100 font-sans md:p-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{invite.schoolName}</span>
            <h1 className="text-2xl font-black mt-1">Student Onboarding</h1>
          </div>
          <div className="text-right text-xs font-semibold text-slate-400">
            Step {step} of 4
          </div>
        </header>

        {/* Form Wizard */}
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-8 space-y-6">
          
          {/* STEP 1: PERSONAL DATA */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-indigo-300">1. Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">First Name *</label>
                  <Input {...register('personalData.firstName')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.personalData?.firstName && <p className="mt-1 text-xs text-destructive">{errors.personalData.firstName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Last Name *</label>
                  <Input {...register('personalData.lastName')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.personalData?.lastName && <p className="mt-1 text-xs text-destructive">{errors.personalData.lastName.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Middle Name</label>
                  <Input {...register('personalData.middleName')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Gender *</label>
                  <select {...register('personalData.gender')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Date of Birth *</label>
                  <Input type="date" {...register('personalData.dateOfBirth')} style={{ colorScheme: 'dark' }} className="mt-1 border-slate-800 bg-slate-955 text-slate-100" />
                  {errors.personalData?.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.personalData.dateOfBirth.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Personal Email</label>
                  <Input {...register('personalData.personalEmail')} placeholder="optional" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.personalData?.personalEmail && <p className="mt-1 text-xs text-destructive">{errors.personalData.personalEmail.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Personal Phone</label>
                <Input {...register('personalData.personalPhone')} placeholder="optional" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
              </div>
            </div>
          )}

          {/* STEP 2: ADMISSION DATA */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-indigo-300">2. Admission Details</h2>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Admission Number *</label>
                <Input {...register('admissionData.admissionNumber')} placeholder="e.g. SCH-1090" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                {errors.admissionData?.admissionNumber && <p className="mt-1 text-xs text-destructive">{errors.admissionData.admissionNumber.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Admission Date *</label>
                  <Input type="date" {...register('admissionData.admissionDate')} style={{ colorScheme: 'dark' }} className="mt-1 border-slate-800 bg-slate-955 text-slate-100" />
                  {errors.admissionData?.admissionDate && <p className="mt-1 text-xs text-destructive">{errors.admissionData.admissionDate.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Roll Number</label>
                  <Input {...register('admissionData.rollNumber')} placeholder="optional" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS DATA */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-indigo-300">3. Current Address</h2>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Address Line 1 *</label>
                <Input {...register('addressData.currentAddressLine1')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                {errors.addressData?.currentAddressLine1 && <p className="mt-1 text-xs text-destructive">{errors.addressData.currentAddressLine1.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Address Line 2</label>
                <Input {...register('addressData.currentAddressLine2')} placeholder="optional" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">City *</label>
                  <Input {...register('addressData.currentCity')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.addressData?.currentCity && <p className="mt-1 text-xs text-destructive">{errors.addressData.currentCity.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">State *</label>
                  <Input {...register('addressData.currentState')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.addressData?.currentState && <p className="mt-1 text-xs text-destructive">{errors.addressData.currentState.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Country *</label>
                  <Input {...register('addressData.currentCountry')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.addressData?.currentCountry && <p className="mt-1 text-xs text-destructive">{errors.addressData.currentCountry.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Postal Code *</label>
                  <Input {...register('addressData.currentPostalCode')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.addressData?.currentPostalCode && <p className="mt-1 text-xs text-destructive">{errors.addressData.currentPostalCode.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GUARDIAN DATA */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-indigo-300">4. Parent / Guardian</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">First Name *</label>
                  <Input {...register('guardianData.firstName')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.guardianData?.firstName && <p className="mt-1 text-xs text-destructive">{errors.guardianData.firstName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Last Name *</label>
                  <Input {...register('guardianData.lastName')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.guardianData?.lastName && <p className="mt-1 text-xs text-destructive">{errors.guardianData.lastName.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Relationship *</label>
                  <select {...register('guardianData.relationship')} className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Phone Number *</label>
                  <Input {...register('guardianData.phone')} className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                  {errors.guardianData?.phone && <p className="mt-1 text-xs text-destructive">{errors.guardianData.phone.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
                <Input {...register('guardianData.email')} placeholder="optional" className="mt-1 border-slate-800 bg-slate-950 text-slate-100" />
                {errors.guardianData?.email && <p className="mt-1 text-xs text-destructive">{errors.guardianData.email.message}</p>}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <footer className="border-t border-slate-800 pt-6 flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button type="button" onClick={() => navigate('/join')} variant="ghost" className="text-slate-400 hover:text-slate-100">
                Cancel
              </Button>
            )}

            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500 text-white ml-auto">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white ml-auto gap-2">
                <Save className="h-4 w-4" /> {submitMutation.isPending ? 'Submitting...' : 'Confirm & Submit'}
              </Button>
            )}
          </footer>

        </form>
      </div>
    </div>
  );
}
