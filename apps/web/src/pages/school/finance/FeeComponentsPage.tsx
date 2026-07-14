import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, type FeeComponent, type FeeCategory } from '@/api/fees';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

const componentTypes = [
  { value: 'ONE_TIME', label: 'One Time' },
  { value: 'TERM', label: 'Term/Semester' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'CUSTOM', label: 'Custom' }
];

export default function FeeComponentsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingComponent, setEditingComponent] = React.useState<FeeComponent | null>(null);
  const [form, setForm] = React.useState({ 
    feeCategoryId: '', 
    name: '', 
    code: '', 
    description: '', 
    componentType: 'CUSTOM',
    isMandatoryDefault: true
  });

  const { data: components, isLoading: loadingComponents } = useQuery({
    queryKey: ['feeComponents'],
    queryFn: () => feesApi.listComponents()
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['feeCategories'],
    queryFn: () => feesApi.listCategories()
  });

  const mutation = useMutation({
    mutationFn: (data: any) => editingComponent 
      ? feesApi.updateComponent(editingComponent.id, data) 
      : feesApi.createComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeComponents'] });
      toast.success(editingComponent ? 'Fee component updated' : 'Fee component created');
      setIsOpen(false);
      setEditingComponent(null);
      setForm({ feeCategoryId: '', name: '', code: '', description: '', componentType: 'CUSTOM', isMandatoryDefault: true });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save fee component');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => feesApi.deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeComponents'] });
      toast.success('Fee component deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete fee component');
    }
  });

  const handleOpenCreate = () => {
    setEditingComponent(null);
    setForm({ 
      feeCategoryId: categories && categories[0] ? categories[0].id : '', 
      name: '', 
      code: '', 
      description: '', 
      componentType: 'CUSTOM',
      isMandatoryDefault: true
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (comp: FeeComponent) => {
    setEditingComponent(comp);
    setForm({
      feeCategoryId: comp.feeCategoryId,
      name: comp.name,
      code: comp.code || '',
      description: comp.description || '',
      componentType: comp.componentType,
      isMandatoryDefault: comp.isMandatoryDefault
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.feeCategoryId) {
      toast.error('Name and Category are required');
      return;
    }
    mutation.mutate(form);
  };

  if (loadingComponents || loadingCategories) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fee Components</h1>
          <p className="text-slate-400 text-sm">Define components that comprise your structures (e.g. Tuition Fee, Sports Fee, Library Fee)</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Component
        </Button>
      </div>

      {!components || components.length === 0 ? (
        <EmptyState icon={Tag} title="No Components Setup" description="Create your first fee component to begin mappings." />
      ) : (
        <Card className="border-slate-800 bg-slate-900/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Code</TableHead>
                  <TableHead className="text-slate-400">Category</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Mandatory Default</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((comp) => (
                  <TableRow key={comp.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-violet-400" />
                        {comp.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">{comp.code || '-'}</TableCell>
                    <TableCell className="text-slate-400">{comp.category?.name || '-'}</TableCell>
                    <TableCell className="text-slate-400 font-medium">{comp.componentType}</TableCell>
                    <TableCell className="text-slate-400">{comp.isMandatoryDefault ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${comp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {comp.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(comp)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                        title="Delete Fee Component"
                        description="Are you sure you want to delete this component? This action cannot be undone."
                        onConfirm={() => deleteMutation.mutate(comp.id)}
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
              <DialogTitle>{editingComponent ? 'Edit Fee Component' : 'Create Fee Component'}</DialogTitle>
              <DialogDescription className="text-slate-400">Configure your component details below.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label htmlFor="category" className="text-slate-300">Category Mapping</Label>
                <Select
                  value={form.feeCategoryId}
                  onValueChange={(val) => setForm({ ...form, feeCategoryId: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Annual Tuition Fee"
                />
              </div>

              <div>
                <Label htmlFor="code" className="text-slate-300">Code (Optional)</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. TUITION_ANNUAL"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Charged annually for academic courses"
                />
              </div>

              <div>
                <Label htmlFor="componentType" className="text-slate-300">Frequency Type</Label>
                <Select
                  value={form.componentType}
                  onValueChange={(val) => setForm({ ...form, componentType: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                    <SelectValue placeholder="Select frequency type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {componentTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isMandatoryDefault"
                  checked={form.isMandatoryDefault}
                  onChange={(e) => setForm({ ...form, isMandatoryDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <Label htmlFor="isMandatoryDefault" className="text-slate-300 cursor-pointer">Mandatory by default for all assignments</Label>
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
