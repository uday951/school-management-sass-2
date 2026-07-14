import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolsApi } from '@/api/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader } from '@/components/LoadingSpinner';
import { SCHOOL_TYPE_LABELS, BOARD_TYPE_LABELS } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const updateSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
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
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  logoUrl: z.string().url('Please enter a valid logo URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof updateSchoolSchema>;

export default function EditSchoolPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ['school', id],
    queryFn: () => schoolsApi.get(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => schoolsApi.update(id!, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
      navigate(`/schools/${id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update school';
      toast.error(msg);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateSchoolSchema),
  });

  React.useEffect(() => {
    if (school) {
      reset({
        name: school.name,
        schoolType: school.schoolType,
        board: school.board,
        establishedYear: school.establishedYear || undefined,
        officialEmail: school.officialEmail,
        officialPhone: school.officialPhone,
        website: school.website || '',
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2 || '',
        city: school.city,
        state: school.state,
        country: school.country,
        postalCode: school.postalCode,
        logoUrl: school.logoUrl || '',
      });
    }
  }, [school, reset]);

  if (isLoading) return <PageLoader />;
  if (error || !school) {
    return <div className="text-center py-12 text-destructive">School not found or error loading school.</div>;
  }

  const values = watch();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/schools/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit {school.name}</h1>
          <p className="text-sm text-muted-foreground">Modify school details, contact and location information.</p>
        </div>
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input id="name" placeholder="School Name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">School Code (Immutable)</Label>
                <Input id="code" value={school.code} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School Type *</Label>
                <Select
                  value={values.schoolType}
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
                  value={values.board}
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
                  value={values.establishedYear || ''}
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
                <Input id="officialPhone" placeholder="Official Phone Number" {...register('officialPhone')} />
                {errors.officialPhone && (
                  <p className="text-xs text-destructive">{errors.officialPhone.message}</p>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <h3 className="font-semibold text-foreground text-sm mb-4">Address Details</h3>
            </div>

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
                <Label htmlFor="postalCode">Postal Code *</Label>
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
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" asChild disabled={mutation.isPending}>
              <Link to={`/schools/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
