import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, type Role } from '@/api/roles';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ShieldCheck, Plus, Edit, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

// Defined list of allowed school permissions for custom roles management
const PERMISSIONS_LIST = [
  { code: 'school.profile.read', label: 'View Profile', module: 'School Profile' },
  { code: 'school.profile.update', label: 'Edit Profile', module: 'School Profile' },
  { code: 'academic_year.read', label: 'View Academic Sessions', module: 'Sessions' },
  { code: 'academic_year.create', label: 'Add Session', module: 'Sessions' },
  { code: 'academic_year.update', label: 'Edit Session', module: 'Sessions' },
  { code: 'academic_year.set_current', label: 'Set Active Session', module: 'Sessions' },
  { code: 'academic_year.archive', label: 'Archive Session', module: 'Sessions' },
  { code: 'department.read', label: 'View Departments', module: 'Departments' },
  { code: 'department.create', label: 'Add Department', module: 'Departments' },
  { code: 'department.update', label: 'Edit Department', module: 'Departments' },
  { code: 'department.archive', label: 'Archive Department', module: 'Departments' },
  { code: 'class.read', label: 'View Classes', module: 'Classes & Sections' },
  { code: 'class.create', label: 'Add Class', module: 'Classes & Sections' },
  { code: 'class.update', label: 'Edit Class', module: 'Classes & Sections' },
  { code: 'class.archive', label: 'Archive Class', module: 'Classes & Sections' },
  { code: 'section.read', label: 'View Sections', module: 'Classes & Sections' },
  { code: 'section.create', label: 'Add Section', module: 'Classes & Sections' },
  { code: 'section.update', label: 'Edit Section', module: 'Classes & Sections' },
  { code: 'section.archive', label: 'Archive Section', module: 'Classes & Sections' },
  { code: 'subject.read', label: 'View Subjects', module: 'Subjects & Curriculum' },
  { code: 'subject.create', label: 'Add Subject', module: 'Subjects & Curriculum' },
  { code: 'subject.update', label: 'Edit Subject', module: 'Subjects & Curriculum' },
  { code: 'subject.archive', label: 'Archive Subject', module: 'Subjects & Curriculum' },
  { code: 'subject_mapping.read', label: 'View Subject Mappings', module: 'Subjects & Curriculum' },
  { code: 'subject_mapping.manage', label: 'Manage Curriculum Mappings', module: 'Subjects & Curriculum' },
  { code: 'school_role.read', label: 'View Roles', module: 'Roles & Staff Permissions' },
  { code: 'school_role.create', label: 'Add Custom Role', module: 'Roles & Staff Permissions' },
  { code: 'school_role.update', label: 'Edit Custom Role', module: 'Roles & Staff Permissions' },
  { code: 'school_role.permissions.manage', label: 'Configure Custom Permissions', module: 'Roles & Staff Permissions' },
  { code: 'audit.read', label: 'View Audit logs', module: 'System Operations' },
];

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  code: z.string().min(2, 'Role code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof roleSchema>;

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [rolePermissions, setRolePermissions] = React.useState<string[]>([]);

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => rolesApi.create({ ...data, permissions: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Custom staff role created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create role');
    },
  });

  const permissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      rolesApi.updatePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permissions configuration updated successfully');
      setSelectedRole(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to modify permissions');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(roleSchema),
  });

  React.useEffect(() => {
    if (selectedRole) {
      setRolePermissions(selectedRole.permissions);
    } else {
      setRolePermissions([]);
    }
  }, [selectedRole]);

  if (isLoading) return <PageLoader />;
  if (error) {
    return <div className="text-center py-12 text-destructive">Failed to load roles.</div>;
  }

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handlePermissionToggle = (code: string) => {
    setRolePermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code],
    );
  };

  const savePermissions = () => {
    if (selectedRole) {
      permissionsMutation.mutate({ id: selectedRole.id, permissions: rolePermissions });
    }
  };

  // Group permissions by module
  const groupedPermissions = PERMISSIONS_LIST.reduce(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    },
    {} as Record<string, typeof PERMISSIONS_LIST>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">Manage staff access roles and authorization profiles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      {isModalOpen && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Create Custom Role</CardTitle>
              <CardDescription>Setup custom role profiles for your school staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input id="roleName" placeholder="e.g. Vice Principal" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleCode">Role Code *</Label>
                  <Input id="roleCode" placeholder="e.g. VICE_PRINCIPAL" {...register('code')} />
                  {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDesc">Description</Label>
                <Input id="roleDesc" placeholder="Enter role scope details..." {...register('description')} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>Save</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Grid listing and permissions editor */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Roles Directory */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Role Registry</CardTitle>
              <CardDescription>Select a role to configure permissions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {roles?.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r)}
                    className={`w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center justify-between ${
                      selectedRole?.id === r.id ? 'bg-primary/5 text-primary' : 'text-foreground'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        {r.name} {r.isSystem && <span title="System Role"><Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" /></span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{r.description || 'No description'}</p>
                    </div>
                    <Badge variant={selectedRole?.id === r.id ? 'default' : 'outline'}>{r.permissions.length} Perms</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Manager Panel */}
        <div className="md:col-span-2">
          {selectedRole ? (
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-lg">Configure Permissions: {selectedRole.name}</CardTitle>
                  <CardDescription>Select checkboxes to map workspace permissions.</CardDescription>
                </div>
                {!selectedRole.isSystem && (
                  <Button onClick={savePermissions} disabled={permissionsMutation.isPending}>
                    {permissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6 max-h-[60vh] overflow-y-auto space-y-6">
                {selectedRole.isSystem && (
                  <div className="bg-muted/40 p-4 border border-border rounded-lg text-xs text-muted-foreground mb-4">
                    This is a protected system-defined role. Permissions on this profile are immutable.
                  </div>
                )}

                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                  <div key={moduleName} className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">{moduleName}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {perms.map((p) => {
                        const isChecked = rolePermissions.includes(p.code);
                        return (
                          <div
                            key={p.code}
                            className={`flex items-start gap-2.5 p-2.5 rounded border transition-colors ${
                              isChecked ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/80'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={p.code}
                              className="mt-0.5 rounded border-border bg-background h-4 w-4"
                              disabled={selectedRole.isSystem || permissionsMutation.isPending}
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(p.code)}
                            />
                            <label htmlFor={p.code} className="text-xs sm:text-sm font-medium cursor-pointer">
                              <span className="block text-foreground">{p.label}</span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5 font-mono">{p.code}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border py-16 flex items-center justify-center text-center">
              <EmptyState
                icon={ShieldCheck}
                title="Select a Role"
                description="Click a role in the registry panel to inspect and configure authorization settings."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
