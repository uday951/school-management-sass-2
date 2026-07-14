import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolsApi } from '@/api/schools';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/LoadingSpinner';
import { BOARD_TYPE_LABELS, SCHOOL_TYPE_LABELS, type SchoolStatus, type SchoolType, type BoardType } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Plus, School as SchoolIcon, ArrowUpDown } from 'lucide-react';

export default function SchoolsPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<SchoolStatus | 'ALL'>('ALL');
  const [schoolType, setSchoolType] = React.useState<SchoolType | 'ALL'>('ALL');
  const [board, setBoard] = React.useState<BoardType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  // Debounced search to avoid excessive API requests
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['schools', debouncedSearch, status, schoolType, board, sortBy, sortOrder, page],
    queryFn: () =>
      schoolsApi.list({
        search: debouncedSearch || undefined,
        status: status !== 'ALL' ? status : undefined,
        schoolType: schoolType !== 'ALL' ? schoolType : undefined,
        board: board !== 'ALL' ? board : undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setSchoolType('ALL');
    setBoard('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load schools. Please reload or try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="text-sm text-muted-foreground">
            Onboard, view, search, and update schools across the platform.
          </p>
        </div>
        <Button asChild>
          <Link to="/schools/new" className="gap-2">
            <Plus className="h-4 w-4" /> Add School
          </Link>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid gap-3 md:grid-cols-5 sm:grid-cols-2">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, city, email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={(val) => { setStatus(val as any); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ONBOARDING">Onboarding</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={schoolType} onValueChange={(val) => { setSchoolType(val as any); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="School Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(SCHOOL_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={board} onValueChange={(val) => { setBoard(val as any); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="Board" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Boards</SelectItem>
            {Object.entries(BOARD_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(status !== 'ALL' || schoolType !== 'ALL' || board !== 'ALL' || search !== '') && (
        <div className="flex justify-end">
          <Button variant="link" onClick={clearFilters} className="text-xs h-auto p-0">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Main Table */}
      {isLoading ? (
        <PageLoader />
      ) : !data || data.data.data.length === 0 ? (
        <div className="border border-border rounded-lg bg-card py-12">
          <EmptyState
            icon={SchoolIcon}
            title="No Schools Found"
            description="We couldn't find any schools matching your criteria."
            action={
              (status !== 'ALL' || schoolType !== 'ALL' || board !== 'ALL' || search !== '') ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/schools/new">Onboard First School</Link>
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 hover:text-foreground font-semibold"
                    >
                      School Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('code')}
                      className="flex items-center gap-1 hover:text-foreground font-semibold"
                    >
                      Code <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City / State</TableHead>
                  <TableHead>Primary Admin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.data.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-semibold text-foreground">
                      <Link to={`/schools/${school.id}`} className="hover:underline text-primary">
                        {school.name}
                      </Link>
                    </TableCell>
                    <TableCell>{school.code}</TableCell>
                    <TableCell>{school.board}</TableCell>
                    <TableCell>{SCHOOL_TYPE_LABELS[school.schoolType]}</TableCell>
                    <TableCell>
                      {school.city}, {school.state}
                    </TableCell>
                    <TableCell>
                      {school.primaryAdmin ? (
                        <div>
                          <p className="text-sm font-medium">
                            {school.primaryAdmin.firstName} {school.primaryAdmin.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {school.primaryAdmin.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={school.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatDate(school.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/schools/${school.id}`}>View</Link>
                      </Button>
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
