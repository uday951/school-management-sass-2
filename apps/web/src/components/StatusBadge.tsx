import { Badge } from '@/components/ui/badge';
import type { SchoolStatus } from '@/types';
import { SCHOOL_STATUS_LABELS } from '@/types';

const statusConfig: Record<
  SchoolStatus,
  { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' }
> = {
  ACTIVE: { variant: 'success' },
  ONBOARDING: { variant: 'info' },
  SUSPENDED: { variant: 'warning' },
  ARCHIVED: { variant: 'secondary' },
};

export function StatusBadge({ status }: { status: SchoolStatus }) {
  const config = statusConfig[status] ?? { variant: 'secondary' };
  return (
    <Badge variant={config.variant}>{SCHOOL_STATUS_LABELS[status] ?? status}</Badge>
  );
}
