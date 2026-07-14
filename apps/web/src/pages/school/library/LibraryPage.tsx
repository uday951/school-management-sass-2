import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi, type LibrarySettings, type Book, type BookCopy, type LibraryLoan, type LibraryFine } from '@/api/library';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils';
import { BookOpen, Settings, Plus, RotateCw, BookMarked, UserCheck, AlertTriangle, Landmark, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  edition: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  language: z.string().default('English'),
  description: z.string().optional()
});

const issueSchema = z.object({
  bookCopyId: z.string().min(1, 'Book copy accession is required'),
  borrowerType: z.enum(['STUDENT', 'EMPLOYEE']),
  studentId: z.string().optional(),
  employeeId: z.string().optional()
});

const waiveSchema = z.object({
  waivedAmountMinor: z.coerce.number().min(1, 'Waiver amount must be greater than 0'),
  reason: z.string().min(3, 'Reason must be at least 3 characters')
});

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'books' | 'loans' | 'settings'>('dashboard');
  const [isBookModalOpen, setIsBookModalOpen] = React.useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = React.useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = React.useState(false);
  const [isWaiveModalOpen, setIsWaiveModalOpen] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [selectedFine, setSelectedFine] = React.useState<LibraryFine | null>(null);

  // Queries
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['libraryMetrics'],
    queryFn: libraryApi.getDashboardMetrics
  });

  const { data: books, isLoading: loadingBooks } = useQuery({
    queryKey: ['libraryBooks'],
    queryFn: () => libraryApi.listBooks()
  });

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['librarySettings'],
    queryFn: libraryApi.getSettings
  });

  const { data: copies, isLoading: loadingCopies } = useQuery({
    queryKey: ['libraryCopies', selectedBook?.id],
    queryFn: () => libraryApi.listCopies(selectedBook?.id),
    enabled: !!selectedBook
  });

  // Forms
  const bookForm = useForm({ resolver: zodResolver(bookSchema) });
  const copyForm = useForm({ defaultValues: { accessionNumber: '', shelfLocation: '' } });
  const issueForm = useForm({ resolver: zodResolver(issueSchema), defaultValues: { borrowerType: 'STUDENT' as const } });
  const waiveForm = useForm({ resolver: zodResolver(waiveSchema) });

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: libraryApi.createBook,
    onSuccess: () => {
      toast.success('Book created successfully');
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      setIsBookModalOpen(false);
      bookForm.reset();
    }
  });

  const createCopyMutation = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: any }) => libraryApi.createBookCopy(bookId, data),
    onSuccess: () => {
      toast.success('Book copy added');
      queryClient.invalidateQueries({ queryKey: ['libraryCopies'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      setIsCopyModalOpen(false);
      copyForm.reset();
    }
  });

  const issueBookMutation = useMutation({
    mutationFn: libraryApi.issueBook,
    onSuccess: () => {
      toast.success('Book copy issued successfully');
      queryClient.invalidateQueries({ queryKey: ['libraryMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      setIsIssueModalOpen(false);
      issueForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: libraryApi.updateSettings,
    onSuccess: () => {
      toast.success('Library settings updated');
      queryClient.invalidateQueries({ queryKey: ['librarySettings'] });
    }
  });

  if (loadingMetrics || loadingSettings) {
    return <PageLoader />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Workspace</h1>
          <p className="text-muted-foreground">Manage school catalogs, book copies circulation desk, and borrowing policies.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBookModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Book
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-px">
        <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} onClick={() => setActiveTab('dashboard')}>
          <BookOpen className="mr-2 h-4 w-4" /> Dashboard
        </Button>
        <Button variant={activeTab === 'books' ? 'default' : 'ghost'} onClick={() => setActiveTab('books')}>
          <BookMarked className="mr-2 h-4 w-4" /> Book Catalog
        </Button>
        <Button variant={activeTab === 'loans' ? 'default' : 'ghost'} onClick={() => setActiveTab('loans')}>
          <UserCheck className="mr-2 h-4 w-4" /> Circulation Desk
        </Button>
        <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} onClick={() => setActiveTab('settings')}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Titles</CardTitle>
                <BookMarked className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalTitles || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Issued Books</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.issuedCopies || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Available Copies</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.availableCopies || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics?.overdueLoans || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'books' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book Inventory Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBooks ? (
                <PageLoader />
              ) : !books || books.length === 0 ? (
                <EmptyState icon={BookMarked} title="No Books Cataloged" description="Add catalog entries to start inventory tracking." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Edition</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell>{b.edition || '1st'}</TableCell>
                        <TableCell>{b.language}</TableCell>
                        <TableCell>{b.copies.length} Copies</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedBook(b); setIsCopyModalOpen(true); }}>
                            Add Copy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'loans' && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Circulation Registry</CardTitle>
              <CardDescription>Issue and record returns for student and employee loans.</CardDescription>
            </div>
            <Button onClick={() => setIsIssueModalOpen(true)}>Issue Book</Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Issue loan desks are fully active. Use standard borrowing controls.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Borrowing Rules & Settings</CardTitle>
            <CardDescription>Configure checkout durations, max copy checks, and overdue fine structures.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettingsMutation.mutate({
                  defaultStudentLoanDays: Number(formData.get('defaultStudentLoanDays')),
                  defaultEmployeeLoanDays: Number(formData.get('defaultEmployeeLoanDays')),
                  maxStudentBooks: Number(formData.get('maxStudentBooks')),
                  maxEmployeeBooks: Number(formData.get('maxEmployeeBooks')),
                  renewalAllowed: formData.get('renewalAllowed') === 'true',
                  maxRenewals: Number(formData.get('maxRenewals')),
                  fineEnabled: formData.get('fineEnabled') === 'true',
                  finePerDayMinor: Number(formData.get('finePerDayMinor')),
                  graceDays: Number(formData.get('graceDays'))
                });
              }}
              className="space-y-4 max-w-lg"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultStudentLoanDays">Student Loan Period (Days)</Label>
                  <Input name="defaultStudentLoanDays" type="number" defaultValue={settings?.defaultStudentLoanDays} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultEmployeeLoanDays">Staff Loan Period (Days)</Label>
                  <Input name="defaultEmployeeLoanDays" type="number" defaultValue={settings?.defaultEmployeeLoanDays} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStudentBooks">Max Student Books</Label>
                  <Input name="maxStudentBooks" type="number" defaultValue={settings?.maxStudentBooks} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEmployeeBooks">Max Staff Books</Label>
                  <Input name="maxEmployeeBooks" type="number" defaultValue={settings?.maxEmployeeBooks} />
                </div>
              </div>
              <Button type="submit">Save Rules Settings</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dialog Modals */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Catalog New Title</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={bookForm.handleSubmit((data) => createBookMutation.mutate(data))}
                className="space-y-4"
              >
                <div>
                  <Label>Book Title</Label>
                  <Input {...bookForm.register('title')} placeholder="e.g. Foundation" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input {...bookForm.register('description')} placeholder="Optional description text" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Book</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
