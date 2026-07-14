import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, AuditLog } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/Pagination';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { ClipboardList, FileText } from 'lucide-react';

export default function SchoolAuditLogsPage() {
  const [page, setPage] = React.useState(1);
  const limit = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ['schoolAuditLogs', page],
    queryFn: async (): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(
        `/school/audit-logs?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return <div className="text-center py-12 text-destructive">Failed to load school audit logs.</div>;
  }

  const { data: logs, meta } = data.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail Activity</h1>
        <p className="text-sm text-muted-foreground">
          View structural configurations and modifications made across your school tenant.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={ClipboardList}
            title="No activity recorded"
            description="All modifications made to master data will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User Account (Actor)</TableHead>
                  <TableHead>Action Actioned</TableHead>
                  <TableHead>Entity Context</TableHead>
                  <TableHead className="text-right">Reference ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
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
                    <TableCell className="text-right font-mono text-xs max-w-[120px] truncate" title={log.entityId || ''}>
                      {log.entityId || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
