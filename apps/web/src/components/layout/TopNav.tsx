import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from './Breadcrumbs';
import { getInitials } from '@/lib/utils';

export function TopNav() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <Breadcrumbs />

      <div className="flex items-center gap-3">
        {/* Platform indicator */}
        <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:block">
          Platform Super Admin
        </span>

        {/* User Avatar */}
        {user && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(user.firstName, user.lastName)}
          </div>
        )}
      </div>
    </header>
  );
}
