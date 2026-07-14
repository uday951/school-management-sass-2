import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { classesApi } from '@/api/classes';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  academicYearId: string;
}

export default function CreateFeeStructureModal({ isOpen, onClose, academicYearId }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [items, setItems] = React.useState<{ feeComponentId: string; amountMinor: number; isMandatory: boolean }[]>([]);
  const [installments, setInstallments] = React.useState<{ name: string; dueDate: string; items: { feeComponentId: string; amountMinor: number }[] }[]>([]);
  const [targets, setTargets] = React.useState<{ classId: string; sectionId: string }[]>([]);

  // Fetch components
  const { data: components } = useQuery({
    queryKey: ['feeComponents'],
    queryFn: () => feesApi.listComponents()
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.listClasses()
  });

  const mutation = useMutation({
    mutationFn: (data: any) => feesApi.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures', academicYearId] });
      toast.success('Fee structure created successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create fee structure');
    }
  });

  const handleAddComponentItem = () => {
    if (!components || components.length === 0) return;
    setItems([...items, { feeComponentId: components[0].id, amountMinor: 0, isMandatory: true }]);
  };

  const handleRemoveComponentItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, key: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [key]: value };
    setItems(updated);
  };

  const handleAddInstallment = () => {
    setInstallments([...installments, { name: `Installment ${installments.length + 1}`, dueDate: '', items: [] }]);
  };

  const handleRemoveInstallment = (idx: number) => {
    setInstallments(installments.filter((_, i) => i !== idx));
  };

  const handleUpdateInstallment = (idx: number, key: string, value: any) => {
    const updated = [...installments];
    updated[idx] = { ...updated[idx], [key]: value };
    setInstallments(updated);
  };

  const handleUpdateInstallmentItemAmount = (instIdx: number, compId: string, amount: number) => {
    const updatedInst = [...installments];
    const itemIdx = updatedInst[instIdx].items.findIndex(it => it.feeComponentId === compId);

    if (itemIdx >= 0) {
      updatedInst[instIdx].items[itemIdx].amountMinor = amount;
    } else {
      updatedInst[instIdx].items.push({ feeComponentId: compId, amountMinor: amount });
    }
    setInstallments(updatedInst);
  };

  const handleAddTarget = () => {
    if (!classes || classes.length === 0) return;
    setTargets([...targets, { classId: classes[0].id, sectionId: '' }]);
  };

  const handleRemoveTarget = (idx: number) => {
    setTargets(targets.filter((_, i) => i !== idx));
  };

  const handleUpdateTarget = (idx: number, key: string, value: any) => {
    const updated = [...targets];
    updated[idx] = { ...updated[idx], [key]: value };
    setTargets(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (items.length === 0) {
      toast.error('At least one fee component is required');
      return;
    }

    // Validate installment breakdown sum
    if (installments.length > 0) {
      for (const item of items) {
        const componentId = item.feeComponentId;
        const componentName = components?.find(c => c.id === componentId)?.name || '';
        const installmentSum = installments.reduce((acc, inst) => {
          const matched = inst.items.find(it => it.feeComponentId === componentId);
          return acc + (matched ? matched.amountMinor : 0);
        }, 0);

        if (installmentSum !== item.amountMinor) {
          toast.error(`Installment sums for ${componentName} (${installmentSum / 100}) must equal total component amount (${item.amountMinor / 100})`);
          return;
        }
      }
    }

    mutation.mutate({
      academicYearId,
      name,
      description,
      items,
      installments,
      targets
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Create Fee Structure</DialogTitle>
            <DialogDescription className="text-slate-400">Configure mapped items, target groups, and installment layouts.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="structName" className="text-slate-300 font-semibold">Structure Name</Label>
              <Input
                id="structName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white mt-1"
                placeholder="e.g. Grade 10 Standard Structure"
              />
            </div>
            <div>
              <Label htmlFor="structDesc" className="text-slate-300 font-semibold">Description</Label>
              <Input
                id="structDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white mt-1"
                placeholder="Brief structure notes"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Component Mapping */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fee Components & Amounts</h3>
              <Button type="button" size="sm" onClick={handleAddComponentItem} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                <Plus className="w-4 h-4 mr-1" /> Add Component
              </Button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <div className="flex-1">
                  <Label className="text-xs text-slate-400">Component</Label>
                  <Select
                    value={it.feeComponentId}
                    onValueChange={(val) => handleUpdateItem(idx, 'feeComponentId', val)}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {components?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-44">
                  <Label className="text-xs text-slate-400">Amount (INR)</Label>
                  <Input
                    type="number"
                    value={it.amountMinor / 100}
                    onChange={(e) => handleUpdateItem(idx, 'amountMinor', Math.round(Number(e.target.value) * 100))}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
                <Button type="button" onClick={() => handleRemoveComponentItem(idx)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 mt-5 p-2 bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <hr className="border-slate-800" />

          {/* Installments Layout */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Installments Setup</h3>
              <Button type="button" size="sm" onClick={handleAddInstallment} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                <Calendar className="w-4 h-4 mr-1" /> Add Installment
              </Button>
            </div>
            {installments.map((inst, instIdx) => (
              <div key={instIdx} className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400">Installment Name</Label>
                    <Input
                      value={inst.name}
                      onChange={(e) => handleUpdateInstallment(instIdx, 'name', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white mt-1"
                    />
                  </div>
                  <div className="w-64">
                    <Label className="text-xs text-slate-400">Due Date</Label>
                    <Input
                      type="date"
                      value={inst.dueDate}
                      onChange={(e) => handleUpdateInstallment(instIdx, 'dueDate', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white mt-1"
                    />
                  </div>
                  <Button type="button" onClick={() => handleRemoveInstallment(instIdx)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 mt-5 p-2 bg-transparent">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Breakdown amounts */}
                {items.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded border border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-400 mb-2">Component Amount Allocation:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((it, idx) => {
                        const matchedCompName = components?.find(c => c.id === it.feeComponentId)?.name || 'Fee';
                        const currentAmount = inst.items.find(item => item.feeComponentId === it.feeComponentId)?.amountMinor || 0;
                        return (
                          <div key={idx} className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-300 truncate max-w-xs">{matchedCompName} (Total: {it.amountMinor/100})</span>
                            <Input
                              type="number"
                              value={currentAmount / 100}
                              onChange={(e) => handleUpdateInstallmentItemAmount(instIdx, it.feeComponentId, Math.round(Number(e.target.value) * 100))}
                              className="bg-slate-900 border-slate-800 text-white h-7 text-xs w-28"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="border-slate-800" />

          {/* Targets Setup */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Targets Setup</h3>
              <Button type="button" size="sm" onClick={handleAddTarget} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                <Plus className="w-4 h-4 mr-1" /> Add Target Class
              </Button>
            </div>
            {targets.map((tgt, idx) => {
              const matchedClass = classes?.find(c => c.id === tgt.classId);
              return (
                <div key={idx} className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400">Class</Label>
                    <Select
                      value={tgt.classId}
                      onValueChange={(val) => handleUpdateTarget(idx, 'classId', val)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400">Section (Optional)</Label>
                    <Select
                      value={tgt.sectionId}
                      onValueChange={(val) => handleUpdateTarget(idx, 'sectionId', val)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                        <SelectValue placeholder="All Sections" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="all">All Sections</SelectItem>
                        {matchedClass?.sections?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" onClick={() => handleRemoveTarget(idx)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 mt-5 p-2 bg-transparent">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
              {mutation.isPending ? 'Creating...' : 'Create Structure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
