import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/utils';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super Admin Account</h1>
        <p className="text-sm text-muted-foreground">Manage your credentials and view profile settings.</p>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>{user.firstName} {user.lastName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user.firstName} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user.lastName} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>System Role</Label>
            <Input value={user.userType.replace(/_/g, ' ')} disabled className="bg-muted font-mono text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Input value={user.status} disabled className="bg-muted font-semibold text-emerald-400" />
            </div>
            <div className="space-y-2">
              <Label>Last Login Time</Label>
              <Input value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'} disabled className="bg-muted text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
