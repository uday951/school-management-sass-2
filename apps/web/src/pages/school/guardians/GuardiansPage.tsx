import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { guardiansApi } from '@/api/guardians';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { Link } from 'react-router-dom';
import { User, Search, Eye } from 'lucide-react';

export default function GuardiansPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['guardians', page, search],
    queryFn: () => guardiansApi.list({ search: search || undefined, page, limit: 10 }),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="text-center py-12 text-destructive">Failed to load guardians.</div>;

  const guardians = result?.data || [];
  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guardian Directory</h1>
        <p className="text-sm text-muted-foreground">Manage parent and guardian contact profiles registered in this school.</p>
      </div>

      {/* Filter card */}
      <Card className="border-border">
        <CardContent className="pt-6 flex gap-4 max-w-sm">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone or email..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {guardians.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={User}
            title="No Guardians Found"
            description="All parent contact details registered during student onboarding appear here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guardian Name</TableHead>
                  <TableHead>Primary Phone</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Linked Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardians.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-semibold text-foreground">
                      {g.firstName} {g.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{g.phone}</TableCell>
                    <TableCell>{g.email || '—'}</TableCell>
                    <TableCell>{g.occupation || '—'}</TableCell>
                    <TableCell>{g.employer || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {g.students && g.students.length > 0 ? (
                          g.students.map((link) => (
                            <Link
                              key={link.student.id}
                              to={`/school/students/${link.student.id}`}
                              className="text-xs text-primary hover:underline font-semibold"
                            >
                              {link.student.firstName} {link.student.lastName} ({link.relationship})
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">0 children linked</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="View Profile">
                        <Link to={`/school/guardians/${g.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
}
