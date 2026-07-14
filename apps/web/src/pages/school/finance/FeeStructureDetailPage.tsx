import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { ArrowLeft, Tag, Layers, Calendar, CheckSquare } from 'lucide-react';

export default function FeeStructureDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: structure, isLoading } = useQuery({
    queryKey: ['feeStructure', id],
    queryFn: () => feesApi.getStructure(id!)
  });

  if (isLoading) return <PageLoader />;
  if (!structure) return <div className="text-white text-center p-6">Fee Structure not found.</div>;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: structure.currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const totalSum = structure.items?.reduce((acc, curr) => acc + curr.amountMinor, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/school/finance/structures">
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{structure.name}</h1>
          <p className="text-slate-400 text-sm">{structure.description || 'No description provided'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details and Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-violet-400" />
                Fee Components Mapping
              </CardTitle>
              <CardDescription className="text-slate-400">List of billed items and components associated with this structure.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Component Name</TableHead>
                    <TableHead className="text-slate-400">Frequency</TableHead>
                    <TableHead className="text-slate-400">Mandatory</TableHead>
                    <TableHead className="text-right text-slate-400">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structure.items?.map((item) => (
                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell className="font-semibold text-slate-200">{item.component?.name}</TableCell>
                      <TableCell className="text-slate-400">{item.component?.componentType}</TableCell>
                      <TableCell className="text-slate-400">{item.isMandatory ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right text-white font-bold">{formatMoney(item.amountMinor)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t border-slate-800 bg-slate-950/40 font-bold hover:bg-transparent">
                    <TableCell colSpan={3} className="text-slate-300">Total Billed Amount</TableCell>
                    <TableCell className="text-right text-violet-400 text-lg">{formatMoney(totalSum)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Installments breakdown */}
          {structure.installments && structure.installments.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Installment Dues Layout
                </CardTitle>
                <CardDescription className="text-slate-400">Breakdown of total fees divided across installment due dates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {structure.installments.map((inst) => {
                  const instTotal = inst.items?.reduce((acc, curr) => acc + curr.amountMinor, 0) || 0;
                  return (
                    <div key={inst.id} className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white text-sm">{inst.name}</span>
                        <span className="text-xs text-slate-400">Due Date: {new Date(inst.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        {inst.items?.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.structureItem?.component?.name}</span>
                            <span className="text-slate-300">{formatMoney(item.amountMinor)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold text-xs text-emerald-400">
                        <span>Installment Total</span>
                        <span>{formatMoney(instTotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                Target Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {structure.targets && structure.targets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {structure.targets.map((tgt) => (
                    <span key={tgt.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {tgt.class?.name} {tgt.section ? `- ${tgt.section.name}` : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No classes/sections targeted yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Meta Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="font-semibold text-white">{structure.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-white">{structure.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Year</span>
                <span className="font-semibold text-white">{structure.academicYear?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Published At</span>
                <span className="font-semibold text-white">
                  {structure.publishedAt ? new Date(structure.publishedAt).toLocaleDateString() : 'Draft Mode'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
