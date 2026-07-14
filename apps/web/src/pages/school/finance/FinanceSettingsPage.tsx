import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Save, Settings } from 'lucide-react';

export default function FinanceSettingsPage() {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = React.useState('INR');
  const [lateFeeEnabled, setLateFeeEnabled] = React.useState(false);
  const [graceDays, setGraceDays] = React.useState(0);
  const [lateFeeType, setLateFeeType] = React.useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [lateFeeValue, setLateFeeValue] = React.useState(0);
  const [receiptPrefix, setReceiptPrefix] = React.useState('RCT/');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['financeSettings'],
    queryFn: () => feesApi.getSettings(),
  });

  // Sync state if settings finishes loading after initial render
  React.useEffect(() => {
    if (settings) {
      setCurrency(settings.currency);
      setLateFeeEnabled(settings.lateFeeEnabled);
      setGraceDays(settings.graceDays);
      setLateFeeType(settings.lateFeeType);
      setLateFeeValue(settings.lateFeeValue);
      setReceiptPrefix(settings.receiptPrefix);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: any) => feesApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeSettings'] });
      toast.success('Finance settings updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      currency,
      lateFeeEnabled,
      graceDays: Number(graceDays),
      lateFeeType,
      lateFeeValue: Number(lateFeeValue),
      receiptPrefix
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Finance Settings</h1>
        <p className="text-slate-400 text-sm">Configure currency, late fee dues policies, and receipt numbering rules.</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/40 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-400" />
            General Parameters
          </CardTitle>
          <CardDescription className="text-slate-400">Manage fine rates and ledger prefixes below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Default Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Receipt Prefix</Label>
                <Input
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lateFeeEnabled"
                  checked={lateFeeEnabled}
                  onChange={(e) => setLateFeeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <Label htmlFor="lateFeeEnabled" className="text-slate-300 cursor-pointer">Enable Late Fees Calculations</Label>
              </div>

              {lateFeeEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                  <div>
                    <Label className="text-slate-300">Grace Days</Label>
                    <Input
                      type="number"
                      value={graceDays}
                      onChange={(e) => setGraceDays(Number(e.target.value))}
                      className="bg-slate-900 border-slate-800 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Fine Type</Label>
                    <Select value={lateFeeType} onValueChange={(val: any) => setLateFeeType(val)}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">
                      {lateFeeType === 'PERCENTAGE' ? 'Rate (%)' : 'Amount (INR)'}
                    </Label>
                    <Input
                      type="number"
                      value={lateFeeValue}
                      onChange={(e) => setLateFeeValue(Number(e.target.value))}
                      className="bg-slate-900 border-slate-800 text-white mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={mutation.isPending} className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
              <Save className="w-4 h-4 mr-2" /> Save Configuration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
