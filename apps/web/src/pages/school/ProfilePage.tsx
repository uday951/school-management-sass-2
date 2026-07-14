import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolApi } from '@/api/school';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { School, Mail, Phone, Globe, MapPin, Building, Lock } from 'lucide-react';
import { toast } from 'sonner';

const schoolProfileSchema = z.object({
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

type ProfileFormValues = z.infer<typeof schoolProfileSchema>;

export default function SchoolProfilePage() {
  const queryClient = useQueryClient();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: schoolApi.getProfile,
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => schoolApi.updateProfile(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
      toast.success('School profile updated successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update school profile';
      toast.error(msg);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
  });

  React.useEffect(() => {
    if (school) {
      reset({
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
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load school profile.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Profile</h1>
        <p className="text-sm text-muted-foreground">
          View structural records and manage official contact or location information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Core profile details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
              <CardHeader>
                <CardTitle>Edit Contact & Address Details</CardTitle>
                <CardDescription>Only contact/location parameters are customizable.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officialEmail">Official Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="officialEmail" className="pl-10" {...register('officialEmail')} disabled={mutation.isPending} />
                    </div>
                    {errors.officialEmail && <p className="text-xs text-destructive">{errors.officialEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officialPhone">Official Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="officialPhone" className="pl-10" {...register('officialPhone')} disabled={mutation.isPending} />
                    </div>
                    {errors.officialPhone && <p className="text-xs text-destructive">{errors.officialPhone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="website" className="pl-10" placeholder="https://school.com" {...register('website')} disabled={mutation.isPending} />
                  </div>
                  {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="addressLine1" className="pl-10" {...register('addressLine1')} disabled={mutation.isPending} />
                  </div>
                  {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input id="addressLine2" placeholder="Suite, Landmark (Optional)" {...register('addressLine2')} disabled={mutation.isPending} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register('city')} disabled={mutation.isPending} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...register('state')} disabled={mutation.isPending} />
                    {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code / PIN *</Label>
                    <Input id="postalCode" {...register('postalCode')} disabled={mutation.isPending} />
                    {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register('country')} disabled={mutation.isPending} />
                    {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo Image URL (Optional)</Label>
                  <Input id="logoUrl" placeholder="https://image-bucket/logo.png" {...register('logoUrl')} disabled={mutation.isPending} />
                  {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Immutable sidebar info */}
        <div className="space-y-6">
          <Card className="border-border bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" /> Registration Metadata
              </CardTitle>
              <CardDescription>These system values are immutable for safety.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase block font-bold">School Name</span>
                <span className="text-foreground text-sm font-semibold block">{school.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Official Code</span>
                <span className="font-mono text-foreground text-sm block">{school.code}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Board Affiliation</span>
                <span className="text-foreground block">{school.board}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">School Type</span>
                <span className="text-foreground block">{school.schoolType}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Tenant Reference</span>
                <span className="font-mono text-muted-foreground block truncate">{school.tenantId}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Operational Status</span>
                <span className="text-emerald-400 font-semibold block">{school.status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
