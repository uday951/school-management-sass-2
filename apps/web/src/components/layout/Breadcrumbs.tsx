import React from 'react';
import { Link, useMatches } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbHandle {
  breadcrumb: string | ((params: Record<string, string>) => string);
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => {
      const handle = match.handle as BreadcrumbHandle | undefined;
      return handle?.breadcrumb;
    })
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;
      const label =
        typeof handle.breadcrumb === 'function'
          ? handle.breadcrumb(match.params as Record<string, string>)
          : handle.breadcrumb;
      return { label, pathname: match.pathname };
    });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.pathname}>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              {idx === crumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.pathname}
                  className={cn('hover:text-foreground', 'transition-colors')}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
