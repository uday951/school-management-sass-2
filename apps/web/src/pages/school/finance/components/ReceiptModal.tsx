import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Printer, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}

export default function ReceiptModal({ isOpen, onClose, paymentId }: Props) {
  // We can fetch the payment list and match or fetch a single receipt details.
  // Wait, let's look at all payments list and find the selected one. Or since list query is cached, we can read it.
  // Let's get the specific payment matching paymentId
  const { data: currentYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    }
  });

  const { data: payments } = useQuery({
    queryKey: ['paymentsHistory', currentYear?.id || ''],
    queryFn: () => feesApi.listPayments(currentYear?.id || ''),
    enabled: !!currentYear?.id
  });

  const payment = payments?.find(p => p.id === paymentId);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName.toString(), 'left=50,top=50,width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fee Receipt</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #000; background: #fff; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
              .school-name { font-size: 24px; font-weight: bold; }
              .receipt-title { font-size: 18px; font-weight: bold; margin-top: 5px; }
              .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 14px; }
              .label { color: #555; }
              .value { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
              th { background-color: #f5f5f5; }
              .total-row { font-weight: bold; font-size: 16px; background-color: #fafafa; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 14px; }
              .signature { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; margin-top: 40px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fee Receipt Preview</DialogTitle>
          <DialogDescription className="text-slate-400">View and print structural fee transaction receipt.</DialogDescription>
        </DialogHeader>

        {/* Print Area */}
        <div id="receipt-print-area" className="bg-white text-slate-950 p-6 rounded-lg border border-slate-200 space-y-6">
          <div className="text-center border-b pb-4 border-slate-300">
            <h2 className="text-xl font-bold uppercase tracking-wide">SchoolSaaS Management Platform</h2>
            <div className="text-sm text-slate-500">Official Fees Collection Receipt</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-500">Receipt Details:</div>
              <div className="font-bold text-sm mt-0.5">Ref: {payment.referenceNumber || 'CASH-LOG'}</div>
              <div className="mt-1">Date: {new Date(payment.paymentDate).toLocaleDateString()}</div>
              <div>Status: <span className="font-semibold text-emerald-600">{payment.status}</span></div>
            </div>
            <div>
              <div className="text-slate-500">Student Profile:</div>
              <div className="font-bold text-sm mt-0.5">{payment.student?.firstName} {payment.student?.lastName}</div>
              <div className="mt-1">Admission Number: {payment.student?.admissionNumber}</div>
              <div>Payment Method: {payment.paymentMethod}</div>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2">Fee Component / Charge Description</th>
                <th className="border p-2 text-right">Allocated Payment</th>
              </tr>
            </thead>
            <tbody>
              {payment.allocations && payment.allocations.length > 0 ? (
                payment.allocations.map((a) => (
                  <tr key={a.id}>
                    <td className="border p-2">{a.charge?.description || 'Structural Fee Component'}</td>
                    <td className="border p-2 text-right font-bold">{formatMoney(a.amountMinor)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border p-2">General Account Payment Credit</td>
                  <td className="border p-2 text-right font-bold">{formatMoney(payment.amountMinor)}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold text-sm">
                <td className="border p-2 text-slate-700">Total Billed Collection</td>
                <td className="border p-2 text-right text-violet-700">{formatMoney(payment.amountMinor)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-end pt-12 text-xs">
            <div>
              <div className="text-slate-400">Issued Digitally By:</div>
              <div className="font-semibold mt-1">Platform Accounts Office</div>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 pb-1"></div>
              <div className="text-slate-400 mt-1">Finance Officer Signature</div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-violet-600 hover:bg-violet-500 text-white">
            <Printer className="w-4 h-4 mr-2" /> Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline import workaround
import { academicYearsApi } from '@/api/academicYears';
