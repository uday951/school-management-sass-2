import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '@/api/auditLogs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { Search, ClipboardList } from 'lucide-react';

export default function AuditLogsPage() {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);

  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs', debouncedSearch, page],
    queryFn: () =>
      auditLogsApi.list({
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
  });

  if (error) {
    return <div className="text-center py-12 text-destructive">Failed to load platform audit logs.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          View full platform activity logs and tenant action history.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs by action, actor, entity type..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data || data.data.data.length === 0 ? (
        <div className="border border-border rounded-lg bg-card py-12">
          <EmptyState
            icon={ClipboardList}
            title="No logs found"
            description="There are no audit logs matches."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Actor (Email)</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Tenant ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.actorEmail}</TableCell>
                    <TableCell>
                      <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate" title={log.entityId || ''}>
                      {log.entityId || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate" title={log.tenantId || ''}>
                      {log.tenantId || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination meta={data.data.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
