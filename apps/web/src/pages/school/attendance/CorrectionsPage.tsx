import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Button } from '@/components/ui/button';
import { Check, X, ShieldAlert, ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function CorrectionsPage() {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = React.useState<Record<string, string>>({});

  const { data: queue, isLoading } = useQuery({
    queryKey: ['pendingCorrections'],
    queryFn: attendanceApi.getPendingCorrections
  });

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, action, comment }: { requestId: string; action: 'APPROVE' | 'REJECT'; comment?: string }) =>
      attendanceApi.reviewCorrection(requestId, action, comment),
    onSuccess: (_: any, variables: any) => {
      toast.success(`Correction request ${variables.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['pendingCorrections'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process correction');
    }
  });

  const handleReview = (requestId: string, action: 'APPROVE' | 'REJECT') => {
    const comment = commentText[requestId] || '';
    reviewMutation.mutate({ requestId, action, comment });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
          <Link to="/attendance">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Corrections Approval Queue</h1>
          <p className="text-sm text-slate-400">Review teacher attendance change logs requests</p>
        </div>
      </div>

      <div className="space-y-4">
        {queue && queue.length > 0 ? (
          queue.map((req: any) => (
            <div key={req.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {req.session.class.name} - {req.session.section.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Date: {new Date(req.session.attendanceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Requested by: <span className="text-indigo-400 font-medium">{req.requestedBy.firstName} {req.requestedBy.lastName}</span> ({req.requestedBy.email})
                  </p>
                  <p className="mt-2 text-sm italic text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/40">
                    " {req.reason} "
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleReview(req.id, 'APPROVE')}
                    disabled={reviewMutation.isPending}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    onClick={() => handleReview(req.id, 'REJECT')}
                    disabled={reviewMutation.isPending}
                    variant="outline"
                    className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 gap-1.5 text-xs"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proposed Changes:</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {req.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800/40 text-xs">
                      <span className="text-slate-300 font-medium">Record ID: {item.attendanceRecordId.slice(-6)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 line-through">{item.oldStatus}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-yellow-400">{item.requestedStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment Box */}
              <div className="flex items-center gap-2 pt-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <Input
                  value={commentText[req.id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [req.id]: e.target.value }))}
                  placeholder="Review comments / rejection reason notes..."
                  className="h-8 border-slate-800 bg-slate-950 text-slate-100 text-xs"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-850 rounded-xl bg-slate-900/10">
            <ShieldAlert className="h-12 w-12 text-slate-600 animate-pulse" />
            <h3 className="mt-4 font-bold text-slate-400">Review queue empty</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">No student attendance correction requests require administrative approval right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
