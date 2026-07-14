import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, type FeeCategory } from '@/api/fees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export default function FeeCategoriesPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<FeeCategory | null>(null);
  const [form, setForm] = React.useState({ name: '', code: '', description: '', sortOrder: 0 });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['feeCategories'],
    queryFn: () => feesApi.listCategories()
  });

  const mutation = useMutation({
    mutationFn: (data: any) => editingCategory 
      ? feesApi.updateCategory(editingCategory.id, data) 
      : feesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeCategories'] });
      toast.success(editingCategory ? 'Fee category updated' : 'Fee category created');
      setIsOpen(false);
      setEditingCategory(null);
      setForm({ name: '', code: '', description: '', sortOrder: 0 });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save fee category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => feesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeCategories'] });
      toast.success('Fee category deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete fee category');
    }
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', code: '', description: '', sortOrder: 0 });
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: FeeCategory) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      code: cat.code || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    mutation.mutate({
      ...form,
      sortOrder: Number(form.sortOrder)
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fee Categories</h1>
          <p className="text-slate-400 text-sm">Group your fee components under generic fee headers (e.g. Academic, Transport, Hostel)</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState icon={Tag} title="No Categories Setup" description="Create your first fee category grouping to get started." />
      ) : (
        <Card className="border-slate-800 bg-slate-900/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Sort Order</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Code</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="font-semibold text-white">{cat.sortOrder}</TableCell>
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-violet-400" />
                        {cat.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">{cat.code || '-'}</TableCell>
                    <TableCell className="text-slate-400 max-w-md truncate">{cat.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {cat.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(cat)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                        title="Delete Fee Category"
                        description="Are you sure you want to delete this category? This action cannot be undone."
                        onConfirm={() => deleteMutation.mutate(cat.id)}
                        confirmLabel="Delete"
                        variant="destructive"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Fee Category' : 'Create Fee Category'}</DialogTitle>
              <DialogDescription className="text-slate-400">Configure your category details below.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Tuition Fees"
                />
              </div>

              <div>
                <Label htmlFor="code" className="text-slate-300">Code (Optional)</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. TUITION"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="Describe category purpose"
                />
              </div>

              <div>
                <Label htmlFor="sortOrder" className="text-slate-300">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white">
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
