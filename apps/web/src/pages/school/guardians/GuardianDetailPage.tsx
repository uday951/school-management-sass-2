import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { guardiansApi } from '@/api/guardians';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLoader } from '@/components/LoadingSpinner';
import { ArrowLeft, User, Mail, Phone, Briefcase, Building, Edit } from 'lucide-react';
import { toast } from 'sonner';

const editGuardianSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
});

type FormValues = z.infer<typeof editGuardianSchema>;

export default function GuardianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);

  const { data: guardian, isLoading, error } = useQuery({
    queryKey: ['guardianProfile', id],
    queryFn: () => guardiansApi.getProfile(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editGuardianSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => guardiansApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardianProfile', id] });
      toast.success('Guardian profile updated');
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });

  React.useEffect(() => {
    if (guardian) {
      reset({
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        phone: guardian.phone,
        alternatePhone: guardian.alternatePhone || '',
        email: guardian.email || '',
        occupation: guardian.occupation || '',
        employer: guardian.employer || '',
      });
    }
  }, [guardian, reset]);

  if (isLoading) return <PageLoader />;
  if (error || !guardian) return <div className="text-center py-12 text-destructive">Guardian not found.</div>;

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/school/guardians">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {guardian.firstName} {guardian.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">Guardian Contact Profile</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="h-4 w-4 mr-1.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <Card className="border-border">
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Edit Contact Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input {...register('firstName')} />
                      {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input {...register('lastName')} />
                      {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input {...register('phone')} />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Alternate Phone</Label>
                      <Input {...register('alternatePhone')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Occupation</Label>
                      <Input {...register('occupation')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employer</Label>
                      <Input {...register('employer')} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={mutation.isPending}>Save</Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Full Name</span>
                      <strong>{guardian.firstName} {guardian.lastName}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Primary Phone</span>
                      <strong>{guardian.phone}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Email Address</span>
                      <span>{guardian.email || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Alternate Phone</span>
                      <span>{guardian.alternatePhone || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Occupation</span>
                      <span>{guardian.occupation || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Employer</span>
                      <span>{guardian.employer || '—'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Linked Children Siblings list */}
        <div className="space-y-6">
          <Card className="border-border bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base">Linked Children ({guardian.students.length})</CardTitle>
              <CardDescription>All students connected to this guardian contact profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guardian.students.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">No students linked to this profile.</p>
              ) : (
                <div className="space-y-3">
                  {guardian.students.map((link) => (
                    <div key={link.id} className="p-3 border rounded-lg bg-card text-xs sm:text-sm">
                      <Link
                        to={`/school/students/${link.student.id}`}
                        className="font-bold text-primary hover:underline block"
                      >
                        {link.student.firstName} {link.student.lastName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Admission No: <span className="font-mono">{link.student.admissionNumber}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-semibold flex justify-between">
                        <span>Relationship: {link.relationship}</span>
                        {link.isPrimary && <Badge variant="success" className="text-[9px] py-0 px-1">Primary</Badge>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
