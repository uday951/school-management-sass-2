import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, type FeeStructure } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, Eye, Trash2, FolderSync, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateFeeStructureModal from './components/CreateFeeStructureModal';

export default function FeeStructuresPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: currentYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    }
  });

  const academicYearId = currentYear?.id || '';

  const { data: structures, isLoading } = useQuery({
    queryKey: ['feeStructures', academicYearId],
    queryFn: () => feesApi.listStructures(academicYearId),
    enabled: !!academicYearId
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => feesApi.updateStructureStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures', academicYearId] });
      toast.success('Fee structure status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => feesApi.deleteStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures', academicYearId] });
      toast.success('Fee structure deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete fee structure');
    }
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fee Structures</h1>
          <p className="text-slate-400 text-sm">Define comprehensive structures targeted at classes/sections for {currentYear?.name || 'Active Year'}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Structure
        </Button>
      </div>

      {!structures || structures.length === 0 ? (
        <EmptyState icon={FolderSync} title="No Fee Structures Found" description="Create a new fee structure containing component mapping, installments, and targets." />
      ) : (
        <Card className="border-slate-800 bg-slate-900/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Currency</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Components Count</TableHead>
                  <TableHead className="text-slate-400">Target Groups</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((str) => (
                  <TableRow key={str.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="font-semibold text-slate-200">
                      <div>{str.name}</div>
                      {str.description && <span className="text-xs text-slate-500 font-normal">{str.description}</span>}
                    </TableCell>
                    <TableCell className="text-slate-400">{str.currency}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        str.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                        str.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {str.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 font-semibold">
                      {str.items?.length || 0}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {str.targets && str.targets.length > 0 
                        ? str.targets.map(t => `${t.class?.name || 'Class'}${t.section ? ` - ${t.section.name}` : ''}`).join(', ')
                        : 'No Target Configured'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {str.status === 'DRAFT' && (
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Publish
                            </Button>
                          }
                          title="Publish Fee Structure"
                          description="Are you sure you want to publish this structure? This makes it available for assignments."
                          onConfirm={() => publishMutation.mutate({ id: str.id, status: 'ACTIVE' })}
                        />
                      )}
                      <Link to={`/school/fees/structures/${str.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                        title="Delete Fee Structure"
                        description="Are you sure you want to delete this structure? Active student assignments will prevent deletion."
                        onConfirm={() => deleteMutation.mutate(str.id)}
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

      {isModalOpen && (
        <CreateFeeStructureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          academicYearId={academicYearId}
        />
      )}
    </div>
  );
}
