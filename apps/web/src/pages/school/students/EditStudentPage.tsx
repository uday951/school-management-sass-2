import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader } from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const editStudentSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender selection is required'),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  motherTongue: z.string().optional(),
  personalEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  personalPhone: z.string().optional(),
  joiningType: z.string().optional(),
  previousSchoolName: z.string().optional(),
  previousClassName: z.string().optional(),

  // Address
  currentAddressLine1: z.string().min(5, 'Current address is required'),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1, 'City is required'),
  currentState: z.string().min(1, 'State is required'),
  currentCountry: z.string().min(1, 'Country is required'),
  currentPostalCode: z.string().min(4, 'Postal code is required'),
  
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().default(true),

  // Emergency
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  specialAssistanceNotes: z.string().optional(),
});

type FormValues = z.infer<typeof editStudentSchema>;

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: student, isLoading, error } = useQuery({
    queryKey: ['studentProfile', id],
    queryFn: () => studentsApi.getProfile(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editStudentSchema),
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: (data: FormValues) => studentsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', id] });
      toast.success('Student profile updated successfully');
      navigate(`/school/students/${id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update student profile');
    },
  });

  React.useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        middleName: student.middleName || '',
        lastName: student.lastName,
        preferredName: student.preferredName || '',
        photoUrl: student.photoUrl || '',
        dateOfBirth: student.dateOfBirth.substring(0, 10),
        gender: student.gender,
        bloodGroup: student.bloodGroup || '',
        nationality: student.nationality || 'Indian',
        motherTongue: student.motherTongue || '',
        personalEmail: student.personalEmail || '',
        personalPhone: student.personalPhone || '',
        joiningType: student.joiningType || 'NEW',
        previousSchoolName: student.previousSchoolName || '',
        previousClassName: student.previousClassName || '',

        currentAddressLine1: student.currentAddressLine1,
        currentAddressLine2: student.currentAddressLine2 || '',
        currentCity: student.currentCity,
        currentState: student.currentState,
        currentCountry: student.currentCountry,
        currentPostalCode: student.currentPostalCode,

        permanentAddressLine1: student.permanentAddressLine1 || '',
        permanentAddressLine2: student.permanentAddressLine2 || '',
        permanentCity: student.permanentCity || '',
        permanentState: student.permanentState || '',
        permanentCountry: student.permanentCountry || 'India',
        permanentPostalCode: student.permanentPostalCode || '',
        sameAsCurrentAddress: student.sameAsCurrentAddress,

        emergencyContactName: student.emergencyContactName || '',
        emergencyContactRelationship: student.emergencyContactRelationship || '',
        emergencyContactPhone: student.emergencyContactPhone || '',
        allergies: student.allergies || '',
        medicalNotes: student.medicalNotes || '',
        specialAssistanceNotes: student.specialAssistanceNotes || '',
      });
    }
  }, [student, reset]);

  if (isLoading) return <PageLoader />;
  if (error || !student) return <div className="text-center py-12 text-destructive">Student not found.</div>;

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/school/students/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Student Profile</h1>
          <p className="text-sm text-muted-foreground">Modify student personal, address, and emergency contact details.</p>
        </div>
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <Input id="bloodGroup" {...register('bloodGroup')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" {...register('nationality')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherTongue">Mother Tongue</Label>
                <Input id="motherTongue" {...register('motherTongue')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2 col-span-2">
                <h3 className="font-bold text-sm">Addresses</h3>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="currentAddressLine1">Current Address Line 1 *</Label>
                <Input id="currentAddressLine1" {...register('currentAddressLine1')} />
                {errors.currentAddressLine1 && <p className="text-xs text-destructive">{errors.currentAddressLine1.message}</p>}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="currentPostalCode">Postal Code *</Label>
                <Input id="currentPostalCode" {...register('currentPostalCode')} />
                {errors.currentPostalCode && <p className="text-xs text-destructive">{errors.currentPostalCode.message}</p>}
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
                  <Label htmlFor="sameAsCurrentAddress" className="font-semibold cursor-pointer">
                    Permanent Address same as Current
                  </Label>
                </div>
              </div>
            </div>

            {!values.sameAsCurrentAddress && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4 animate-fade-in">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="permanentAddressLine1">Permanent Address Line 1 *</Label>
                  <Input id="permanentAddressLine1" {...register('permanentAddressLine1')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentCity">City *</Label>
                  <Input id="permanentCity" {...register('permanentCity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentState">State *</Label>
                  <Input id="permanentState" {...register('permanentState')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentPostalCode">Postal Code *</Label>
                  <Input id="permanentPostalCode" {...register('permanentPostalCode')} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-2 col-span-3">
                <h3 className="font-bold text-sm">Emergency & Sensitive Info</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                <Input id="emergencyContactRelationship" {...register('emergencyContactRelationship')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="allergies">Allergies / Health warnings</Label>
                <Input id="allergies" {...register('allergies')} />
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="medicalNotes">Sensitive Medical Conditions</Label>
                <textarea
                  id="medicalNotes"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('medicalNotes')}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(`/school/students/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
