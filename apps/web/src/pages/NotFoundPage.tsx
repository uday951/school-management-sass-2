import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { School } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex h-[85vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <School className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Page Not Found</h1>
      <p className="max-w-md text-muted-foreground mb-6">
        Sorry, we couldn't find the page you are looking for. It might have been moved or archived.
      </p>
      <Button asChild>
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
