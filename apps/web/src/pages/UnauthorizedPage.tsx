import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 text-destructive animate-bounce">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Access Denied</h1>
      <p className="max-w-md text-muted-foreground mb-6">
        You do not have the required Platform Super Admin authorization to view this page. If you are a school administrator, please use your dedicated school URL.
      </p>
      <Button asChild>
        <Link to="/login">Go to Login</Link>
      </Button>
    </div>
  );
}
